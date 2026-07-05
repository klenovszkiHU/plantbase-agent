# plantbase-agent

Parancssori (CLI) AI agent egy növény-webshop katalógusa fölött. A felhasználó
hétköznapi nyelven kérdez, az agent ezt **SQL-re fordítja**, **read-only**
lefuttatja a `products` táblán, és a sorokból érthető, **magyar nyelvű** választ
ad. SQL-tudás nélkül, önkiszolgáló módon kérdezhetsz az adatból.

A részletes háttér a [`Docs/`](Docs/) mappában: üzleti követelmény (BRS),
architektúra, tech stack, konvenciók, ROI és a termék-agent system promptja.

## Mit tud

- **NL → SQL → NL válasz** a katalógus fölött (pl. „mutass pet-safe, alacsony
  fényű növényt 5000 Ft alatt, raktáron").
- **Csomag-összeállítás** büdzsével: összár-számítás, méret- és fény-illesztés,
  visszakérdés a hiányzó adatra.
- **Soha nem módosít adatot** — csak SELECT, read-only kapcsolaton (kettős
  védelem: kódszintű guard + DB read-only role).
- **Átlátható:** minden interakció JSONL-be naplózva (`logs/`), és a
  `--show-prompt` kiírja a modellnek küldött teljes promptot.

## Követelmények

| Eszköz                  | Megjegyzés                                               |
| ----------------------- | -------------------------------------------------------- |
| **Node.js LTS** (≥ 20)  | a futtatókörnyezet                                       |
| **pnpm**                | corepack-kel: `corepack enable pnpm`                     |
| **Docker / OrbStack**   | a lokális Postgres-t futtatja (macOS: OrbStack ajánlott) |
| **Anthropic API kulcs** | a termék-agent LLM-hívásaihoz                            |

## Beüzemelés

```bash
# 1) Függőségek
pnpm install

# 2) Titkok: másold a példát és töltsd ki az API kulcsot
cp .env.example .env
#   ANTHROPIC_API_KEY=...  (a DATABASE_URL / DATABASE_URL_READONLY defaultja
#   már illeszkedik a docker-compose-hoz)

# 3) Lokális Postgres (RW + read-only role) indítása
docker compose up -d

# 4) Séma migrálása, Prisma kliens generálása, seed betöltése (~30 növény)
pnpm --filter @plantbase/db prisma:migrate
pnpm --filter @plantbase/db prisma:generate
pnpm --filter @plantbase/db db:seed
```

A `.env` **sosem** kerül a repóba (gitignore-olt). Alapértelmezett modell:
`claude-haiku-4-5` — a `.env`-ben `ANTHROPIC_MODEL`-lel felülírható (pl.
`claude-sonnet-5` a konzisztensebb kimenetért).

## Futtatás

```bash
# Egyszeri kérdés
pnpm plantbase ask "Milyen alacsony fényt bíró szobanövényeim vannak 5000 Ft alatt, raktáron?"

# Interaktív mód (argumentum nélkül) — kilépés: exit
pnpm plantbase ask

# A teljes prompt megjelenítése (átláthatóság)
pnpm plantbase ask "van pozsgásod?" --show-prompt

# Súgó
pnpm plantbase --help
```

## Példakérdések

```text
Mutass max 3 pet-safe, alacsony fényigényű növényt, ami raktáron van és 5000 Ft alatt.
Milyen növény-kategóriák vannak, és melyikből van a legtöbb?
Állíts össze egy 3 növényes csomagot világos nappaliba 15000 Ft alatt, kezdőbarát fajokból; add meg az összárat.
Mely növények vannak most akcióban?
Milyen fűszernövényt ajánlasz konyhába, ami háziállat-barát?
```

> Módosító kérést (pl. „töröld a…") az agent elutasít — csak olvasni tud.

## Fejlesztés

```bash
pnpm nx run-many -t test    # Vitest (unit + integrációs)
pnpm nx run-many -t lint    # ESLint
pnpm nx run-many -t build   # tsc / esbuild
pnpm prettier --check .     # formázás
```

Monorepo (Nx): `packages/core` (agent-mag), `packages/db` (Prisma séma + seed),
`apps/cli` (parancssori felület). A döntések indoklása: [`Docs/architektura.md`](Docs/architektura.md).

## Adatkezelés

⚠️ **Adatvédelem:** statisztikai / kutatási adatfájlok (`.sav`, `.zsav` stb.)
**nem** kerülnek verziókövetésbe — lásd `.gitignore`. Az érzékeny adatok a
szervezeten belül maradnak. A `.env` (API kulcs, DB-jelszavak) szintén
gitignore-olt.
