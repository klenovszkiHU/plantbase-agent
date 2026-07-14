# Plantbase — Domain-glosszárium (ubiquitous language)

Ez a dokumentum a plantbase **domain-nyelvét** rögzíti: a `products` katalógus
fogalmait magyarul, egységes szóhasználattal. Cél, hogy a kód, a dokumentáció és az
agent-válaszok **ugyanazokat a szavakat** használják.

> **Igazságforrás:** `packages/db/prisma/schema.prisma` (`Product` modell). Ez a
> dokumentum a sémát _írja le_, nem felülírja. Séma-változás esetén ELŐBB a séma
> változik, UTÁNA ez a glosszárium — sosem fordítva. (Karbantartás: `/ddd` audit.)

---

## Entitás

| Fogalom                 | Angol / kód                  | Jelentés                                                                                                      |
| ----------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Termék** / **Növény** | `Product` (`products` tábla) | A katalógus egyetlen eladható tétele. A domainben „növény" és „termék" szinonim; kódszinten mindig `Product`. |

## Azonosítás és megnevezés

| Fogalom         | Mező                       | Jelentés                                                     |
| --------------- | -------------------------- | ------------------------------------------------------------ |
| **Azonosító**   | `id`                       | Egyedi, gép által generált sorszám (`autoincrement`).        |
| **Köznapi név** | `name`                     | A növény magyar, vásárlónak szóló neve (pl. „Vitorlavirág"). |
| **Latin név**   | `latinName` / `latin_name` | Tudományos fajnév (pl. `Spathiphyllum wallisii`).            |
| **Leírás**      | `description`              | Szabad szöveges, vásárlónak szóló ismertető.                 |

## Kategorizálás (FIX értékkészletek)

Ezek **zárt** értékkészletek — az agent csak a valós értékekre szűrjön
(`listCategories` / `SELECT DISTINCT`), ne találgasson.

| Fogalom          | Mező         | Megengedett értékek                                                                           |
| ---------------- | ------------ | --------------------------------------------------------------------------------------------- |
| **Kategória**    | `category`   | `szobanövény` · `kerti` · `pozsgás` · `kaktusz` · `fűszer` · `fa-cserje` · `lógó` · `virágzó` |
| **Elhelyezés**   | `location`   | `beltéri` · `kültéri` · `mindkettő`                                                           |
| **Fényigény**    | `light`      | `árnyék` · `alacsony` · `közepes` · `erős` · `direkt nap`                                     |
| **Öntözésigény** | `watering`   | `ritka` · `közepes` · `gyakori` · `állandóan nedves`                                          |
| **Nehézség**     | `difficulty` | `kezdő` · `haladó` · `profi` (gondozási igényesség)                                           |

## Ár és készlet

| Fogalom           | Mező                       | Jelentés                                                                                                             |
| ----------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Ár**            | `price`                    | Alap eladási ár, HUF.                                                                                                |
| **Akciós ár**     | `salePrice` / `sale_price` | Kedvezményes ár; `null`, ha nincs akció.                                                                             |
| **Tényleges ár**  | _(származtatott)_          | `COALESCE(sale_price, price)` — minden büdzsé-/összár-számítás EZT használja. Nincs külön oszlopa. Lásd `[[model]]`. |
| **Akciós tétel**  | _(feltétel)_               | `sale_price IS NOT NULL`.                                                                                            |
| **Raktárkészlet** | `stock`                    | Elérhető darabszám.                                                                                                  |
| **Raktáron**      | _(feltétel)_               | `stock > 0`. A „raktáron van" mindig ezt jelenti.                                                                    |

## Méret

| Fogalom                      | Mező                                    | Jelentés                                    |
| ---------------------------- | --------------------------------------- | ------------------------------------------- |
| **Aktuális magasság**        | `currentHeightCm` / `current_height_cm` | A most eladott példány magassága, cm.       |
| **Kifejlett (max) magasság** | `maxHeightCm` / `max_height_cm`         | A faj felnőtt kori maximális magassága, cm. |
| **Aktuális cserépméret**     | `currentPotCm` / `current_pot_cm`       | A jelenlegi cserép átmérője, cm.            |

## Biztonság és tulajdonságok (booleanek)

| Fogalom             | Mező                             | Jelentés                              |
| ------------------- | -------------------------------- | ------------------------------------- |
| **Háziállat-barát** | `petSafe` / `pet_safe`           | `true`, ha háziállatra nem mérgező.   |
| **Gyerekbiztos**    | `kidSafe` / `kid_safe`           | `true`, ha gyerekre nem mérgező.      |
| **Légtisztító**     | `airPurifying` / `air_purifying` | `true`, ha javítja a beltéri levegőt. |

## Értékelés

| Fogalom              | Mező                             | Jelentés                                               |
| -------------------- | -------------------------------- | ------------------------------------------------------ |
| **Értékelés**        | `rating`                         | Átlagos csillagos értékelés, 0–5 skálán (egy tizedes). |
| **Vélemények száma** | `reviewsCount` / `reviews_count` | A leadott értékelések darabszáma.                      |

---

## Szóhasználati megállapodások

- **„növény" = „termék"** a vásárlói kommunikációban; kódban mindig `Product`.
- **„ár"**, ha döntést befolyásol (büdzsé, „legolcsóbb", összár) → **tényleges ár**
  (`COALESCE(sale_price, price)`), NEM a `price`.
- **„raktáron"** → `stock > 0`; **„elérhető"** ugyanez.
- A kategorikus mezők értékeit **magyarul, ékezetesen, kisbetűvel** tároljuk;
  keresés `ILIKE`-kal, ékezethelyesen.

Kapcsolódó: `[[model]]` (mezőnkénti típus- és séma-részletek).
