import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/*
 * Deux suites, deux environnements.
 *
 * `unit` — la logique pure : formats, modèle, échelles de couleur et leurs
 * assertions de contraste. Elle tourne sous Node, sans navigateur, et c'est
 * elle que `npm test` lance.
 *
 * `storybook` — chaque story rendue dans Chromium puis passée à axe-core.
 * Le seuil est `error` (voir `.storybook/preview.tsx`) : une violation fait
 * échouer la suite. Elle demande les binaires Playwright, d'où sa séparation.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(dirname, '.') },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['**/*.test.ts'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
