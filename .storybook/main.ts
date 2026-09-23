import type { StorybookConfig } from '@storybook/nextjs-vite';

/*
 * Les stories vivent à côté des composants qu'elles documentent, et non dans
 * un dossier `stories/` séparé : un composant déplacé emporte sa
 * documentation, et l'absence de story se voit à la lecture du dossier.
 *
 * `.storybook/docs/` porte en plus les pages MDX de fondations (couleurs,
 * typographie, échelles sémantiques), qui ne documentent aucun composant en
 * particulier.
 */
const config: StorybookConfig = {
  stories: [
    '../.storybook/docs/**/*.stories.@(ts|tsx)',
    '../app/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
};

export default config;
