import type Anthropic from '@anthropic-ai/sdk';
import type pg from 'pg';
import { z } from 'zod';
import { runReadonlyQuery } from './db-readonly.js';
import { assertSelectOnly, ensureLimit } from './sql-guard.js';
import type { InteractionLogger } from './logger.js';

const DEFAULT_LIMIT = 50;
// A tool-eredmény ne fújja fel a kontextust: maximum ennyi karakter mehet vissza.
const MAX_RESULT_CHARS = 8000;

export const RUN_SQL_TOOL_NAME = 'runSql';
export const LIST_CATEGORIES_TOOL_NAME = 'listCategories';

export const TOOLS: Anthropic.Tool[] = [
  {
    name: RUN_SQL_TOOL_NAME,
    description:
      'Read-only SQL futtatása a products katalóguson. CSAK SELECT (vagy WITH ... SELECT). ' +
      'A tényleges ár COALESCE(sale_price, price). Ha nincs LIMIT, a rendszer 50-et tesz.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'A futtatandó SELECT lekérdezés a products tábla felett.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: LIST_CATEGORIES_TOOL_NAME,
    description:
      'A products tábla létező kategóriái darabszámmal. Használd, hogy a kategória-szűrést ' +
      'valós értékekre alapozd, ne találgass kategórianevet.',
    input_schema: { type: 'object', properties: {} },
  },
];

const RunSqlInput = z.object({ query: z.string().min(1, 'Üres query.') });

export interface ToolResult {
  content: string;
  isError: boolean;
}

function truncate(text: string): string {
  return text.length > MAX_RESULT_CHARS
    ? `${text.slice(0, MAX_RESULT_CHARS)}\n… (levágva)`
    : text;
}

async function runSql(
  input: unknown,
  pool: pg.Pool,
  logger: InteractionLogger,
): Promise<ToolResult> {
  const parsed = RunSqlInput.safeParse(input);
  if (!parsed.success) {
    return {
      content: 'Hibás tool-input: a "query" mező kötelező.',
      isError: true,
    };
  }

  try {
    assertSelectOnly(parsed.data.query);
    const sql = ensureLimit(parsed.data.query, DEFAULT_LIMIT);
    logger.log({ type: 'tool_call', tool: RUN_SQL_TOOL_NAME, sql });

    const { rows, rowCount } = await runReadonlyQuery(pool, sql);
    logger.log({ type: 'tool_result', tool: RUN_SQL_TOOL_NAME, rowCount });
    return { content: truncate(JSON.stringify(rows)), isError: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.log({ type: 'tool_error', tool: RUN_SQL_TOOL_NAME, message });
    return { content: `SQL hiba: ${message}`, isError: true };
  }
}

async function listCategories(
  pool: pg.Pool,
  logger: InteractionLogger,
): Promise<ToolResult> {
  const sql =
    'SELECT category, COUNT(*)::int AS count FROM products GROUP BY category ORDER BY count DESC';
  try {
    logger.log({ type: 'tool_call', tool: LIST_CATEGORIES_TOOL_NAME, sql });
    const { rows, rowCount } = await runReadonlyQuery(pool, sql);
    logger.log({
      type: 'tool_result',
      tool: LIST_CATEGORIES_TOOL_NAME,
      rowCount,
    });
    return { content: JSON.stringify(rows), isError: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.log({
      type: 'tool_error',
      tool: LIST_CATEGORIES_TOOL_NAME,
      message,
    });
    return { content: `Hiba: ${message}`, isError: true };
  }
}

export async function executeTool(
  name: string,
  input: unknown,
  pool: pg.Pool,
  logger: InteractionLogger,
): Promise<ToolResult> {
  if (name === RUN_SQL_TOOL_NAME) {
    return runSql(input, pool, logger);
  }
  if (name === LIST_CATEGORIES_TOOL_NAME) {
    return listCategories(pool, logger);
  }
  return { content: `Ismeretlen tool: ${name}`, isError: true };
}
