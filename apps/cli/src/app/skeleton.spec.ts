import { skeletonBanner } from './skeleton.js';

describe('cli skeleton', () => {
  it('should return a non-empty banner string', () => {
    expect(skeletonBanner()).toContain('plantbase cli');
  });
});
