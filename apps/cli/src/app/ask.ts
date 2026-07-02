import { createInterface } from 'node:readline';
import {
  askAgent,
  type AskAgentOptions,
  type AskAgentResult,
} from '@plantbase/core';

/**
 * Az `ask` parancs I/O rétege. B2: valódi LLM-hívás DB nélkül.
 * - kérdéssel: egyszeri (single-shot) válasz és kilépés,
 * - kérdés nélkül: interaktív readline mód `exit`-ig.
 * A --show-prompt a modellnek küldött teljes prompt-ot is kiírja (FR5).
 */
export async function runAsk(
  question: string | undefined,
  options: AskAgentOptions,
): Promise<void> {
  const trimmed = question?.trim();
  if (trimmed) {
    await answerOnce(trimmed, options);
    return;
  }
  await runInteractive(options);
}

function printPrompt(result: AskAgentResult): void {
  console.log('--- system prompt ---');
  console.log(result.systemPrompt);
  console.log('--- messages ---');
  console.log(JSON.stringify(result.messages, null, 2));
  console.log('--- válasz ---');
}

async function answerOnce(
  question: string,
  options: AskAgentOptions,
): Promise<void> {
  const result = await askAgent(question, options);
  if (options.showPrompt) {
    printPrompt(result);
  }
  console.log(result.answer);
}

async function runInteractive(options: AskAgentOptions): Promise<void> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'plantbase> ',
  });

  console.log('Interaktív mód — kérdezz a növényekről. Kilépés: "exit".');
  rl.prompt();

  for await (const line of rl) {
    const trimmed = line.trim();
    if (trimmed === 'exit') {
      break;
    }
    if (!trimmed) {
      rl.prompt();
      continue;
    }
    try {
      await answerOnce(trimmed, options);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Hiba: ${message}`);
    }
    rl.prompt();
  }

  rl.close();
  console.log('Viszlát!');
}
