# Plantbase — Domain-modell (`products`)

A `products` katalógus domain-modellje: egyetlen aggregátum (`Product`), a mezők
típusaival, oszlop-leképezéseivel, `null`-hatóságával és a származtatott
értékfogalmakkal.

> **Igazságforrás:** `packages/db/prisma/schema.prisma` (`Product` → `@@map("products")`).
> Ez a dokumentum a sémát tükrözi. Eltérés esetén a **séma** a mérvadó; ezt a fájlt
> kell hozzáigazítani (`/ddd` audit), nem fordítva. Fogalmak: `[[glossary]]`.

---

## Aggregátum: `Product`

Önálló, referencia nélküli aggregátum (nincs kapcsolat más entitáshoz). Egy sor =
egy eladható növény. Tábla: `products`. Prisma mezők **camelCase**, DB-oszlopok
**snake_case** (`@map`).

### Mezők

| Domain-fogalom       | Prisma mező       | DB-oszlop           | Típus           | Null?    | Megjegyzés            |
| -------------------- | ----------------- | ------------------- | --------------- | -------- | --------------------- |
| Azonosító            | `id`              | `id`                | `Int`           | —        | PK, `autoincrement()` |
| Köznapi név          | `name`            | `name`              | `String`        | —        |                       |
| Latin név            | `latinName`       | `latin_name`        | `String`        | —        |                       |
| Kategória            | `category`        | `category`          | `String`        | —        | fix értékkészlet ↓    |
| Elhelyezés           | `location`        | `location`          | `String`        | —        | fix értékkészlet ↓    |
| Ár                   | `price`           | `price`             | `Decimal(10,2)` | —        | HUF                   |
| Akciós ár            | `salePrice`       | `sale_price`        | `Decimal(10,2)` | **igen** | `null` = nincs akció  |
| Raktárkészlet        | `stock`           | `stock`             | `Int`           | —        | db                    |
| Fényigény            | `light`           | `light`             | `String`        | —        | fix értékkészlet ↓    |
| Öntözésigény         | `watering`        | `watering`          | `String`        | —        | fix értékkészlet ↓    |
| Nehézség             | `difficulty`      | `difficulty`        | `String`        | —        | fix értékkészlet ↓    |
| Aktuális magasság    | `currentHeightCm` | `current_height_cm` | `Int`           | —        | cm                    |
| Kifejlett magasság   | `maxHeightCm`     | `max_height_cm`     | `Int`           | —        | cm                    |
| Aktuális cserépméret | `currentPotCm`    | `current_pot_cm`    | `Int`           | —        | cm                    |
| Háziállat-barát      | `petSafe`         | `pet_safe`          | `Boolean`       | —        |                       |
| Gyerekbiztos         | `kidSafe`         | `kid_safe`          | `Boolean`       | —        |                       |
| Légtisztító          | `airPurifying`    | `air_purifying`     | `Boolean`       | —        |                       |
| Értékelés            | `rating`          | `rating`            | `Decimal(2,1)`  | —        | 0–5                   |
| Vélemények száma     | `reviewsCount`    | `reviews_count`     | `Int`           | —        |                       |
| Leírás               | `description`     | `description`       | `String`        | —        |                       |

> **Elnevezési megjegyzés (tudatos eltérés):** a booleanek (`petSafe`, `kidSafe`,
> `airPurifying`) **nem** viselik a `konvenciok.md` `is`/`has`/`can` prefixét, mert
> ezek dokumentált **domain-mezők** (a `products` séma része, `CLAUDE.md`). A domain-
> nyelv (`háziállat-barát`, `gyerekbiztos`, `légtisztító`) elsőbbséget élvez; a
> prefix erőltetése domain-drift lenne. Ha a konvenció szigorú, a `konvenciok.md`-ben
> érdemes kivételt rögzíteni — a sémát NE változtassuk emiatt.

---

## Value objectek / fix értékkészletek

A kategorikus mezők **zárt értékkészletek**. Az alkalmazás string-literal-unióként
kezeli őket (nincs DB-enum). Az agent a valós értékekre szűr, nem találgat.

| Mező         | Megengedett értékek                                                                    | Seedben előfordul?                                             |
| ------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `category`   | `szobanövény`, `kerti`, `pozsgás`, `kaktusz`, `fűszer`, `fa-cserje`, `lógó`, `virágzó` | mind                                                           |
| `location`   | `beltéri`, `kültéri`, `mindkettő`                                                      | mind                                                           |
| `light`      | `árnyék`, `alacsony`, `közepes`, `erős`, `direkt nap`                                  | `árnyék` **nem** — engedélyezett, de a seedben nincs           |
| `watering`   | `ritka`, `közepes`, `gyakori`, `állandóan nedves`                                      | `állandóan nedves` **nem** — engedélyezett, de a seedben nincs |
| `difficulty` | `kezdő`, `haladó`, `profi`                                                             | mind                                                           |

> Az `árnyék` és `állandóan nedves` **érvényes** értékek (a séma és a `CLAUDE.md`
> sorolja fel), csak a jelenlegi ~30 elemű seed nem tartalmaz rájuk példát. Nem hiba;
> a szűrés-földelés (`listCategories` / `DISTINCT`) épp ezért fontos: a seed egy adott
> pillanat, nem az értékkészlet definíciója.

---

## Származtatott fogalmak (nincs saját oszlopuk)

| Fogalom          | Számítás                      | Hol számít                                                      |
| ---------------- | ----------------------------- | --------------------------------------------------------------- |
| **Tényleges ár** | `COALESCE(sale_price, price)` | Minden ár-alapú szűrés/rendezés (büdzsé, „legolcsóbb", összár). |
| **Akciós tétel** | `sale_price IS NOT NULL`      | Akciós listák.                                                  |
| **Raktáron**     | `stock > 0`                   | Elérhetőségi szűrés.                                            |
| **Túlnő-e**      | `max_height_cm` vs. tér       | Tanácsadási logika (nem oszlop).                                |

---

## Invariánsok (a séma által garantált)

- `id` egyedi, monoton nő.
- `salePrice` az egyetlen `null`-ozható mező — minden más `NOT NULL`.
- `price`, `salePrice`: `Decimal(10,2)`; `rating`: `Decimal(2,1)`, tartomány 0–5
  (a tartományt a seed tartja, nem DB-constraint).
- A kategorikus mezők értéke a fenti zárt halmazokból való (alkalmazásszinten, nem
  DB-enummal kikényszerítve).

Kapcsolódó: `[[glossary]]` (fogalmak magyar megnevezése és szóhasználat).
