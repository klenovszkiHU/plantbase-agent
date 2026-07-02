import { coreName } from './core.js';

describe('core skeleton', () => {
  it('should expose the core package name', () => {
    expect(coreName()).toBe('@plantbase/core');
  });
});
