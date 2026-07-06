---
description: DDD-audit — a products séma (Prisma + seed) és a docs/ddd/ domain-doksik (glossary.md, model.md) összevetése, eltérésekre javaslat (human-in-the-loop).
argument-hint: "[opcionális: fókusz, pl. 'csak category értékkészlet' vagy 'utolsó 3 commit']"
---

Futtasd le a **ddd-audit** skillt (`.claude/skills/ddd-audit/SKILL.md`), és kövesd pontosan.

Röviden, amit tenned kell:

1. **Séma-igazság begyűjtése** — olvasd be `packages/db/prisma/schema.prisma` (a `Product`
   modell mezői + `@map` oszlopnevek + kommentek), a fix értékkészletekhez a seedet
   (`packages/db/prisma/seed-data/`, `seed.ts`), és a `CLAUDE.md` `products` blokkját.
2. **Git-history** — `git log`/`git diff` a `schema.prisma`-n és a migrációkon a
   `docs/ddd/` utolsó commitja óta; ebből olvasd ki az új / eltűnt / átnevezett mezőt
   és a változott értékkészletet.
3. **Doksi beolvasása** — `docs/ddd/glossary.md` és `docs/ddd/model.md`. Ha **hiányoznak**,
   bootstrap: generálj kezdő tartalmat a sémából + `CLAUDE.md`-ből (jóváhagyás után írd ki).
4. **Összevetés + riport** — a SKILL.md riport-formátuma szerint, magyarul, tanácsadói
   nézőponttal: mit jelent az eltérés és milyen doksi-frissítést indokol.
5. **Human-in-the-loop** — a konkrét diff-javaslatot mutasd meg, és **csak jóváhagyás után**
   írd át a `docs/ddd/` fájlokat. A séma az igazság forrása — soha ne javasolj
   sémaváltoztatást a doksi kedvéért. Jelöld, ha a `CLAUDE.md` séma-blokkja is elavult.

Ha kaptál fókusz-argumentumot, arra szűkíts: $ARGUMENTS
