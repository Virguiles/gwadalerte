import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { WMO_WEATHER_CODES, getShortWeatherLabel } from '@/lib/weather-codes';
import { WeatherGlyph } from './WeatherGlyph';

/**
 * Les icônes météo du produit — aplats, sans animation, coloriés par des
 * variables CSS `--wx-*`.
 *
 * Elles ne viennent ni de Lucide (monochrome : le gris de la condition météo
 * se confondait avec les métadonnées voisines) ni de Meteocons (animées et
 * calibrées pour un fond clair saturé : leurs dégradés entraient en
 * concurrence avec les couleurs sémantiques de la carte).
 *
 * Chaque variable porte sa valeur de repli en dur, celle du thème clair : un
 * glyphe privé de sa feuille de style doit rester lisible sur blanc.
 */
const meta = {
  title: 'Composants transverses/WeatherGlyph',
  component: WeatherGlyph,
  args: { size: 48 },
  argTypes: {
    weatherCode: { control: { type: 'number', min: 0, max: 99 } },
    isDay: { control: 'boolean' },
    size: { control: { type: 'range', min: 16, max: 128, step: 4 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          'La correspondance code WMO → glyphe reste déléguée à `getWeatherIcon` : une seule ' +
          'table WMO dans le projet. Un glyphe sans `label` est décoratif et porte ' +
          '`aria-hidden` ; avec un `label` il devient `role="img"`. Le masque du croissant de ' +
          'lune est identifié par `useId`, sans quoi deux lunes sur une même page ' +
          "s'effaceraient l'une l'autre.",
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WeatherGlyph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactif: Story = {
  args: { weatherCode: 61, isDay: true, label: 'Pluie faible' },
};

/** Décoratif : sans `label`, le glyphe est masqué aux technologies d'assistance. */
export const Decoratif: Story = {
  args: { weatherCode: 3, isDay: true },
};

/**
 * Toute la table WMO, d'un coup d'œil. C'est la vue qui sert en revue de
 * design : une condition dont le glyphe retombe sur « inconnu » s'y voit.
 */
const Grille = ({ isDay }: { isDay: boolean }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '1.25rem',
    }}
  >
    {Object.keys(WMO_WEATHER_CODES)
      .map(Number)
      .sort((a, b) => a - b)
      .map((code) => (
        <figure
          key={code}
          style={{
            margin: 0,
            display: 'grid',
            justifyItems: 'center',
            gap: 6,
            textAlign: 'center',
          }}
        >
          <WeatherGlyph weatherCode={code} isDay={isDay} size={40} />
          <figcaption style={{ fontSize: 11, lineHeight: 1.3, color: 'var(--mut)' }}>
            <strong style={{ display: 'block', color: 'var(--txt)' }}>{code}</strong>
            {getShortWeatherLabel(code)}
          </figcaption>
        </figure>
      ))}
  </div>
);

export const TableWMOJour: Story = {
  name: 'Table WMO — jour',
  render: () => <Grille isDay />,
};

export const TableWMONuit: Story = {
  name: 'Table WMO — nuit',
  render: () => <Grille isDay={false} />,
};

export const TableWMOSombre: Story = {
  name: 'Table WMO — thème sombre',
  globals: { theme: 'dark' },
  render: () => <Grille isDay={false} />,
};
