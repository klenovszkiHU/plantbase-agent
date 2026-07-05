# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Fejlesztői kontextus a Claude Code-nak a **plantbase** agenthez. (Ez NEM a
termék-agent system promptja — az a `packages/core/src/lib/system-prompt.ts`-ben
és a `Docs/system-prompt.md`-ben van.)

A plantbase egy CLI AI agent: természetes nyelvű kérdést SQL-re fordít a
`products` katalógus fölött, **read-only** lefuttatja, és magyar nyelvű választ ad.
Monorepo: `packages/core` (agent-mag), `packages/db` (Prisma séma + seed),
`apps/cli` (parancssori felület). Részletek: `Docs/`.

## A két DB-kapcsolat (két jog)

Szándékosan **két kapcsolat, két jog** — ez a rendszer fő biztonsági eleme (NFR1):

- **`DATABASE_URL`** — READ-WRITE. **Csak a Prisma** használja: séma, migráció, seed.
  Az agent SOHA nem ezen fut.
- **`DATABASE_URL_READONLY`** — READ-ONLY (`plantbase_ro` role, csak SELECT). Az
  agent `runSql` toolja **kizárólag** ezen fut. Kettős védelem: a DB-role mellett
  kódszintű SELECT-only guard is (`packages/core/src/lib/sql-guard.ts`).

Mindkettő a gyökér `.env`-ben (gitignore-olt); minta: `.env.example`.

## `products` séma

```
products(
  id, name, latin_name,
  category,                            -- szobanövény / kerti / pozsgás / kaktusz / fűszer / fa-cserje / lógó / virágzó
  location,                            -- beltéri / kültéri / mindkettő
  price, sale_price, stock,            -- ár, akciós ár (null ha nincs akció), raktárkészlet
  light,                               -- árnyék / alacsony / közepes / erős / direkt nap
  watering,                            -- ritka / közepes / gyakori / állandóan nedves
  difficulty,                          -- kezdő / haladó / profi
  current_height_cm, max_height_cm,    -- aktuális és kifejlett magasság
  current_pot_cm,                      -- aktuális cserépméret
  pet_safe, kid_safe, air_purifying,   -- boolean: háziállat-barát, gyerekbiztos, légtisztító
  rating, reviews_count, description
)
```

A kategorikus mezők (`category`, `location`, `light`, `watering`, `difficulty`)
FIX értékkészletűek (lásd fent). Prisma modell: `Product` → `@@map("products")`,
mezők snake_case `@map`-pel (`packages/db/prisma/schema.prisma`).

## SQL-konvenciók (a `runSql` tool szabályai)

- **CSAK SELECT** (vagy `WITH ... SELECT`). Írás/DDL (INSERT/UPDATE/DELETE/DROP/…)
  tilos — kódszinten és DB-role szinten is.
- **Mindig `LIMIT`** (alapból 20–50; ha hiányzik, a guard 50-et fűz hozzá).
- **Szöveges keresés: `ILIKE`** (kis/nagybetű-független), ékezetesen, pl.
  `name ILIKE '%pozsgás%'`.
- **Ár:** a tényleges ár `COALESCE(sale_price, price)` — büdzsé/összár ezzel.
- **Raktár:** „raktáron" → `stock > 0`.
- Kategorikus szűrés előtt a valós értékre alapozz (`listCategories` vagy
  `SELECT DISTINCT`), ne találgass; ne hivatkozz nem létező oszlopra/táblára.

## Elérhető toolok (`packages/core/src/lib/tools.ts`)

- **`runSql(query)`** — read-only SELECT a `products` táblán a
  `DATABASE_URL_READONLY` kapcsolaton. Zod-validált input, SELECT-only guard,
  auto-`LIMIT`, `statement_timeout`.
- **`listCategories()`** — a létező kategóriák darabszámmal
  (`SELECT category, COUNT(*) … GROUP BY category`). A kategória-szűrés
  földeléséhez, hogy az agent valós értékre szűrjön, ne találgasson.

Az agent-loop (`packages/core/src/lib/ask-agent.ts`) kézzel írt tool-use loop:
amíg `stop_reason === "tool_use"`, lefuttatja a toolt és visszaadja a
`tool_result`-ot. Minden interakció JSONL-be naplózva (`logs/`); API kulcsot soha
nem logol.

## Gyakori parancsok

```bash
# Futtatás
pnpm plantbase ask "<kérdés>"          # egyszeri kérdés (interaktív mód: argumentum nélkül)

# Teszt / lint / build / typecheck (Nx az érintett projektekre)
pnpm nx run-many -t test lint build    # minden projekt
pnpm nx test core                      # egy projekt tesztjei (core | db | cli)
pnpm nx test core -- sql-guard         # EGY teszt-FÁJL (vitest fájlnév-szűrő)
pnpm nx test core -- -t "should allow" # EGY teszt NÉV szerint (vitest -t)
pnpm nx run-many -t typecheck          # tsc típusellenőrzés
pnpm prettier --check .                # formázás (--write a javításhoz)

# Adatbázis (Postgres konténer + Prisma a packages/db-ben)
docker compose up -d                   # lokális Postgres (RW + RO role)
pnpm --filter @plantbase/db prisma:migrate    # migráció (dev) — a séma szinkronban
pnpm --filter @plantbase/db prisma:generate   # Prisma kliens (gitignore-olt, generálni kell)
pnpm --filter @plantbase/db db:seed           # ~30 növény betöltése (idempotens)
```

> Az Nx a projekteket rövid néven is feloldja (`core` = `@plantbase/core`). A `-- ` utáni
> argumentumok a Vitesthez mennek: fájlnév-részlet a fájl-szűréshez, `-t "<név>"` egy teszthez.
> A `pnpm plantbase` a forrásból fut (`tsx`, `@plantbase/source` feltétel) — nem kell build.

## Munkamódszer

`Docs/dev-workflow.md`: `main`-re **csak PR-en át**, feature ágról (`feat/`, `fix/`,
`docs/`, `chore/`), Conventional Commits, kicsi fókuszált commitok. Új/ritka
library API előtt olvasd be a friss doksit, mielőtt kódolsz.
