/**
 * Échelle ATMO — définition unique du seuil de vigilance.
 *
 * Ce seuil était dupliqué avec deux valeurs différentes : la carte de
 * l'accueil n'alertait qu'à partir de « Dégradé », tandis que le widget
 * signalait toute commune qui n'était pas « Bon ». Résultat : les 33 communes
 * apparaissaient en « zones à surveiller » alors que l'air était simplement
 * moyen (indice 2 sur 6).
 */

/** Indice ATMO par libellé, tel que renvoyé par Gwad'Air */
export const ATMO_INDEX_BY_LABEL: Record<string, number> = {
  bon: 1,
  moyen: 2,
  dégradé: 3,
  degrade: 3,
  mauvais: 4,
  'très mauvais': 5,
  'tres mauvais': 5,
  'extrêmement mauvais': 6,
  'extremement mauvais': 6,
};

/** Indice à partir duquel une commune mérite d'être signalée */
export const ATMO_CONCERN_THRESHOLD = 3; // « Dégradé »

/** Indice ATMO correspondant à un libellé, ou null s'il est inconnu */
export function getAtmoIndex(label?: string | null): number | null {
  if (!label) return null;
  return ATMO_INDEX_BY_LABEL[label.trim().toLowerCase()] ?? null;
}

/** La qualité de l'air justifie-t-elle d'attirer l'attention ? */
export function isAirQualityOfConcern(label?: string | null): boolean {
  const index = getAtmoIndex(label);
  return index !== null && index >= ATMO_CONCERN_THRESHOLD;
}
