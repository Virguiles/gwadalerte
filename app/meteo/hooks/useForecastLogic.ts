import { useMemo } from 'react';
import { DailyForecast } from '../types';
import { parseLocalDate } from '@/lib/utils';

export function useForecastProcessing(dailyForecasts: DailyForecast[] | undefined) {
  const todayForecast = useMemo(() => {
    if (!dailyForecasts || dailyForecasts.length === 0) return null;

    // Obtenir la date d'aujourd'hui en local
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Chercher la prévision qui correspond à aujourd'hui
    for (const dayForecast of dailyForecasts) {
      try {
        const forecastDate = parseLocalDate(dayForecast.date);
        forecastDate.setHours(0, 0, 0, 0);

        if (forecastDate.getTime() === today.getTime()) {
          return dayForecast;
        }
      } catch {
        // Si le parsing échoue, continuer
      }
    }

    // Fallback sur le premier élément si aucune correspondance
    return dailyForecasts[0] || null;
  }, [dailyForecasts]);

  const tomorrowForecast = useMemo(() => {
    if (!dailyForecasts || dailyForecasts.length === 0) return null;

    // Obtenir la date de demain en local
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Chercher la prévision qui correspond à demain
    for (const dayForecast of dailyForecasts) {
      try {
        const forecastDate = parseLocalDate(dayForecast.date);
        forecastDate.setHours(0, 0, 0, 0);

        if (forecastDate.getTime() === tomorrow.getTime()) {
          return dayForecast;
        }
      } catch {
        // Si le parsing échoue, continuer
      }
    }

    // Fallback sur le deuxième élément si aucune correspondance
    return dailyForecasts[1] || null;
  }, [dailyForecasts]);

  const threeDaysForecast = useMemo(() => {
    if (!dailyForecasts || dailyForecasts.length === 0) return null;

    // Obtenir la date de J+3 en local
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Chercher la prévision qui correspond à J+3
    for (const dayForecast of dailyForecasts) {
      try {
        const forecastDate = parseLocalDate(dayForecast.date);
        forecastDate.setHours(0, 0, 0, 0);

        if (forecastDate.getTime() === threeDaysFromNow.getTime()) {
          return dayForecast;
        }
      } catch {
        // Si le parsing échoue, continuer
      }
    }

    // Fallback sur le troisième élément si aucune correspondance
    return dailyForecasts[2] || null;
  }, [dailyForecasts]);

  return {
    todayForecast,
    tomorrowForecast,
    threeDaysForecast
  };
}
