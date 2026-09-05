/**
 * Palette sémantique du tableau de bord.
 *
 * Ces couleurs ne servent qu'à porter une information (indice, niveau,
 * nombre de coupures). Le décor, lui, n'utilise que l'encre et la sauge
 * définies dans `dashboard.css`.
 */

export const SAGE = '#a9c6bc';

/**
 * Teinte neutre des communes et pastilles sans mesure.
 *
 * C'était un blanc à 18 % : invisible sur le panneau et sur la scène du thème
 * clair (1,02:1). Elle passe par un token défini par thème dans
 * `dashboard.css`, et l'absence de mesure sur la carte est en outre portée par
 * le contour tireté de `.is-no-data` — aucun aplat ne peut tenir 3:1 à la fois
 * contre la scène et contre les remplissages ATMO voisins.
 *
 * `var()` fonctionne partout où cette valeur est posée : propriété `style` en
 * React (le `fill` des tracés y est passé, et non par attribut de présentation,
 * qui ne substitue pas les variables).
 */
export const NO_DATA = 'var(--no-data)';

/** Indices ATMO 1 à 6 — l'entrée 0 couvre l'absence de mesure. */
export const ATMO_COLORS = [
  NO_DATA,
  '#79bd8c',
  '#a9c68a',
  '#e2c76a',
  '#df9a58',
  '#d4685d',
  '#a05a86',
] as const;

/**
 * Couleur de l'indice ATMO *écrit*, par opposition à l'aplat de la carte.
 *
 * Le chiffre s'affiche en 64 px : c'est du texte, soumis au seuil de 3:1. Les
 * teintes de `ATMO_COLORS` sont calibrées pour se distinguer entre elles sur
 * la carte, et quatre d'entre elles tombaient sous ce seuil sur le panneau
 * blanc. Les tokens `--atmo-fg-*` portent la version lisible de chaque thème.
 */
export function atmoTextColor(index: number | null | undefined): string {
  if (index == null || index < 1 || index > 6) return 'var(--mut)';
  return `var(--atmo-fg-${index})`;
}

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
  NO_DATA,
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

/**
 * Bleu du marqueur « tour d'eau », posé sur une commune déjà colorée par son
 * indice ATMO. Aucune teinte de l'échelle ATMO ne tire vers le bleu : le
 * marqueur ne peut donc être confondu avec le fond qui le porte.
 */
export const WATER_MARK = '#6fb3d2';

/**
 * Couleur d'une commune selon son nombre de coupures d'eau à venir.
 *
 * Les trois valeurs vivent dans `tokens.css` et changent avec le thème : une
 * échelle unique ne peut pas placer la gravité du bon côté de la saillance sur
 * une encre sombre et sur une scène claire à la fois.
 */
export function waterColor(cuts: number): string {
  if (cuts <= 0) return 'var(--water-0)';
  if (cuts === 1) return 'var(--water-1)';
  return 'var(--water-2)';
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
