import type { WaterCutData, WaterCutDetail } from '@/app/data/water-types';

/**
 * Lecture du planning SMGEAG.
 *
 * Le planning est publié en texte libre — « Mardi / jeudi / samedi de 20h à 7h »,
 * « Lundi / mercredi de 20h à 5h, vendredi de 20h à 9h », « Tous les jours de
 * 18h à 6h ». On en extrait les jours concernés pour pouvoir projeter les
 * coupures sur les sept prochains jours.
 */

const DAY_NAMES = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
] as const;

/** Un secteur dont le planning annonce explicitement l'absence de coupure. */
const NO_CUT_PATTERN = /alimentation favorable/i;

export type ParsedSlot = {
  /** Jours de la semaine concernés, 0 = dimanche. */
  weekdays: number[];
  /** Plage horaire telle que publiée, ex. « 20h à 7h ». */
  hours: string;
};

export type CommuneCut = {
  /** Date du jour de coupure. */
  date: Date;
  /** Libellé du jour, ex. « mardi 29 ». */
  dayLabel: string;
  secteur: string;
  hours: string;
};

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Extrait les créneaux d'un libellé d'horaires SMGEAG. */
export function parseSchedule(horaires: string): ParsedSlot[] {
  if (NO_CUT_PATTERN.test(horaires)) return [];

  const slots: ParsedSlot[] = [];
  for (const segment of horaires.split(',')) {
    const hoursMatch = segment.match(/de\s+([^,]+?)\s*$/i);
    const hours = hoursMatch ? hoursMatch[1].trim() : '';
    const daysPart = normalize(hoursMatch ? segment.slice(0, hoursMatch.index) : segment);

    let weekdays: number[];
    if (/tous les jours/.test(daysPart)) {
      weekdays = [0, 1, 2, 3, 4, 5, 6];
    } else {
      weekdays = DAY_NAMES.reduce<number[]>((acc, name, index) => {
        if (daysPart.includes(name)) acc.push(index);
        return acc;
      }, []);
    }

    if (weekdays.length > 0) slots.push({ weekdays, hours });
  }
  return slots;
}

/** Vrai si le secteur n'est pas soumis aux tours d'eau. */
export function isFavorable(detail: WaterCutDetail): boolean {
  return NO_CUT_PATTERN.test(detail.horaires);
}

const dayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric' });

/**
 * Projette le planning d'une commune sur `days` jours à partir d'aujourd'hui.
 * Les coupures sont triées par date puis par secteur.
 */
export function upcomingCuts(data: WaterCutData | undefined, days = 7, from = new Date()): CommuneCut[] {
  if (!data) return [];

  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const cuts: CommuneCut[] = [];

  for (let offset = 0; offset < days; offset++) {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    const weekday = date.getDay();

    for (const detail of data.details) {
      for (const slot of parseSchedule(detail.horaires)) {
        if (!slot.weekdays.includes(weekday)) continue;
        cuts.push({
          date,
          dayLabel: dayFormatter.format(date),
          secteur: detail.secteur,
          hours: slot.hours,
        });
      }
    }
  }

  return cuts;
}

/** Nombre de jours distincts touchés par au moins une coupure. */
export function countCutDays(data: WaterCutData | undefined, days = 7, from = new Date()): number {
  const keys = new Set(upcomingCuts(data, days, from).map((cut) => cut.date.toDateString()));
  return keys.size;
}

/**
 * « — zone commune avec Capesterre Belle-Eau 2 & 3 et Les Saintes » : une
 * précision de couverture accolée au libellé, pas un nom de secteur.
 */
const SHARED_ZONE_PATTERN = /\s*—\s*zone commune avec\s+(.+?)\s*$/i;

/**
 * Têtes de libellé qui ne nomment rien. Le SMGEAG numérote la plupart des
 * secteurs (« Secteur 1 », « Morne-à-l'Eau 2 »), mais écrit simplement
 * « Secteurs » pour Saint-Claude et Trois-Rivières : là, seuls les quartiers
 * entre parenthèses identifient la zone.
 */
const UNNAMED_SECTOR_PATTERN = /^secteurs?$/i;

/**
 * Nom d'un secteur, débarrassé de la liste de quartiers et de la mention de
 * zone commune — le planning liste parfois quarante quartiers entre
 * parenthèses, illisibles dans une carte de 300 px.
 *
 * Renvoie `null` quand le planning ne donne pas de nom au secteur : afficher
 * « Secteurs » tout court n'apprenait rien et ressemblait à une valeur
 * manquante. Aux appelants de retomber sur les quartiers.
 */
export function shortSector(secteur: string): string | null {
  const head = secteur.replace(SHARED_ZONE_PATTERN, '').split('(')[0].trim();
  return !head || UNNAMED_SECTOR_PATTERN.test(head) ? null : head;
}

/** Quartiers listés entre parenthèses, le cas échéant. */
export function sectorDetail(secteur: string): string | null {
  const match = secteur.match(/\(([^)]*)\)/);
  return match ? match[1].trim() : null;
}

/** Communes partageant le même tour d'eau, quand le planning le précise. */
export function sharedZone(secteur: string): string | null {
  return secteur.match(SHARED_ZONE_PATTERN)?.[1] ?? null;
}

/** Nombre de quartiers cités avant de couper, dans une colonne étroite. */
const SUMMARY_ZONES = 2;

/**
 * Étiquette d'un secteur pour une colonne étroite : son nom, ou à défaut ses
 * premiers quartiers.
 */
export function sectorSummary(secteur: string): string | null {
  const name = shortSector(secteur);
  if (name) return name;

  const zones = sectorDetail(secteur)
    ?.split(',')
    .map((zone) => zone.trim())
    .filter(Boolean);
  if (!zones?.length) return null;

  return zones.length <= SUMMARY_ZONES
    ? zones.join(', ')
    : `${zones.slice(0, SUMMARY_ZONES).join(', ')}…`;
}
