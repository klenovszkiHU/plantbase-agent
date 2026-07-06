---
name: ddd-audit
description: Use when the products schema / domain entities changed and the DDD docs may be stale — compares git history + Prisma schema against docs/ddd/glossary.md and docs/ddd/model.md and proposes updates. Triggers on schema-migration merges, new/renamed/removed entity fields, changed categorical value sets (category/location/light/watering/difficulty), or a "DDD audit / doc-freshness" request.
---

# DDD-audit (séma ↔ domain-doksi konzisztencia)

## Mit csinál

A plantbase **séma-igazságát** (Prisma modell + seed + `CLAUDE.md`) veti össze a
**domain-dokumentációval** (`docs/ddd/glossary.md`, `docs/ddd/model.md`), a
git-history-t használva „mi változott" jelként. Eltéréseknél **konkrét
diff-javaslatot** ad, de **csak jóváhagyás után** ír át doksit (human-in-the-loop).

**Alapelv:** a séma az igazság forrása; a doksi követi. A skill soha nem javasol
sémaváltoztatást a doksi kedvéért — mindig a doksit igazítja a sémához.

## A séma-igazság forrásai (ebben a sorrendben)

1. **Prisma modell** — `packages/db/prisma/schema.prisma` (`Product` → `@@map("products")`).
   Ez az entitások és mezők kanonikus listája; a `@map(...)` adja a DB-oszlopnevet.
2. **Értékkészletek** — a fix-értékű kategorikus mezők (`category`, `location`,
   `light`, `watering`, `difficulty`) valós értékei. Elsődleges: a séma sor-menti
   kommentjei; megerősítés: a seed (`packages/db/prisma/seed-data/`, `seed.ts`) tényleges
   `DISTINCT` értékei. Ne találgass — ezekre alapozz.
3. **`CLAUDE.md`** — a `products` séma emberi leírása; ha eltér a Prismától, a
   Prisma nyer, és a `CLAUDE.md`-t is jelöld frissítendőnek.

## A domain-doksik (audit célpontja)

- `docs/ddd/glossary.md` — ubiquitous language (növény, kategória, fényigény,
  gondozás, akciós ár, raktárkészlet…): fogalom → jelentés → séma-megfelelő mező.
- `docs/ddd/model.md` — entitások, value objectek, aggregátumok; a `Product`
  aggregátum mezői, típusai, invariánsai.

Ha ezek **hiányoznak**, előbb bootstrap (lásd lentebb), utána audit.

## Workflow

### 1. Bootstrap, ha hiányzik a doksi

Ha `docs/ddd/glossary.md` vagy `docs/ddd/model.md` nem létezik:
- Generáld le a kezdő tartalmat a Prisma modellből + `CLAUDE.md`-ből + seed
  értékkészletekből (minden mező, típus, `@map` oszlopnév, fix értékkészletek).
- Ez maga is egy javaslat: mutasd meg, és **jóváhagyás után** írd ki a fájlokat.
- Bootstrap után nincs mit auditálni (frissen szinkronban van) — jelezd, és állj le.

### 2. Git-history: mi változott

Keresd a séma-érintő változásokat az utolsó audit óta (ha van jel rá — pl. a
`docs/ddd/` utolsó commitja —, onnantól; egyébként az utolsó néhány commit):

```bash
# Séma-fájl változásai
git log --oneline -20 -- packages/db/prisma/schema.prisma packages/db/prisma/migrations

# A doksi legutóbbi frissítése (referencia-időpont az audit-ablakhoz)
git log --oneline -1 -- docs/ddd/

# Konkrét mező-szintű diff a doksi utolsó commitja óta (cseréld ki a SHA-t)
git diff <docs-ddd-utolsó-sha>..HEAD -- packages/db/prisma/schema.prisma
```

A diffből olvasd ki: **új mező**, **eltűnt/átnevezett mező** (`@map` váltás is!),
**változott értékkészlet-komment**. A git-history csak jel — az összevetés
igazsága mindig az **aktuális** séma állapota, nem a diff.

### 3. Összevetés (séma ↔ doksi)

Építs mező-halmazt a sémából és a `model.md`-ből, majd vesd össze. Nézd a
`glossary.md` fogalmait is (van-e mögöttük valós mező, jó-e a jelentés).

### 4. Riport + javaslat

Add ki a lenti riport-formát, konkrét diff-javaslattal. **Csak jóváhagyás után**
írd át a `docs/ddd/` fájlokat (és jelöld, ha a `CLAUDE.md` séma-blokkja is elavult).

## Eltérés-típusok (mit keress)

| Típus | Jel | Javaslat |
|---|---|---|
| **Új mező** | sémában van, `model.md`-ből hiányzik | mező felvétele `model.md`-be + fogalom a `glossary.md`-be |
| **Eltűnt mező** | `model.md`-ben van, sémából eltűnt | törlés/„deprecated" jelölés a doksiban |
| **Átnevezett mező** | `@map` vagy név változott | doksi-mezőnév + oszlopnév frissítése, régi név megemlítése |
| **Változott értékkészlet** | fix-értékű mező komment/seed-értékei bővültek/szűkültek | értéklista frissítése `model.md` + `glossary.md`-ben |
| **Típus/constraint drift** | pl. `Decimal(10,2)`, `null`-hatóság (`salePrice?`) eltér | value object / invariáns pontosítása `model.md`-ben |
| **Glosszárium-hiány** | domain-fogalomnak nincs bejegyzése | új glossary-sor a séma-mező megfelelővel |
| **Séma-doc drift** | `CLAUDE.md` séma-blokk eltér a Prismától | `CLAUDE.md` frissítés jelölése (Prisma az igazság) |

## Riport-formátum (magyar, tanácsadói)

```
## DDD-audit — <dátum>
Audit-ablak: <docs/ddd utolsó commit> → HEAD (<N> séma-érintő commit)

### Összefoglaló
<1-2 mondat: szinkronban van / X eltérés, ebből Y kritikus>

### Eltérések
1. [ÚJ MEZŐ] `products.<oszlop>` (Prisma: `<mező>`) — hiányzik a model.md-ből.
   Séma: <típus, @map, komment>. → Javaslat: <konkrét sor a model.md/glossary.md-be>.
2. [ÉRTÉKKÉSZLET] `category` — a seed tartalmaz „<új érték>"-t, a glossary.md nem.
   ...

### Javasolt doksi-diff
<fájlonként a pontos betoldás/módosítás; egyértelmű, hogy hova>

### Human-in-the-loop
<jóváhagyás-kérés; ha jogi/etikai/üzleti döntés kell (pl. fogalom átnevezése),
külön jelöld, hogy emberi döntést igényel>
```

## Gyakori hibák

- **Séma módosítása a doksi kedvéért.** Soha. A séma az igazság; csak a doksi mozog.
- **Értékkészlet találgatása.** Ne a fejedből írd a `category`/`light` értékeket —
  a séma-kommentből és a seedből olvasd ki (a `CLAUDE.md`-ben és a
  `system-prompt.md`-ben lévő lista is elavulhat).
- **`@map` figyelmen kívül hagyása.** Az átnevezés a DB-oszlopnév (`@map`) szintjén
  is történhet a Prisma-mezőnév változása nélkül, és fordítva — mindkettőt nézd.
- **Doksi átírása jóváhagyás nélkül.** A skill javasol; a felhasználó dönt.
- **Git-diff mint igazság.** A diff csak „hol nézz" jel; az összevetés alapja az
  aktuális séma-állapot.

## Kapcsolódó

- Konvenciók: `Docs/dev-workflow.md` (`/docs` struktúra + ez a skill), `CLAUDE.md`.
- Git-workflow a doksi-commitokhoz: feature branch (`docs/…`), Conventional Commits,
  `main`-re csak PR-en át (lásd `Docs/dev-workflow.md`).
