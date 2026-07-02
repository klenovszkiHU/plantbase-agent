# Plantbase — megtérülés (ROI) egy lakberendezőnek

> Ügyfélnek szóló, döntés-előkészítő anyag. A számok **feltételezésekre** épülnek (lásd a
> záró szakaszt); cseréld ki a saját adataidra. Üzleti/pénzügyi következtetés — érdemes
> emberi jóváhagyással véglegesíteni.

## A kérdés, amire válaszol

Nem azt kérdezzük, „mennyibe kerül egy AI-eszköz", hanem azt: **mennyit ér, ha egy ügyfél-ajánlat
összeállítása 10-15 perc helyett 5 perc alatt kész, és közben olcsóbb, jobban illeszkedő
növénycsomagot kapsz?** A plantbase nem egy újabb szoftver a listán — a katalógus fölötti
keresgélést, méricskélést és készlet-ellenőrzést váltja ki egyetlen természetes nyelvű kérdéssel.

## A mai helyzet (ahol az idő elmegy)

Egy ügyfél átlagosan 3 szoba. Ma szobánként **10-15 perc** megy el webshop-nézegetéssel,
mérethelyesség-ellenőrzéssel (belefér-e a térbe most és kifejletten), raktárkészlet- és
akció-figyeléssel, és a büdzsé kontrollálásával. Ez aprómunka, ami SQL-tudást vagy elemzőt
igényelne — ezért marad kézi keresgélés.

## Hard ROI — a forintosítható rész

### 1) Időmegtakarítás → felszabaduló kapacitás

| Tétel                    | Feltételezés               | Érték             |
| ------------------------ | -------------------------- | ----------------- |
| Szoba / ügyfél           | 3                          |                   |
| Ügyfél / hó              | 5                          | → **15 szoba/hó** |
| Kézi idő / szoba         | 12,5 perc (a 10-15 közepe) |                   |
| Plantbase-idő / szoba    | 4 perc (KPI: < 5 perc)     |                   |
| **Megtakarítás / szoba** |                            | **~8,5 perc**     |
| **Megtakarítás / hó**    | 15 × 8,5 perc              | **~2,1 óra**      |
| **Megtakarítás / év**    |                            | **~25,5 óra**     |

**Kétféleképpen fordítható pénzre — és a második a fontosabb:**

- **Költségoldal:** 10 000 Ft/óra effektív munkadíjjal ~**21 000 Ft/hó**, ~**255 000 Ft/év**
  megtakarított munkaidő. (A 10 000 Ft/óra feltételezés — cseréld a sajátodra.)
- **Bevételoldal (a nagyobb tétel):** a felszabaduló ~2 óra/hó nem „megspórolt költség", hanem
  **eladható kapacitás** — nagyjából egy plusz szoba-konzultáció havonta ugyanannyi munkaóra alatt.
  Egy lakberendezőnél a szűk keresztmetszet az idő, nem a szoftver ára; itt van az igazi tét.

### 2) Olcsóbb kosár — ugyanaz kevesebbért

A plantbase a `COALESCE(sale_price, price)` logikával **mindig az akciós árral számol**, és pillanatok
alatt megtalálja az ár-érték alternatívát (pl. ugyanaz a fény- és méretigény olcsóbb fajjal).

| Tétel               | Feltételezés                  | Érték              |
| ------------------- | ----------------------------- | ------------------ |
| Növénykosár / szoba | 60 000 Ft                     |                    |
| Reális megtakarítás | 5% (akció + jobb alternatíva) | 3 000 Ft/szoba     |
| **Havi 15 szobára** |                               | **~45 000 Ft/hó**  |
| **Éves**            |                               | **~540 000 Ft/év** |

> Ez a tétel érzékeny a kosárméretre és a megtakarítási %-ra — ezért van külön sorban, hogy a saját
> számaiddal újraszámolható legyen. Már 3-5% is nagyságrendekkel felülmúlja az eszköz üzemeltetési
> költségét (lásd lent).

### 3) Üzemeltetési költség — elenyésző (valós mérés)

A projekt eddigi **tényleges** naplói alapján egy kérdés átlagosan ~3 143 bemeneti + ~393 kimeneti
token, ami a jelenlegi (költséghatékony) modellen **~2 Ft / kérdés**. Egy szoba jellemzően 2-4 kérdés
→ **~5-8 Ft/szoba**. Havi 15 szoba: **nagyságrendileg 100-150 Ft/hó** LLM-költség.

**A megtakarítás és a működési költség aránya három-négy nagyságrend.** A döntés nem költségkérdés,
hanem kapacitás- és minőségkérdés.

## Soft ROI — valós, de nehezen forintosítható

- **Magasabb ügyfélélmény:** gyorsabb, pontosabb ajánlat → nagyobb lezárási arány, több ajánlás.
- **Jobb minőségű munka:** a tér adottságaihoz (fény, méret) és a büdzséhez pontosabban illeszkedő
  csomag → kevesebb reklamáció és visszacsere.
- **Kevesebb kognitív teher:** a keresgélés helyett a lakberendező a kreatív döntésre koncentrál.

## Mit tegyél ezzel? (actionable)

1. **Cseréld ki a három feltételezést** (óradíj, kosárméret, megtakarítási %) a saját adataidra —
   a fenti táblák azonnal újraszámolnak.
2. **Mérj két hetet:** vezess egyszerű naplót a szobánkénti időről a plantbase-zel és nélküle. A
   KPI (1 szoba < 5 perc) így válik bizonyítottá, nem feltételezetté.
3. **Kezdd a legszűkebb keresztmetszetnél:** ha most ügyfelet utasítasz vissza időhiány miatt, a
   bevételoldali érv (plusz kapacitás) azonnal érvényesül.
4. **Bővítési irány:** a korábbi ajánlásaid elemzése (ugyanaz olcsóbban, jobb alternatíva) — ehhez az
   ajánlás-történet tárolása kell; a mostani verzió a katalógus fölött dolgozik, ez a következő lépcső.

## Feltételezések és validálás (átláthatóság)

| Feltételezés         | Használt érték | Honnan validáld                                                      |
| -------------------- | -------------- | -------------------------------------------------------------------- |
| Effektív óradíj      | 10 000 Ft/óra  | saját könyvelés; iparági bér: **KSH** ([ksh.hu](https://www.ksh.hu)) |
| Növénykosár / szoba  | 60 000 Ft      | saját korábbi ajánlatok                                              |
| Kosár-megtakarítás   | 5%             | 1-2 hónap A/B mérés a plantbase-zel                                  |
| Kézi idő / szoba     | 10-15 perc     | saját időmérés                                                       |
| LLM-költség / kérdés | ~2 Ft          | **a projekt saját naplói** (mért, nem becsült)                       |
| USD→HUF              | ~380 Ft/USD    | aktuális árfolyam                                                    |

**Forrás-jelzés:** az időmegtakarítási és kosár-számok feltételezések, nem mért tények; az
üzemeltetési költség viszont a rendszer saját naplóiból származó **valós mérés**. Az iparági
béradatot érdemes KSH-ból (vagy primer felmérésből) megerősíteni. **Human-in-the-loop:** üzleti
döntés előtt a feltételezéseket a saját adataiddal validáld.
