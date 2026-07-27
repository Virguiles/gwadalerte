import { DateFilter, WaterCutData, WaterCutDetail } from './types';

// ============================================================================
// ÉCHELLE D'ÉTAT DES TOURS D'EAU
// ============================================================================
//
// Les couleurs encodent un ÉTAT, pas une identité de commune : deux communes
// dans la même situation doivent avoir la même couleur. L'écart de luminosité
// entre l'ambre et le rouge est volontairement large pour rester lisible en
// vision daltonienne — et chaque couleur est systématiquement doublée d'un
// libellé texte.

export type WaterCutStatus = 'none' | 'scheduled' | 'ongoing';

export const WATER_STATUS_DETAILS: Record<
  WaterCutStatus,
  { status: WaterCutStatus; color: string; label: string; description: string }
> = {
  none: {
    status: 'none',
    color: '#D1D5DB',
    label: 'Pas de coupure',
    description: "L'eau devrait couler normalement.",
  },
  scheduled: {
    status: 'scheduled',
    color: '#F59E0B',
    label: 'Coupure prévue',
    description: 'Une coupure est programmée sur la période sélectionnée.',
  },
  ongoing: {
    status: 'ongoing',
    color: '#DC2626',
    label: 'Coupure en cours',
    description: "Une coupure est en cours en ce moment d'après le planning.",
  },
};

/** Ordre de gravité croissante, pour agréger le statut de plusieurs secteurs */
const STATUS_SEVERITY: Record<WaterCutStatus, number> = {
  none: 0,
  scheduled: 1,
  ongoing: 2,
};

// ============================================================================
// LECTURE DES HORAIRES
// ============================================================================

const DAY_MAP: { [key: string]: number } = {
  dimanche: 0,
  lundi: 1,
  mardi: 2,
  mercredi: 3,
  jeudi: 4,
  vendredi: 5,
  samedi: 6,
};

const MINUTES_PER_DAY = 24 * 60;

/** Créneau horaire résolu à partir d'une phrase du planning SMGEAG */
export type ParsedSchedule = {
  /** Jours de DÉBUT de la coupure (0 = dimanche) */
  days: number[];
  /** Minute de début dans la journée */
  startMinutes: number;
  /** Durée en minutes — peut dépasser minuit (ex. « de 20h à 7h » = 11h) */
  durationMinutes: number;
};

// Parser les jours de la semaine
export function parseDaysFromHoraires(horaires: string): number[] {
  const lowerHoraires = horaires.toLowerCase();

  if (lowerHoraires.includes('tous les jours')) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  const days: number[] = [];
  Object.entries(DAY_MAP).forEach(([dayName, dayNumber]) => {
    if (lowerHoraires.includes(dayName)) {
      days.push(dayNumber);
    }
  });

  return days;
}

/**
 * Extrait le créneau d'une phrase du type « Mardi / jeudi de 20H à 7H ».
 * Retourne null si les jours ou les heures ne sont pas exploitables
 * (le planning contient des entrées « non spécifié »).
 */
export function parseSchedule(horaires: string): ParsedSchedule | null {
  const days = parseDaysFromHoraires(horaires);
  if (days.length === 0) return null;

  const match = horaires.match(/(\d{1,2})\s*[hH]\s*(\d{2})?\s*(?:à|a|-|au?)\s*(\d{1,2})\s*[hH]\s*(\d{2})?/);
  if (!match) return null;

  const startMinutes = parseInt(match[1], 10) * 60 + parseInt(match[2] ?? '0', 10);
  const endMinutes = parseInt(match[3], 10) * 60 + parseInt(match[4] ?? '0', 10);

  // Une coupure « de 20h à 7h » se termine le lendemain matin : on raisonne en
  // durée plutôt qu'en heure de fin pour gérer le passage de minuit.
  const rawDuration = (endMinutes - startMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  return {
    days,
    startMinutes,
    durationMinutes: rawDuration === 0 ? MINUTES_PER_DAY : rawDuration,
  };
}

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, amount: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
};

/**
 * La coupure est-elle en cours à l'instant `now` ?
 * On teste les créneaux démarrés aujourd'hui ET hier, pour attraper les
 * coupures de nuit qui débordent sur le matin suivant.
 */
export function isCutActiveAt(detail: WaterCutDetail, now: Date): boolean {
  const schedule = parseSchedule(detail.horaires);
  if (!schedule) return false;

  for (const dayOffset of [0, 1]) {
    const candidateDay = addDays(now, -dayOffset);
    if (!schedule.days.includes(candidateDay.getDay())) continue;

    const start = startOfDay(candidateDay).getTime() + schedule.startMinutes * 60_000;
    const end = start + schedule.durationMinutes * 60_000;

    if (now.getTime() >= start && now.getTime() < end) return true;
  }

  return false;
}

/**
 * La coupure touche-t-elle la journée calendaire `targetDate` ?
 * Vrai si elle y démarre, ou si un créneau de la veille déborde sur ce jour.
 */
export function overlapsCalendarDay(detail: WaterCutDetail, targetDate: Date): boolean {
  const schedule = parseSchedule(detail.horaires);
  if (!schedule) return false;

  if (schedule.days.includes(targetDate.getDay())) return true;

  const spillsOverMidnight = schedule.startMinutes + schedule.durationMinutes > MINUTES_PER_DAY;
  if (!spillsOverMidnight) return false;

  return schedule.days.includes(addDays(targetDate, -1).getDay());
}

// Vérifier si une commune a des coupures pour un jour donné
export function hasCutsOnDay(communeData: WaterCutData, targetDate: Date): boolean {
  return communeData.details.some(detail => overlapsCalendarDay(detail, targetDate));
}

/** Détails concernés par la période sélectionnée (tous les détails en vue semaine) */
export function getCutsForFilter(
  communeData: WaterCutData,
  dateFilter: DateFilter
): WaterCutDetail[] {
  if (dateFilter === 'week') return communeData.details;

  const targetDate = getTargetDate(dateFilter);
  return communeData.details.filter(detail => overlapsCalendarDay(detail, targetDate));
}

// Obtenir la date cible selon le filtre
export function getTargetDate(dateFilter: DateFilter): Date {
  const today = new Date();
  if (dateFilter === 'tomorrow') {
    return addDays(today, 1);
  }
  return today;
}

// ============================================================================
// STATUT AGRÉGÉ D'UNE COMMUNE
// ============================================================================

/** Statut d'un secteur pour la période sélectionnée */
export function getDetailStatus(
  detail: WaterCutDetail,
  dateFilter: DateFilter,
  now: Date = new Date()
): WaterCutStatus {
  // « En cours » n'a de sens que pour la période qui contient l'instant présent
  if (dateFilter !== 'tomorrow' && isCutActiveAt(detail, now)) {
    return 'ongoing';
  }

  if (dateFilter === 'week') {
    return parseSchedule(detail.horaires) ? 'scheduled' : 'none';
  }

  return overlapsCalendarDay(detail, getTargetDate(dateFilter)) ? 'scheduled' : 'none';
}

/** Statut le plus grave parmi les secteurs d'une commune */
export function getCommuneWaterStatus(
  communeData: WaterCutData | undefined,
  dateFilter: DateFilter,
  now: Date = new Date()
): WaterCutStatus {
  if (!communeData || communeData.details.length === 0) return 'none';

  return communeData.details.reduce<WaterCutStatus>((worst, detail) => {
    const status = getDetailStatus(detail, dateFilter, now);
    return STATUS_SEVERITY[status] > STATUS_SEVERITY[worst] ? status : worst;
  }, 'none');
}

/** Couleur de remplissage carte pour une commune */
export function getWaterStatusColor(status: WaterCutStatus): string {
  return WATER_STATUS_DETAILS[status].color;
}

// ============================================================================
// AFFICHAGE
// ============================================================================

// Liste des communes situées à l'Est (Grande-Terre & Désirade)
// Pour ces communes, on affichera le tooltip à GAUCHE pour ne pas masquer la carte
const EAST_COMMUNES = [
  'LES ABYMES', 'POINTE-À-PITRE', 'POINTE-A-PITRE', 'LE GOSIER', 'SAINTE-ANNE', 'SAINT-FRANÇOIS', 'SAINT-FRANCOIS',
  'LE MOULE', 'MORNE-À-L\'EAU', 'MORNE-A-L-EAU', 'PETIT-CANAL', 'PORT-LOUIS', 'ANSE-BERTRAND',
  'LA DÉSIRADE', 'LA DESIRADE'
];

// Détermine de quel côté afficher le tooltip (left ou right) pour ne pas cacher la commune
export function getTooltipAnchor(communeName: string): 'left' | 'right' {
  const upperName = communeName.toUpperCase();
  // Si la commune est à l'Est, on affiche le tooltip à GAUCHE
  if (EAST_COMMUNES.some(c => upperName.includes(c))) {
    return 'left';
  }
  // Sinon (Ouest, Sud), on affiche le tooltip à DROITE
  return 'right';
}

// Formater le nom d'une commune : première lettre de chaque mot en majuscule
// Exemples: "LES ABYMES" -> "Les Abymes", "SAINT-CLAUDE" -> "Saint-Claude"
export function formatCommuneName(communeName: string): string {
  // Séparer par espaces ET tirets, en préservant les séparateurs
  return communeName
    .toLowerCase()
    .split(/([\s-]+)/)
    .map((part) => {
      // Si c'est un séparateur (espace ou tiret), le garder tel quel
      if (/^[\s-]+$/.test(part)) {
        return part;
      }
      // Sinon, mettre la première lettre en majuscule
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}
