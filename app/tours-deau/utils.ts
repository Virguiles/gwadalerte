import { COMMUNE_COLORS, COLOR_PALETTE } from './constants';
import { CommuneColors, DateFilter, WaterCutData } from './types';

// Générer une couleur unique basée sur le nom de la commune
function generateColorFromName(communeName: string): CommuneColors {
  let hash = 0;
  for (let i = 0; i < communeName.length; i++) {
    hash = communeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[colorIndex];
}

// Obtenir les couleurs d'une commune
export function getCommuneColors(communeName: string): CommuneColors {
  if (COMMUNE_COLORS[communeName]) {
    return COMMUNE_COLORS[communeName];
  }
  return generateColorFromName(communeName);
}

// Parser les jours de la semaine
export function parseDaysFromHoraires(horaires: string): number[] {
  const days: number[] = [];
  const lowerHoraires = horaires.toLowerCase();

  if (lowerHoraires.includes('tous les jours')) {
    return [0, 1, 2, 3, 4, 5, 6];
  }

  const dayMap: { [key: string]: number } = {
    'dimanche': 0, 'lundi': 1, 'mardi': 2, 'mercredi': 3,
    'jeudi': 4, 'vendredi': 5, 'samedi': 6
  };

  Object.entries(dayMap).forEach(([dayName, dayNumber]) => {
    if (lowerHoraires.includes(dayName)) {
      days.push(dayNumber);
    }
  });

  return days;
}

// Vérifier si une commune a des coupures pour un jour donné
export function hasCutsOnDay(communeData: WaterCutData, targetDate: Date): boolean {
  const targetDay = targetDate.getDay();
  return communeData.details.some(detail => {
    const days = parseDaysFromHoraires(detail.horaires);
    return days.includes(targetDay);
  });
}

// Obtenir la date cible selon le filtre
export function getTargetDate(dateFilter: DateFilter): Date {
  const today = new Date();
  if (dateFilter === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  return today;
}

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
