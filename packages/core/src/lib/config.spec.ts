import { loadConfig } from './config.js';

const RO_URL = 'postgresql://plantbase_ro:pw@localhost:5432/plantbase';

describe('loadConfig', () => {
  it('should read the API key, model, and read-only URL from env', () => {
    const config = loadConfig({
      ANTHROPIC_API_KEY: 'test-key',
      ANTHROPIC_MODEL: 'claude-sonnet-5',
      DATABASE_URL_READONLY: RO_URL,
    } as NodeJS.ProcessEnv);
    expect(config.anthropicApiKey).toBe('test-key');
    expect(config.anthropicModel).toBe('claude-sonnet-5');
    expect(config.databaseUrlReadonly).toBe(RO_URL);
  });

  it('should default the model when unset', () => {
    const config = loadConfig({
      ANTHROPIC_API_KEY: 'test-key',
      DATABASE_URL_READONLY: RO_URL,
    } as NodeJS.ProcessEnv);
    expect(config.anthropicModel).toBe('claude-haiku-4-5');
  });

  it('should fail fast with a descriptive error when the API key is missing', () => {
    expect(() =>
      loadConfig({ DATABASE_URL_READONLY: RO_URL } as NodeJS.ProcessEnv),
    ).toThrow(/ANTHROPIC_API_KEY/);
  });

  it('should fail fast when the read-only URL is missing', () => {
    expect(() =>
      loadConfig({ ANTHROPIC_API_KEY: 'test-key' } as NodeJS.ProcessEnv),
    ).toThrow(/DATABASE_URL_READONLY/);
  });
});
