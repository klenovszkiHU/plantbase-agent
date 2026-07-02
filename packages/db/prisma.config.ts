import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 nem tölti be automatikusan a .env-et. A titkok a repo gyökér .env-jében
// vannak, ezért onnan töltjük — a config fájl helyéhez képest, nem a cwd-hez, hogy
// bárhonnan (pnpm --filter, gyökér, packages/db) futtatva működjön.
const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
