-- Plantbase — read-only role a termék-agent runSql tooljához (NFR1).
-- Ez a script CSAK az adatbázis első inicializálásakor fut le (üres volume),
-- a POSTGRES_USER (plantbase, a DB tulajdonosa) jogával, a plantbase DB-ben.
--
-- Kettős védelem: az agent SELECT-only kódszintű guardja MELLETT a DB-jog is
-- garantálja, hogy a plantbase_ro semmit nem tud módosítani.

-- 1) A read-only role. A jelszónak egyeznie kell a DATABASE_URL_READONLY-val (.env).
CREATE ROLE plantbase_ro WITH LOGIN PASSWORD 'plantbase_ro';

-- 2) Csatlakozás a DB-hez és a public séma olvasása.
GRANT CONNECT ON DATABASE plantbase TO plantbase_ro;
GRANT USAGE ON SCHEMA public TO plantbase_ro;

-- 3) Ne hozhasson létre objektumot a public sémában.
REVOKE CREATE ON SCHEMA public FROM plantbase_ro;

-- 4) SELECT a MÁR létező táblákra (most még nincs; a products az A4 migrációban jön).
GRANT SELECT ON ALL TABLES IN SCHEMA public TO plantbase_ro;

-- 5) SELECT a KÉSŐBB, a plantbase (RW) által létrehozott táblákra is (pl. products).
--    Enélkül a migráció utáni új táblákhoz nem lenne joga a read-only role-nak.
ALTER DEFAULT PRIVILEGES FOR ROLE plantbase IN SCHEMA public
  GRANT SELECT ON TABLES TO plantbase_ro;
