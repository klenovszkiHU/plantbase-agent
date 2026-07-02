import { createInterface } from 'node:readline';
import { echo } from '@plantbase/core';

export interface AskOptions {
  showPrompt?: boolean;
}

/**
 * Az `ask` parancs I/O rétege. B1: még csak visszhang (echo).
 * - kérdéssel: egyszeri (single-shot) válasz és kilépés,
 * - kérdés nélkül: interaktív readline mód `exit`-ig.
 * A tényleges válasz-logika a B2 (LLM) és B3 (runSql) fázisban kerül ide.
 */
export function runAsk(
  question: string | undefined,
  _options: AskOptions,
): void {
  const trimmed = question?.trim();
  if (trimmed) {
    console.log(echo(trimmed));
    return;
  }
  runInteractive();
}

function runInteractive(): void {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'plantbase> ',
  });

  console.log('Interaktív mód — írj be egy sort. Kilépés: "exit".');
  rl.prompt();

  rl.on('line', (line) => {
    if (line.trim() === 'exit') {
      rl.close();
      return;
    }
    console.log(echo(line));
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Viszlát!');
  });
}
