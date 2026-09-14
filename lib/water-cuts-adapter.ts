/**
 * Adaptateur pour l'API publique Orisk (https://orisk.app/api/tours-deau/public).
 *
 * Orisk publie un planning structuré (jours ISO, horaires, lieux-dits) alors
 * que le reste de l'app (parsing, tests, affichage) est construit autour du
 * format texte libre du SMGEAG — ex. « Lundi / mercredi / vendredi de 16h à
 * 9h » et « Secteur 1 (Bourg, Valeau, …) ». Plutôt que de dupliquer cette
 * logique, on reconstruit ce même format texte à partir des champs structurés
 * : `app/(dashboard)/lib/water.ts` continue de fonctionner sans changement.
 */

import { COMMUNE_COORDINATES, type WaterCutDetail, type WaterCutsDataMap } from './api-clients';

interface OriskDaySchedule {
  fermeture?: string;
  ouverture?: string;
}

interface OriskZone {
  zone: string;
  commune: string;
  secteur: string;
  status?: string;
  fermeture?: string;
  ouverture?: string;
  lieux_dits?: string[];
  lieux_dits_favorables?: string[];
  /** Jours ISO 8601 : 1 = lundi … 7 = dimanche. */
  jours?: number[];
  horaires_par_jour?: Record<string, OriskDaySchedule> | null;
}

export interface OriskToursDeauResponse {
  generated_at: string;
  communes: Record<string, OriskZone[]>;
  alerts?: unknown[];
}

const ISO_WEEKDAY_NAMES = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

function normalizeName(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/** Table de correspondance nom de commune (Orisk) → code INSEE. */
const COMMUNE_CODE_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(COMMUNE_COORDINATES).map(([code, info]) => [normalizeName(info.name), code])
);

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** « 16H » → « 16h », pour rester dans le style d'affichage du planning SMGEAG. */
function formatHour(value: string | undefined): string {
  return (value ?? '').trim().replace(/H$/i, 'h');
}

/**
 * Reconstruit un libellé « Lundi / mercredi / vendredi de 16h à 9h » à partir
 * des jours ISO et des horaires (par défaut ou dérogatoires par jour).
 * Absence de jours/horaires = zone en alimentation favorable, sans coupure.
 */
function buildScheduleLabel(zone: OriskZone): string {
  const jours = [...(zone.jours ?? [])].sort((a, b) => a - b);
  const hasSchedule = jours.length > 0 && (zone.ouverture || zone.fermeture || zone.horaires_par_jour);
  if (!hasSchedule) return 'Alimentation favorable maintenue.';

  const groups: { hours: string; days: number[] }[] = [];
  for (const day of jours) {
    const override = zone.horaires_par_jour?.[String(day)];
    const fermeture = formatHour(override?.fermeture || zone.fermeture);
    const ouverture = formatHour(override?.ouverture || zone.ouverture);
    const hours = `de ${fermeture} à ${ouverture}`;

    const group = groups.find((g) => g.hours === hours);
    if (group) group.days.push(day);
    else groups.push({ hours, days: [day] });
  }

  // Seul le premier segment démarre une phrase (« Lundi / mercredi de 20h à
  // 5h, vendredi de 20h à 9h ») : les suivants, après la virgule, continuent
  // en minuscule — comme le fait le planning SMGEAG.
  return groups
    .map(({ hours, days }, index) => {
      const label = days.length === 7 ? 'tous les jours' : days.map((day) => ISO_WEEKDAY_NAMES[day - 1]).join(' / ');
      return `${index === 0 ? capitalize(label) : label} ${hours}`;
    })
    .join(', ');
}

/**
 * Nom de secteur + lieux-dits entre parenthèses, dans le même format que le
 * planning SMGEAG (`sectorDetail`/`shortSector` s'appuient dessus).
 * Le nom de zone Orisk répète parfois tel quel le nom de la commune (ex.
 * « Gourbeyre ») quand seul le secteur (BASSE-TERRE/CENTRE/GRANDE-TERRE)
 * distingue les entrées : dans ce cas, le secteur porte le libellé.
 */
function buildSectorLabel(zone: OriskZone): string {
  const head = zone.zone && zone.zone !== zone.commune ? `${zone.secteur} — ${zone.zone}` : zone.secteur;
  const lieuxDits = zone.lieux_dits?.length ? ` (${zone.lieux_dits.join(', ')})` : '';
  return `${head}${lieuxDits}`;
}

/**
 * Transforme la réponse Orisk en `WaterCutsDataMap`, clé par code INSEE.
 * Les communes absentes de la réponse (pas de tour d'eau en cours) ne
 * produisent aucune entrée — c'est déjà le comportement attendu en aval.
 */
export function adaptOriskResponse(response: OriskToursDeauResponse): WaterCutsDataMap {
  const result: WaterCutsDataMap = {};

  for (const [communeName, zones] of Object.entries(response.communes ?? {})) {
    const code = COMMUNE_CODE_BY_NAME[normalizeName(communeName)];
    if (!code) {
      console.warn(`[Orisk] Commune non reconnue, ignorée : "${communeName}"`);
      continue;
    }

    const details: WaterCutDetail[] = zones.map((zone) => {
      const detail: WaterCutDetail = {
        secteur: buildSectorLabel(zone),
        horaires: buildScheduleLabel(zone),
      };
      if (zone.lieux_dits_favorables?.length) {
        detail.zones_alimentation_favorables = zone.lieux_dits_favorables.join(', ');
      }
      return detail;
    });

    result[code] = {
      commune: COMMUNE_COORDINATES[code].name,
      details,
    };
  }

  return result;
}
