import { VigilanceLevelInfo } from './types';
import { VIGILANCE_LEVEL_DETAILS, DEFAULT_VIGILANCE_INFO } from './constants';

export function getVigilanceLevelInfo(level?: number): VigilanceLevelInfo {
  if (typeof level !== 'number') {
    return DEFAULT_VIGILANCE_INFO;
  }
  return VIGILANCE_LEVEL_DETAILS[level] || DEFAULT_VIGILANCE_INFO;
}

export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();

  if (Math.abs(diffMs) < 60 * 1000) {
    return diffMs >= 0 ? "à l'instant" : "dans moins d'une minute";
  }

  const diffMinutes = Math.round(Math.abs(diffMs) / (60 * 1000));

  if (diffMinutes < 60) {
    return diffMs >= 0 ? `il y a ${diffMinutes} min` : `dans ${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return diffMs >= 0 ? `il y a ${diffHours} h` : `dans ${diffHours} h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return diffMs >= 0 ? `il y a ${diffDays} j` : `dans ${diffDays} j`;
}

export const getSeaState = (windSpeed: number | null): string => {
  if (windSpeed === null) return 'Données non disponibles';
  if (windSpeed < 10) return 'Calme';
  if (windSpeed < 20) return 'Peu agitée';
  if (windSpeed < 30) return 'Agitée';
  if (windSpeed < 40) return 'Très agitée';
  return 'Dangereuse';
};
