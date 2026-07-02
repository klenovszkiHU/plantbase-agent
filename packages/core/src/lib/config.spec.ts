import { loadConfig } from './config.js';

describe('loadConfig', () => {
  it('should read the API key and model from env', () => {
    const config = loadConfig({
      ANTHROPIC_API_KEY: 'test-key',
      ANTHROPIC_MODEL: 'claude-sonnet-5',
    } as NodeJS.ProcessEnv);
    expect(config.anthropicApiKey).toBe('test-key');
    expect(config.anthropicModel).toBe('claude-sonnet-5');
  });

  it('should default the model when unset', () => {
    const config = loadConfig({
      ANTHROPIC_API_KEY: 'test-key',
    } as NodeJS.ProcessEnv);
    expect(config.anthropicModel).toBe('claude-haiku-4-5');
  });

  it('should fail fast with a descriptive error when the API key is missing', () => {
    expect(() => loadConfig({} as NodeJS.ProcessEnv)).toThrow(
      /ANTHROPIC_API_KEY/,
    );
  });
});
