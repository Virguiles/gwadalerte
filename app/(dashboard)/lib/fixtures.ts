/**
 * Jeux de données pour les stories.
 *
 * Ce fichier n'est importé que par des `*.stories.tsx`, jamais par un
 * composant : il ne part pas dans le bundle de production. Il vit à côté du
 * modèle plutôt que dans `.storybook/` parce qu'il suit les types de
 * `model.ts` — un champ ajouté là-bas doit casser ici, à la compilation.
 */

import { atmoColor, atmoLabel, waterColor, waterLabel } from './palette';
import { normalize, type CommuneRecord } from './model';

type Options = {
  /** Indice ATMO 1 à 6, ou `null` pour une commune non mesurée. */
  air?: number | null;
  /** Température en °C, ou `null` si la station n'a rien renvoyé. */
  temp?: number | null;
  /** Nombre de jours touchés par une coupure sur les sept prochains. */
  cutDays?: number;
};

/**
 * Une commune plausible, au strict nécessaire pour les composants de synthèse.
 *
 * Les champs `color` et `label` passent par les mêmes fonctions que le
 * produit : une story ne doit pas pouvoir afficher une couleur que l'échelle
 * ne produirait jamais.
 */
export function commune(
  code: string,
  nom: string,
  { air = null, temp = null, cutDays = 0 }: Options = {},
): CommuneRecord {
  return {
    code,
    nom,
    search: normalize(nom),
    air: {
      index: air,
      label: atmoLabel(air),
      color: atmoColor(air),
      pollutants: [],
    },
    weather:
      temp === null
        ? undefined
        : {
            lib_zone: nom,
            code_zone: code,
            temperature: temp,
            feels_like: temp + 2,
            temp_min: temp - 2,
            temp_max: temp + 3,
            humidity: 74,
            pressure: 1013,
            wind_speed: 18,
            wind_deg: 90,
            weather_main: 'Clouds',
            weather_description: 'partiellement nuageux',
            weather_icon: 'CloudSun',
            clouds: 40,
            weather_code: 2,
          },
    water: {
      raw: undefined,
      cuts: [],
      cutDays,
      today: null,
      sourceDate: null,
      color: waterColor(cutDays),
      label: waterLabel(cutDays),
    },
  };
}

/** Une journée ordinaire : air correct, quelques communes en tour d'eau. */
export const journeeOrdinaire: CommuneRecord[] = [
  commune('97101', 'Les Abymes', { air: 2, temp: 28.4 }),
  commune('97105', 'Basse-Terre', { air: 1, temp: 27.1, cutDays: 2 }),
  commune('97120', 'Saint-Claude', { air: 2, temp: 24.9, cutDays: 1 }),
  commune('97111', 'Le Gosier', { air: 3, temp: 29.2 }),
  commune('97129', 'Pointe-à-Pitre', { air: 3, temp: 29.8, cutDays: 3 }),
  commune('97110', 'La Désirade', { air: 1, temp: 28.0 }),
];

/** Un épisode de brume de sable : indices dégradés sur tout le territoire. */
export const brumeDeSable: CommuneRecord[] = [
  commune('97101', 'Les Abymes', { air: 5, temp: 31.2 }),
  commune('97105', 'Basse-Terre', { air: 5, temp: 30.4, cutDays: 4 }),
  commune('97120', 'Saint-Claude', { air: 4, temp: 27.6, cutDays: 2 }),
  commune('97111', 'Le Gosier', { air: 6, temp: 31.8, cutDays: 1 }),
  commune('97129', 'Pointe-à-Pitre', { air: 6, temp: 32.1, cutDays: 5 }),
  commune('97110', 'La Désirade', { air: 4, temp: 30.9 }),
];

/**
 * Le cas que les maquettes oublient : des communes sans aucune mesure.
 * C'est celui qui faisait afficher « NaN » et des aplats invisibles.
 */
export const sansMesure: CommuneRecord[] = [
  commune('97101', 'Les Abymes'),
  commune('97105', 'Basse-Terre'),
  commune('97120', 'Saint-Claude'),
];
