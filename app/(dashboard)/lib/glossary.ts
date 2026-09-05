/**
 * Ce que veulent dire les données affichées.
 *
 * Un indice ATMO de 3 ou une ligne « PM10 4/6 » ne disent rien à qui n'a pas
 * déjà le barème en tête. Les textes ci-dessous accompagnent donc chaque
 * lecture de la carte et chaque polluant de la fiche : d'où vient le chiffre,
 * ce qu'il mesure, et ce qu'il vaut dans le contexte guadeloupéen — les brumes
 * de sable saharien y pèsent plus que le trafic, ce qu'aucune échelle
 * nationale ne laisse deviner.
 *
 * Formulation volontairement sobre : seules les consignes des autorités
 * (Gwad'Air, Météo-France, SMGEAG) font foi.
 */

import type { Layer } from './model';

export type LayerNote = {
  /** Ce que la couleur des communes représente, en une phrase. */
  summary: string;
  /** D'où vient la donnée et à quel rythme elle bouge. */
  source: string;
};

export const LAYER_NOTES: Record<Layer, LayerNote> = {
  air: {
    summary:
      "La carte colore chaque commune selon son indice ATMO du jour, de 1 (bon) à 6 (extrêmement mauvais). L'indice retenu est celui du polluant le plus dégradé : une seule mauvaise mesure suffit à faire monter la commune.",
    source:
      "Source : Gwad'Air, l'observatoire agréé de la qualité de l'air en Guadeloupe. Indice publié une fois par jour pour la journée en cours.",
  },
  water: {
    summary:
      "La carte colore chaque commune selon le nombre de jours où une coupure d'eau est planifiée sur les sept prochains jours. Les tours d'eau alternent la distribution entre secteurs quand la ressource ne suffit pas à alimenter tout le réseau.",
    source:
      'Source : planning des tours d’eau du SMGEAG, relevé à la main depuis ses publications. Il change chaque semaine et un secteur peut être coupé sans préavis.',
  },
};

/**
 * Les cinq sous-indices publiés par Gwad'Air. Chacun est noté de 1 à 6 sur la
 * même échelle que l'indice global, et le pire des cinq devient l'indice de la
 * commune.
 */
export const POLLUTANT_NOTES: Record<string, string> = {
  code_pm10:
    'Poussières en suspension de moins de 10 µm. En Guadeloupe, leur source principale n’est pas le trafic mais les brumes de sable venues du Sahara, surtout de mai à septembre. Elles se logent dans les bronches.',
  code_pm25:
    'Particules fines de moins de 2,5 µm — combustion, échappements, feux. Assez petites pour atteindre les alvéoles pulmonaires et passer dans le sang, ce sont les plus surveillées sur le plan sanitaire.',
  code_no2:
    'Dioxyde d’azote, produit par les moteurs diesel et les groupes électrogènes. Il marque la circulation routière : ses pointes suivent les heures de bouchons autour de Pointe-à-Pitre et Baie-Mahault.',
  code_o3:
    'Ozone de basse altitude. Il n’est pas rejeté directement : il se forme sous le soleil à partir des autres polluants, donc il culmine l’après-midi et par temps chaud et clair. Il irrite les yeux et les voies respiratoires.',
  code_so2:
    'Dioxyde de soufre, issu des combustibles soufrés — centrales thermiques, fioul lourd — et des émanations volcaniques de la Soufrière. Il pique la gorge et déclenche les crises d’asthme.',
};
