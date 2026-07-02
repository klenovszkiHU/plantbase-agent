import { Command } from 'commander';
import { coreName } from '@plantbase/core';

// A CLI verziója (a --version ezt írja ki). Külön a package.json version-től,
// hogy ne kelljen futásidőben JSON-t olvasni ESM-ben.
export const CLI_VERSION = '0.1.0';

export interface AskOptions {
  showPrompt?: boolean;
}

/**
 * A `plantbase` commander program felépítése. Külön függvény, hogy egységgel
 * tesztelhető legyen (nem indít folyamatot, nem olvas argv-t). A tényleges
 * parancs-logika rétegről rétegre épül: A6 placeholder → B1 echo → B2 LLM → B3 runSql.
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
      'a katalógusra vonatkozó kérdés; ha elhagyod, később interaktív mód indul',
    )
    .description('Kérdés a növény-katalógusról (A6: még nincs implementálva)')
    .option('--show-prompt', 'a modellnek küldött teljes prompt kiírása')
    .action((question: string | undefined, options: AskOptions) => {
      // A6: sem LLM, sem DB. A rétegek a B fázisokban kerülnek be.
      console.log(
        `plantbase ask — még nincs implementálva (core betöltve: ${coreName()}).`,
      );
      if (question) {
        console.log(`Kaptam egy kérdést: "${question}"`);
      }
      if (options.showPrompt) {
        console.log('(--show-prompt: a B2 fázistól lesz tartalma.)');
      }
    });

  return program;
}
