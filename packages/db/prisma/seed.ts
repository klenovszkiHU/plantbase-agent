// Plantbase — idempotens seed: betölti a szintetikus növény-katalógust.
// Prisma 7: a runtime kliens driver adaptert kap (@prisma/adapter-pg), és a
// READ-WRITE kapcsolaton (DATABASE_URL) fut — a seed írási művelet.
// Futtatás: `pnpm --filter @plantbase/db db:seed` (a prisma.config.ts seed-je hívja).

import { config as loadEnv } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { plants } from './seed-data/plants.js';

// v7 nem tölti be automatikusan a .env-et; a gyökér .env-ből olvassuk (cwd-független).
const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, '../../../.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'Hiányzó DATABASE_URL a seedhez (a read-write kapcsolat kell). Ellenőrizd a .env-et.',
  );
}

async function main(): Promise<void> {
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // Idempotencia: előbb üres lap, majd újratöltés — így többször is futtatható.
    await prisma.product.deleteMany();
    const { count } = await prisma.product.createMany({ data: plants });

    const total = await prisma.product.count();
    console.log(
      `Seed kész: ${count} növény beszúrva, a products tábla összesen ${total} sort tartalmaz.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Seed hiba: ${message}`);
  process.exitCode = 1;
});
