import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ThemeToggle } from './ThemeToggle';

/**
 * La bascule clair / sombre, présente dans les deux layouts.
 *
 * Son intérêt pour un design system tient dans ce qu'elle annonce : le libellé
 * décrit l'*action*, pas l'état. Sur un thème sombre le bouton dit « Passer en
 * thème clair » — c'est ce qu'on attend d'une commande, et c'est ce que lit un
 * lecteur d'écran.
 */
const meta = {
  title: 'Composants transverses/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    docs: {
      description: {
        component:
          "Le composant lit `resolvedTheme` et non `theme` : avec `defaultTheme=\"system\"`, " +
          '`theme` vaut « system » et jamais « dark », et le bouton annonçait alors une action ' +
          "inverse de celle qu'il effectuait. Avant hydratation il est rendu désactivé plutôt " +
          "qu'actif-mais-inerte.",
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sur le thème clair, le bouton propose de passer au sombre. */
export const Clair: Story = {
  globals: { theme: 'light' },
};

/** Sur le thème sombre, il propose l'inverse — et l'annonce. */
export const Sombre: Story = {
  globals: { theme: 'dark' },
};
