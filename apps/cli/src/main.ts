import { buildProgram } from './app/program.js';

// A plantbase CLI belépési pontja. A program felépítése a program.ts-ben van
// (tesztelhető), itt csak az argv feldolgozása történik.
buildProgram().parse();
