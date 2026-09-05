/**
 * Types de la qualité de l'air (source : Gwad'Air).
 *
 * Ils vivaient dans `components/GuadeloupeMap.tsx` — un composant de vue, hors
 * duquel plus rien ne pouvait les lire sans importer une carte entière. Ils
 * sont ici avec les autres contrats de données.
 */

/** Une ligne de l'API Gwad'Air : indice global et sous-indices d'une commune. */
export type CommuneData = {
  lib_zone: string;
  lib_qual?: string;
  coul_qual?: string;
  code_zone?: string;
  [key: string]: unknown;
};

/** Toutes les communes mesurées, indexées par code INSEE. */
export type AirData = {
  [code_zone: string]: CommuneData;
};
