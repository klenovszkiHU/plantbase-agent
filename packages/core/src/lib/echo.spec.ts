import { echo } from './echo.js';

describe('echo', () => {
  it('should prefix the input with "echo: "', () => {
    expect(echo('szia')).toBe('echo: szia');
  });

  it('should preserve the input verbatim, including spaces', () => {
    expect(echo('  két  szó ')).toBe('echo:   két  szó ');
  });

  it('should handle an empty string', () => {
    expect(echo('')).toBe('echo: ');
  });
});
