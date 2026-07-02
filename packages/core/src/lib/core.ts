/**
 * A `packages/core` a plantbase agent framework-agnostic magja: nem ismeri a
 * belépési pontot (CLI/API/web). Ez a skeleton-export az A2 fázis füsttesztje;
 * a valódi agent-logika (echo → askAgent → tool-use loop) a B fázisokban kerül ide.
 */
export function coreName(): string {
  return '@plantbase/core';
}
