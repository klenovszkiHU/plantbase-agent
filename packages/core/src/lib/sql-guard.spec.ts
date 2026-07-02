import { assertSelectOnly, ensureLimit } from './sql-guard.js';

describe('assertSelectOnly', () => {
  it('should allow a simple SELECT', () => {
    expect(() => assertSelectOnly('SELECT * FROM products')).not.toThrow();
  });

  it('should allow a CTE (WITH ... SELECT)', () => {
    expect(() =>
      assertSelectOnly('WITH x AS (SELECT 1) SELECT * FROM x'),
    ).not.toThrow();
  });

  it('should be case- and whitespace-insensitive', () => {
    expect(() => assertSelectOnly('   \n  select 1  ')).not.toThrow();
  });

  it('should allow a single trailing semicolon', () => {
    expect(() => assertSelectOnly('SELECT 1;')).not.toThrow();
  });

  it.each([
    'INSERT INTO products (name) VALUES ($1)',
    'UPDATE products SET stock = 0',
    'DELETE FROM products',
    'DROP TABLE products',
    'ALTER TABLE products ADD COLUMN x int',
    'TRUNCATE products',
    'CREATE TABLE t (x int)',
    'GRANT SELECT ON products TO x',
    'SELECT * INTO backup FROM products',
  ])('should reject a write/DDL statement: %s', (query) => {
    expect(() => assertSelectOnly(query)).toThrow();
  });

  it('should reject stacked statements (SQL injection via semicolon)', () => {
    expect(() => assertSelectOnly('SELECT 1; DROP TABLE products')).toThrow();
  });

  it('should reject an empty query', () => {
    expect(() => assertSelectOnly('   ')).toThrow();
  });
});

describe('ensureLimit', () => {
  it('should append a LIMIT when none is present', () => {
    expect(ensureLimit('SELECT * FROM products', 50)).toMatch(/limit 50$/i);
  });

  it('should keep an existing LIMIT untouched', () => {
    const q = 'SELECT * FROM products LIMIT 5';
    expect(ensureLimit(q, 50)).toBe(q);
  });

  it('should strip a trailing semicolon before appending', () => {
    expect(ensureLimit('SELECT * FROM products;', 50)).toBe(
      'SELECT * FROM products LIMIT 50',
    );
  });
});
