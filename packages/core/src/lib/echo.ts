/**
 * A B1 fázis tiszta magja: visszhangozza a bemenetet `echo: ` előtaggal.
 * Szándékosan I/O-mentes, hogy egységgel tesztelhető legyen; az olvasás/írás
 * a CLI (apps/cli) felelőssége. A B2-től ezt váltja fel az askAgent LLM-hívása.
 */
export function echo(input: string): string {
  return `echo: ${input}`;
}
