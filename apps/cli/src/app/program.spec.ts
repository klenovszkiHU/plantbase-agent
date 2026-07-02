import { buildProgram, CLI_VERSION } from './program.js';

describe('cli program', () => {
  it('should be named plantbase', () => {
    expect(buildProgram().name()).toBe('plantbase');
  });

  it('should register an ask command', () => {
    const commandNames = buildProgram()
      .commands.map((c) => c.name())
      .sort();
    expect(commandNames).toContain('ask');
  });

  it('should expose --show-prompt on the ask command', () => {
    const ask = buildProgram().commands.find((c) => c.name() === 'ask');
    const optionFlags = ask?.options.map((o) => o.long);
    expect(optionFlags).toContain('--show-prompt');
  });

  it('should report a version', () => {
    expect(buildProgram().version()).toBe(CLI_VERSION);
  });
});
