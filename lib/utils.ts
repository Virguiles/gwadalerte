import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse une date au format YYYY-MM-DD en évitant le décalage de fuseau horaire
 * En parsant manuellement, on évite que JavaScript interprète la date comme UTC minuit
 */
export function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formate une date ISO (YYYY-MM-DD) en format lisible français
 * Corrige le problème de décalage de fuseau horaire
 */
export function formatDate(isoDate: string): string {
  try {
    const date = parseLocalDate(isoDate);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Obtient le nom du jour à partir d'une date ISO (YYYY-MM-DD)
 * Compare avec la date locale actuelle pour déterminer "Aujourd'hui" ou "Demain"
 */
export function getDayName(isoDate: string, index?: number): string {
  try {
    const date = parseLocalDate(isoDate);

    // Obtenir la date d'aujourd'hui en local
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtenir la date de demain
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Comparer les dates (sans l'heure)
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    if (compareDate.getTime() === today.getTime()) {
      return "Aujourd'hui";
    }
    if (compareDate.getTime() === tomorrow.getTime()) {
      return 'Demain';
    }

    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  } catch {
    // Fallback sur l'index si le parsing échoue
    if (index === 0) return "Aujourd'hui";
    if (index === 1) return 'Demain';
    return index !== undefined ? `J+${index}` : isoDate;
  }
}
