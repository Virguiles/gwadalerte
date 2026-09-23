import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { brumeDeSable, journeeOrdinaire, sansMesure } from '../lib/fixtures';
import { Readout } from './Readout';

/**
 * L'état du territoire, posé dans le coin bas-gauche de la carte.
 *
 * Trois chiffres qui valent pour toute la Guadeloupe — la fiche commune, elle,
 * répond pour une commune. Les afficher en permanence tient la scène immobile :
 * c'est ce bloc qui, en changeant de taille à chaque clic, faisait auparavant
 * sauter le cadrage de la carte.
 */
const meta = {
  title: 'Tableau de bord/Readout',
  component: Readout,
  args: { loading: false },
  parameters: {
    docs: {
      description: {
        component:
          "Le nombre de communes mesurées ne s'affiche que s'il en manque une : « 32/32 » à " +
          "côté de « 32 communes » n'apprend rien. Les trois valeurs arrivent après trois " +
          "requêtes distinctes, d'où l'état de chargement — sans marque d'attente, la vue " +
          "d'ensemble s'affiche vide et paraît cassée.",
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Readout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Une journée ordinaire : air correct, quelques communes en tour d'eau. */
export const Ordinaire: Story = {
  args: { communes: journeeOrdinaire },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Toutes les communes du jeu sont mesurées : le compteur reste implicite.
    await expect(canvas.getByText('ATMO moyen')).toBeVisible();
  },
};

/** Épisode de brume de sable — l'indice moyen bascule dans le haut de l'échelle. */
export const BrumeDeSable: Story = {
  args: { communes: brumeDeSable },
};

/**
 * Aucune mesure disponible. C'est le cas que les maquettes oublient, et celui
 * qui affichait « NaN » : les trois valeurs retombent sur un tiret.
 */
export const SansMesure: Story = {
  args: { communes: sansMesure },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('—').length).toBeGreaterThan(0);
    await expect(canvas.queryByText(/NaN/)).not.toBeInTheDocument();
  },
};

/** Les trois requêtes sont en vol : squelettes plutôt qu'un bloc vide. */
export const Chargement: Story = {
  args: { communes: [], loading: true },
};

export const Sombre: Story = {
  args: { communes: brumeDeSable },
  globals: { theme: 'dark' },
};
