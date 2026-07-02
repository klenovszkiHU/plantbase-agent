import { buildSystemPrompt } from './system-prompt.js';

describe('buildSystemPrompt', () => {
  it('should always identify as the Plantbase assistant', () => {
    expect(buildSystemPrompt({ dbAccess: false })).toContain('<role>');
    expect(buildSystemPrompt({ dbAccess: true })).toContain(
      'Plantbase asszisztens',
    );
  });

  describe('without DB access (B2)', () => {
    const prompt = buildSystemPrompt({ dbAccess: false });

    it('should state there is no database access', () => {
      expect(prompt).toContain('<constraints>');
      expect(prompt).toContain('NINCS adatbázis-hozzáférésed');
    });

    it('should not offer the runSql tool', () => {
      expect(prompt).not.toContain('runSql');
    });
  });

  describe('with DB access (B3)', () => {
    const prompt = buildSystemPrompt({ dbAccess: true });

    it('should expose the runSql tool and the products schema', () => {
      expect(prompt).toContain('runSql');
      expect(prompt).toContain('products');
      expect(prompt).toContain('COALESCE(sale_price, price)');
    });

    it('should forbid non-SELECT statements', () => {
      expect(prompt).toContain('CSAK SELECT');
    });
  });
});
