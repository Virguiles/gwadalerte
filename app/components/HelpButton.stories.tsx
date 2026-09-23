import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { HelpButton } from './HelpButton';

/**
 * Bulle d'aide contextuelle, posée à côté des chiffres qu'elle explique.
 *
 * Ce n'est volontairement pas une boîte de dialogue : `role="dialog"`
 * promettait une gestion du focus et une fermeture par Échap que le composant
 * ne fournissait pas. `aria-expanded` / `aria-controls` décrit exactement ce
 * qui se passe — un dépliant — sans rien promettre de plus.
 */
const meta = {
  title: 'Composants transverses/HelpButton',
  component: HelpButton,
  args: {
    title: 'Indice ATMO',
    children:
      "Indice de qualité de l'air, de 1 (bon) à 6 (extrêmement mauvais). Calculé chaque jour " +
      "par Gwad'Air à partir de cinq polluants réglementés.",
  },
  parameters: {
    docs: {
      description: {
        component:
          'La cible fait 28 px de côté — WCAG 2.2 critère 2.5.8 en demande 24 au minimum, et ' +
          "l'icône seule n'en faisait que 20. Échap est écouté en phase de *capture* : sans ça " +
          'le raccourci global du tableau de bord recevait la touche en premier et ' +
          "désélectionnait la commune au lieu de fermer l'aide.",
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HelpButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Replie: Story = {};

/**
 * Le dépliant ouvert. Il est ouvert *par le clavier* plutôt que par une prop,
 * pour que l'état testé par axe soit celui que produit une vraie interaction —
 * `aria-controls` n'est posé qu'une fois le panneau présent.
 */
export const Deplie: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Aide : Indice ATMO/ });

    await userEvent.click(button);

    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('group', { name: 'Indice ATMO' })).toBeVisible();
  },
};

/** Échap referme le dépliant et rend le focus à la commande qui l'a ouvert. */
export const EchapRendLeFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /Aide : Indice ATMO/ });

    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');

    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveFocus();
  },
};

/** Sur l'encre sombre, le même contrôle et les mêmes seuils de contraste. */
export const Sombre: Story = {
  globals: { theme: 'dark' },
  play: Deplie.play,
};
