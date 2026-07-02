import { runAsk } from './ask.js';

describe('runAsk (single-shot)', () => {
  it('should echo a provided question and not start interactive mode', () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
    try {
      runAsk('van pozsgásod?', {});
    } finally {
      spy.mockRestore();
    }
    expect(logs).toEqual(['echo: van pozsgásod?']);
  });

  it('should trim surrounding whitespace before echoing', () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, 'log').mockImplementation((msg?: unknown) => {
      logs.push(String(msg));
    });
    try {
      runAsk('  szia  ', {});
    } finally {
      spy.mockRestore();
    }
    expect(logs).toEqual(['echo: szia']);
  });
});
