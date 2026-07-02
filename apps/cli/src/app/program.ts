import { Command } from 'commander';
import { runAsk } from './ask.js';

// A CLI verziója (a --version ezt írja ki). Külön a package.json version-től,
// hogy ne kelljen futásidőben JSON-t olvasni ESM-ben.
export const CLI_VERSION = '0.1.0';

/**
 * A `plantbase` commander program felépítése. Külön függvény, hogy egységgel
 * tesztelhető legyen (nem indít folyamatot, nem olvas argv-t). A tényleges
 * válasz-logika rétegről rétegre épül: B1 echo → B2 LLM → B3 runSql.
 */
export function buildProgram(): Command {
  const program = new Command();

  program
    .name('plantbase')
    .description(
      'Plantbase — természetes nyelvű kérdés-válasz a növény-katalógus felett',
    )
    .version(CLI_VERSION, '-v, --version', 'a verzió kiírása');

  program
    .command('ask')
    .argument(
      '[kérdés]',
      'a katalógusra vonatkozó kérdés; ha elhagyod, interaktív mód indul',
    )
    .description('Kérdés a növény-katalógusról (B2: LLM, még DB nélkül)')
    .option('--show-prompt', 'a modellnek küldött teljes prompt kiírása')
    .action(runAsk);

  return program;
}
