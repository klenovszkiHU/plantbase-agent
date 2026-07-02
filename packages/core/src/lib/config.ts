import { z } from 'zod';

// A termék-agent konfigurációja env-ből, Zod-validálva a rendszer-határon
// (konvenciok.md). Fail-fast: hiányzó/hibás érték esetén beszédes hiba indításkor.
// A .env betöltése a belépési pont (CLI) felelőssége; itt már process.env-et olvasunk.
// A séma kulcsai az env-változók nevei, hogy a hibaüzenet is azokra hivatkozzon.
const EnvSchema = z.object({
  ANTHROPIC_API_KEY: z
    .string({ error: 'ANTHROPIC_API_KEY kötelező (lásd .env)' })
    .min(1, 'ANTHROPIC_API_KEY hiányzik (lásd .env)'),
  ANTHROPIC_MODEL: z.string().min(1).default('claude-haiku-4-5'),
});

export interface Config {
  anthropicApiKey: string;
  anthropicModel: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const result = EnvSchema.safeParse({
    ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: env.ANTHROPIC_MODEL,
  });

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `- ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Hibás plantbase konfiguráció:\n${issues}`);
  }

  return {
    anthropicApiKey: result.data.ANTHROPIC_API_KEY,
    anthropicModel: result.data.ANTHROPIC_MODEL,
  };
}
