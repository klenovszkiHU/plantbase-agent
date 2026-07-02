// A runSql tool kódszintű védelme (NFR1) — a DB read-only role MELLETT (kettős védelem).
// Tiszta függvények, hogy TDD-vel egységgel tesztelhetők legyenek.

// Írás/DDL kulcsszavak; egész szóként (\b) keressük, hogy a "created_height" stb. ne triggereljen.
const FORBIDDEN =
  /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|merge|call|copy|into|vacuum|reindex|comment)\b/i;

/** Levágja a záró pontosvesszőt és a körülvevő whitespace-t. */
function normalize(query: string): string {
  return query.trim().replace(/;\s*$/, '').trim();
}

/**
 * Eldobja a lekérdezést, ha nem tiszta olvasás. Engedélyezett: egyetlen SELECT
 * vagy CTE (WITH ... SELECT). Tiltott: írás/DDL kulcsszó, több utasítás (;), üres.
 */
export function assertSelectOnly(query: string): void {
  const sql = normalize(query);

  if (sql.length === 0) {
    throw new Error('Üres lekérdezés.');
  }
  if (sql.includes(';')) {
    throw new Error('Több utasítás nem engedélyezett (csak egyetlen SELECT).');
  }
  if (!/^(select|with)\b/i.test(sql)) {
    throw new Error(
      'Csak SELECT (vagy WITH ... SELECT) lekérdezés futtatható.',
    );
  }
  if (FORBIDDEN.test(sql)) {
    throw new Error(
      'Módosító vagy DDL kulcsszó nem engedélyezett — csak olvasás.',
    );
  }
}

/**
 * Ha nincs LIMIT a lekérdezésben, hozzáfűz egy alapértelmezettet. A záró
 * pontosvesszőt levágja. (Nem próbál subquery-szintű LIMIT-et értelmezni.)
 */
export function ensureLimit(query: string, defaultLimit: number): string {
  const sql = normalize(query);
  if (/\blimit\b/i.test(sql)) {
    return sql;
  }
  return `${sql} LIMIT ${defaultLimit}`;
}
