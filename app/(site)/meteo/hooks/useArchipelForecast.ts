import { useState, useEffect, useMemo, useCallback } from 'react';
import { ForecastData, DailyForecast } from '../types';

interface ArchipelForecastData {
  daily: DailyForecast[];
  last_updated: number;
}

/**
 * Hook pour récupérer et agréger les prévisions de toutes les communes de l'archipel
 */
export function useArchipelForecast() {
  const [allForecasts, setAllForecasts] = useState<Record<string, ForecastData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les prévisions de toutes les communes
  const fetchAllForecasts = useCallback(async () => {
    if (typeof window === 'undefined') return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/meteo/forecast');

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      setAllForecasts(data);
      console.log('[ArchipelForecast] Prévisions chargées pour toutes les communes');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('[ArchipelForecast] Erreur:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les prévisions au montage
  useEffect(() => {
    fetchAllForecasts();
  }, [fetchAllForecasts]);

  // Agréger les prévisions par jour
  const archipelForecast: ArchipelForecastData | null = useMemo(() => {
    if (!allForecasts) return null;

    const communeForecasts = Object.values(allForecasts).filter(f => f.daily && f.daily.length > 0);

    if (communeForecasts.length === 0) return null;

    // Nombre de jours de prévision (généralement 3)
    const numDays = communeForecasts[0]?.daily.length || 0;
    const aggregatedDays: DailyForecast[] = [];

    // Pour chaque jour, calculer les moyennes
    for (let dayIndex = 0; dayIndex < numDays; dayIndex++) {
      const dayData = communeForecasts
        .map(f => f.daily[dayIndex])
        .filter(Boolean);

      if (dayData.length === 0) continue;

      // Calculer les moyennes
      const avgTempMin = dayData.reduce((sum, d) => sum + d.temp_min, 0) / dayData.length;
      const avgTempMax = dayData.reduce((sum, d) => sum + d.temp_max, 0) / dayData.length;
      const avgFeelsLikeMin = dayData.reduce((sum, d) => sum + d.feels_like_min, 0) / dayData.length;
      const avgFeelsLikeMax = dayData.reduce((sum, d) => sum + d.feels_like_max, 0) / dayData.length;
      const avgPrecipitation = dayData.reduce((sum, d) => sum + d.precipitation_sum, 0) / dayData.length;
      const avgPrecipProb = dayData.reduce((sum, d) => sum + d.precipitation_probability, 0) / dayData.length;
      const avgWindSpeed = dayData.reduce((sum, d) => sum + d.wind_speed_max, 0) / dayData.length;
      const avgWindGusts = dayData.reduce((sum, d) => sum + d.wind_gusts_max, 0) / dayData.length;
      const avgUV = dayData.reduce((sum, d) => sum + d.uv_index, 0) / dayData.length;

      // Trouver le temps le plus fréquent
      const weatherCount: Record<string, { count: number; data: DailyForecast }> = {};
      dayData.forEach(d => {
        const key = d.weather_code.toString();
        if (!weatherCount[key]) {
          weatherCount[key] = { count: 0, data: d };
        }
        weatherCount[key].count++;
      });

      const mostCommon = Object.values(weatherCount)
        .sort((a, b) => b.count - a.count)[0]?.data || dayData[0];

      // Utiliser les données de la première commune pour les heures et dates
      const firstDay = dayData[0];

      aggregatedDays.push({
        date: firstDay.date,
        date_formatted: firstDay.date_formatted,
        day_name: firstDay.day_name,
        temp_min: Math.round(avgTempMin * 10) / 10,
        temp_max: Math.round(avgTempMax * 10) / 10,
        feels_like_min: Math.round(avgFeelsLikeMin * 10) / 10,
        feels_like_max: Math.round(avgFeelsLikeMax * 10) / 10,
        weather_code: mostCommon.weather_code,
        weather_main: mostCommon.weather_main,
        weather_description: mostCommon.weather_description,
        weather_icon: mostCommon.weather_icon,
        precipitation_sum: Math.round(avgPrecipitation * 10) / 10,
        precipitation_probability: Math.round(avgPrecipProb),
        wind_speed_max: Math.round(avgWindSpeed * 10) / 10,
        wind_gusts_max: Math.round(avgWindGusts * 10) / 10,
        wind_direction: mostCommon.wind_direction,
        uv_index: Math.round(avgUV * 10) / 10,
        sunrise: firstDay.sunrise,
        sunset: firstDay.sunset,
        hourly: [], // Pas de données horaires pour la vue globale
      });
    }

    return {
      daily: aggregatedDays,
      last_updated: Date.now(),
    };
  }, [allForecasts]);

  return {
    forecast: archipelForecast,
    loading,
    error,
    refetch: fetchAllForecasts,
  };
}
