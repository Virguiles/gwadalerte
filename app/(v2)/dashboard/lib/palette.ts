/**
 * Palette sémantique du tableau de bord.
 *
 * Ces couleurs ne servent qu'à porter une information (indice, niveau,
 * nombre de coupures). Le décor, lui, n'utilise que l'encre et la sauge
 * définies dans `dashboard.css`.
 */

export const SAGE = '#a9c6bc';

/** Indices ATMO 1 à 6 — l'entrée 0 couvre l'absence de mesure. */
export const ATMO_COLORS = [
  'rgba(241,245,244,.18)',
  '#79bd8c',
  '#a9c68a',
  '#e2c76a',
  '#df9a58',
  '#d4685d',
  '#a05a86',
] as const;

export const ATMO_LABELS = [
  'Non mesuré',
  'Bon',
  'Moyen',
  'Dégradé',
  'Mauvais',
  'Très mauvais',
  'Extrêmement mauvais',
] as const;

/**
 * Recommandation sanitaire par indice. Formulation volontairement sobre :
 * seules les consignes des autorités font foi.
 */
export const ATMO_ADVICE = [
  "Aucune mesure disponible pour cette commune aujourd'hui.",
  'Aucune précaution particulière. Les activités extérieures peuvent se dérouler normalement.',
  "La qualité de l'air reste acceptable pour l'ensemble de la population.",
  'Les personnes sensibles peuvent réduire les efforts intenses en extérieur.',
  'Personnes sensibles : évitez les efforts intenses dehors. Population générale : limitez-les.',
  'Réduisez les activités physiques en extérieur, en particulier pour les personnes sensibles.',
  'Évitez les activités physiques en extérieur et limitez les sorties prolongées.',
] as const;

/** Niveaux de vigilance Météo-France, 1 (vert) à 4 (rouge). */
export const VIGILANCE_COLORS = [
  'rgba(241,245,244,.18)',
  '#79bd8c',
  '#e2c76a',
  '#df9a58',
  '#d4685d',
] as const;

export const VIGILANCE_LABELS = [
  'Inconnue',
  'Verte',
  'Jaune',
  'Orange',
  'Rouge',
] as const;

export const VIGILANCE_ADVICE = [
  'Niveau de vigilance indisponible.',
  "Pas de vigilance particulière. Restez informé si vous pratiquez une activité sensible à la météo.",
  'Soyez attentif si vous pratiquez des activités sensibles au risque météorologique.',
  'Soyez très vigilant : des phénomènes dangereux sont prévus. Suivez les consignes des autorités.',
  'Vigilance absolue : phénomènes dangereux d’intensité exceptionnelle. Conformez-vous aux consignes.',
] as const;

/** Couleur d'une commune selon son nombre de coupures d'eau à venir. */
export function waterColor(cuts: number): string {
  if (cuts <= 0) return '#4b6660';
  if (cuts === 1) return '#e2c76a';
  return '#df9a58';
}

export function waterLabel(cuts: number): string {
  if (cuts <= 0) return 'Aucune coupure';
  if (cuts === 1) return '1 coupure';
  return `${cuts} coupures`;
}

export function atmoColor(index: number | null): string {
  return ATMO_COLORS[index && index >= 1 && index <= 6 ? index : 0];
}

export function atmoLabel(index: number | null): string {
  return ATMO_LABELS[index && index >= 1 && index <= 6 ? index : 0];
}

export function vigilanceColor(level: number | null): string {
  return VIGILANCE_COLORS[level && level >= 1 && level <= 4 ? level : 0];
}

export function vigilanceLabel(level: number | null): string {
  return VIGILANCE_LABELS[level && level >= 1 && level <= 4 ? level : 0];
}
