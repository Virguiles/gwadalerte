import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CookieBanner } from './CookieBanner';

const ACCEPTED_KEY = 'gwada_cookie_accepted';

/**
 * Bandeau d'information sur le stockage local.
 *
 * Il n'a pas de bouton « refuser », parce qu'il n'y a rien à refuser : le site
 * ne dépose aucun cookie et n'envoie rien. Le texte énumère exactement ce que
 * le navigateur retient — thème, progression dans l'aide, dernières données
 * reçues pour la consultation hors ligne.
 */
const meta = {
  title: 'Composants transverses/CookieBanner',
  component: CookieBanner,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Le bandeau est positionné en `fixed`, calé sur `env(safe-area-inset-bottom)` pour " +
          "ne pas passer sous la barre de geste des téléphones. Le bouton fait 44 px de haut. " +
          "L'état « déjà accepté » est lu dans `localStorage` via `useSyncExternalStore` et " +
          'non dans un effet : le bandeau ne clignote pas au montage.',
      },
    },
  },
  /*
   * Chaque story part d'un navigateur qui n'a jamais vu le bandeau : sans ce
   * nettoyage, la première story qui accepte masque toutes les suivantes.
   */
  beforeEach: () => {
    try {
      localStorage.removeItem(ACCEPTED_KEY);
    } catch {
      /* stockage inaccessible : le composant gère déjà ce cas */
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CookieBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visible: Story = {};

export const Sombre: Story = {
  globals: { theme: 'dark' },
};

/** Accepter referme le bandeau et pose le drapeau pour les visites suivantes. */
export const Accepte: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /J'ai compris/ }));

    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await expect(localStorage.getItem(ACCEPTED_KEY)).toBe('1');
  },
};
