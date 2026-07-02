import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
          ],
          // Prisma-függőségek: a generált kliens (lintből kizárva) és a
          // prisma.config.ts / seed (tsx-szel futtatva) használja őket, ezt a
          // statikus import-ellenőrzés nem látja — de valós, kötelező deps.
          ignoredDependencies: [
            '@prisma/client',
            '@prisma/adapter-pg',
            'pg',
            'prisma',
            'dotenv',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    // A Prisma által generált kliens nem a mi kódunk — ne lintelje.
    ignores: ['**/out-tsc', 'src/generated/**'],
  },
];
