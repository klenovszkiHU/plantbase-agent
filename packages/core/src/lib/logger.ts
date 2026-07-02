import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Átláthatóság (FR4): minden interakciót JSONL-be naplózunk. Egy interakció =
// egy fájl (logs/<timestamp>.jsonl), soronként egy JSON-rekord (request, response,
// B3-tól tool-lépések). Titkot (API kulcs) SOHA nem logolunk.
export interface InteractionLogger {
  readonly filePath: string;
  log(record: Record<string, unknown>): void;
}

function timestampSlug(now: Date): string {
  return now.toISOString().replace(/[:.]/g, '-');
}

export function createInteractionLogger(
  logDir = 'logs',
  now: Date = new Date(),
): InteractionLogger {
  mkdirSync(logDir, { recursive: true });
  const filePath = join(logDir, `${timestampSlug(now)}.jsonl`);

  return {
    filePath,
    log(record) {
      const line = JSON.stringify({ ts: new Date().toISOString(), ...record });
      appendFileSync(filePath, `${line}\n`, 'utf8');
    },
  };
}
