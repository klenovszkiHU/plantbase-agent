import Anthropic from '@anthropic-ai/sdk';
import { loadConfig } from './config.js';
import { createInteractionLogger } from './logger.js';
import { buildSystemPrompt } from './system-prompt.js';

// B2: egyetlen LLM-hívás, tool NÉLKÜL. A rendszer-prompt kifejezetten közli, hogy
// nincs DB-hozzáférés; adat-kérdésnél az agent őszintén nemet mond. A tool-use loop
// és a runSql a B3-ban kerül ide.

// A válasz tömör; a katalógus-adat nélküli fázisban 1024 token bőven elég.
const MAX_TOKENS = 1024;

export interface AskAgentOptions {
  /** A modellnek küldött teljes prompt visszaadása/kiírása (FR5). */
  showPrompt?: boolean;
  /** Naplókönyvtár (alapból "logs"). */
  logDir?: string;
}

export interface AskAgentResult {
  answer: string;
  model: string;
  systemPrompt: string;
  messages: Anthropic.MessageParam[];
  usage: { inputTokens: number; outputTokens: number };
}

export async function askAgent(
  question: string,
  options: AskAgentOptions = {},
): Promise<AskAgentResult> {
  const config = loadConfig();
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const systemPrompt = buildSystemPrompt({ dbAccess: false });
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: question },
  ];

  const logger = createInteractionLogger(options.logDir);
  logger.log({
    type: 'request',
    model: config.anthropicModel,
    system: systemPrompt,
    messages,
  });

  const response = await client.messages.create({
    model: config.anthropicModel,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages,
  });

  const answer = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  const usage = {
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };

  logger.log({
    type: 'response',
    stopReason: response.stop_reason,
    answer,
    usage,
  });

  return {
    answer,
    model: config.anthropicModel,
    systemPrompt,
    messages,
    usage,
  };
}
