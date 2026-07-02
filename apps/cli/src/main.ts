// A .env betöltése ELSŐKÉNT, mielőtt a core config beolvassa a process.env-et.
// A repo gyökeréből futtatva (pnpm plantbase) a gyökér .env-et tölti be.
import 'dotenv/config';
import { buildProgram } from './app/program.js';

// A plantbase CLI belépési pontja. A parancsok aszinkronok (LLM-hívás), ezért
// parseAsync; a hibát itt, a határon kezeljük (beszédes üzenet, nem-nulla exit).
buildProgram()
  .parseAsync()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`plantbase hiba: ${message}`);
    process.exitCode = 1;
  });
