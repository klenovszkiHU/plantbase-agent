import Anthropic from '@anthropic-ai/sdk';
import { loadConfig } from './config.js';
import { createReadonlyPool } from './db-readonly.js';
import { createInteractionLogger } from './logger.js';
import { buildSystemPrompt } from './system-prompt.js';
import { executeTool, TOOLS } from './tools.js';

// B3: kézzel írt tool-use loop az @anthropic-ai/sdk messages.create fölött
// (nem a SDK toolRunner-e, hogy a mechanika látható maradjon). Amíg a modell
// tool-t hív (stop_reason === "tool_use"), lefuttatjuk a runSql/listCategories
// toolt a read-only kapcsolaton, visszaadjuk a tool_result-ot, és újra hívunk.

const MAX_TOKENS = 2048;
// Biztonsági korlát a végtelen loop ellen (a modell hibás esetben pöröghetne).
const MAX_STEPS = 8;

export interface AskAgentOptions {
  showPrompt?: boolean;
  logDir?: string;
}

export interface AskAgentResult {
  answer: string;
  model: string;
  systemPrompt: string;
  messages: Anthropic.MessageParam[];
  usage: { inputTokens: number; outputTokens: number };
  steps: number;
}

function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

export async function askAgent(
  question: string,
  options: AskAgentOptions = {},
): Promise<AskAgentResult> {
  const config = loadConfig();
  const client = new Anthropic({ apiKey: config.anthropicApiKey });
  const pool = createReadonlyPool(config.databaseUrlReadonly);

  const systemPrompt = buildSystemPrompt({ dbAccess: true });
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  const logger = createInteractionLogger(options.logDir);
  logger.log({
    type: 'request',
    model: config.anthropicModel,
    system: systemPrompt,
    question,
  });

  const usage = { inputTokens: 0, outputTokens: 0 };
  let answer = '';
  let steps = 0;

  try {
    for (steps = 1; steps <= MAX_STEPS; steps += 1) {
      const response = await client.messages.create({
        model: config.anthropicModel,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      });

      usage.inputTokens += response.usage.input_tokens;
      usage.outputTokens += response.usage.output_tokens;
      logger.log({
        type: 'assistant',
        step: steps,
        stopReason: response.stop_reason,
        content: response.content,
      });

      messages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason !== 'tool_use') {
        answer = extractText(response.content);
        break;
      }

      // Minden tool_use blokkot lefuttatunk, és EGY user üzenetben adjuk vissza
      // az összes tool_result-ot (az SDK ezt várja).
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const result = await executeTool(
            block.name,
            block.input,
            pool,
            logger,
          );
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result.content,
            is_error: result.isError,
          });
        }
      }
      messages.push({ role: 'user', content: toolResults });
    }

    if (!answer) {
      answer =
        'Nem sikerült végleges választ adni a megengedett lépésszámon belül.';
    }
  } finally {
    await pool.end();
  }

  logger.log({ type: 'final', answer, usage, steps });
  return {
    answer,
    model: config.anthropicModel,
    systemPrompt,
    messages,
    usage,
    steps,
  };
}
