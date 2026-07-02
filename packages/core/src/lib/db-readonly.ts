import pg from 'pg';

// A runSql tool READ-ONLY kapcsolata (DATABASE_URL_READONLY, plantbase_ro role).
// A statement_timeout extra védelem a szökött lekérdezések ellen; a role maga
// pedig DB-szinten tiltja az írást (kettős védelem az SQL-guard mellett).
const STATEMENT_TIMEOUT_MS = 5000;

export interface QueryResult {
  rows: Record<string, unknown>[];
  rowCount: number;
}

export function createReadonlyPool(connectionString: string): pg.Pool {
  return new pg.Pool({
    connectionString,
    max: 4,
    statement_timeout: STATEMENT_TIMEOUT_MS,
  });
}

export async function runReadonlyQuery(
  pool: pg.Pool,
  sql: string,
): Promise<QueryResult> {
  const result = await pool.query(sql);
  return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
}
