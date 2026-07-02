import { plants } from '../../prisma/seed-data/plants.js';

// A seed adat a stack.md kategorikus értékkészleteihez van kötve. Ez a teszt
// megfogja az elgépeléseket (a tsx nem típusellenőriz seed futtatáskor).
const CATEGORIES = [
  'szobanövény',
  'kerti',
  'pozsgás',
  'kaktusz',
  'fűszer',
  'fa-cserje',
  'lógó',
  'virágzó',
];
const LOCATIONS = ['beltéri', 'kültéri', 'mindkettő'];
const LIGHTS = ['árnyék', 'alacsony', 'közepes', 'erős', 'direkt nap'];
const WATERINGS = ['ritka', 'közepes', 'gyakori', 'állandóan nedves'];
const DIFFICULTIES = ['kezdő', 'haladó', 'profi'];

describe('plant catalog seed data', () => {
  it('should contain 30 plants', () => {
    expect(plants).toHaveLength(30);
  });

  it('should have unique latin names', () => {
    const latinNames = plants.map((p) => p.latinName);
    expect(new Set(latinNames).size).toBe(latinNames.length);
  });

  it('should use only allowed categorical values', () => {
    for (const p of plants) {
      expect(CATEGORIES, `category of ${p.name}`).toContain(p.category);
      expect(LOCATIONS, `location of ${p.name}`).toContain(p.location);
      expect(LIGHTS, `light of ${p.name}`).toContain(p.light);
      expect(WATERINGS, `watering of ${p.name}`).toContain(p.watering);
      expect(DIFFICULTIES, `difficulty of ${p.name}`).toContain(p.difficulty);
    }
  });

  it('should have sane numeric ranges', () => {
    for (const p of plants) {
      expect(p.price, `price of ${p.name}`).toBeGreaterThan(0);
      expect(p.stock, `stock of ${p.name}`).toBeGreaterThanOrEqual(0);
      expect(p.rating, `rating of ${p.name}`).toBeGreaterThanOrEqual(0);
      expect(p.rating, `rating of ${p.name}`).toBeLessThanOrEqual(5);
      expect(
        p.currentHeightCm,
        `currentHeightCm <= maxHeightCm of ${p.name}`,
      ).toBeLessThanOrEqual(p.maxHeightCm);
      if (p.salePrice !== null) {
        expect(p.salePrice, `salePrice < price of ${p.name}`).toBeLessThan(
          p.price,
        );
      }
    }
  });
});
