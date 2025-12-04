/**
 * API Route: /api/meteo/forecast
 *
 * Récupère les prévisions météo sur 3 jours pour une commune ou toutes les communes
 * depuis l'API Open-Meteo (gratuite, sans clé API).
 *
 * Paramètres:
 * - code_zone (optionnel): Code INSEE de la commune (ex: 97105)
 *   Si non fourni, retourne les prévisions pour toutes les communes
 *
 * Cache: 3 heures (prévisions stables sur cette période)
 */

import { NextRequest, NextResponse } from 'next/server';
import { CacheManager, CACHE_TTL, CACHE_KEYS } from '@/lib/cache';
import {
  COMMUNE_COORDINATES,
  createErrorResponse,
} from '@/lib/api-clients';
import { getWeatherInfo, getShortWeatherLabel, getWeatherIcon, getWeatherDescription } from '@/lib/weather-codes';
import { formatDate as formatDateUtil, getDayName as getDayNameUtil } from '@/lib/utils';

// Configuration dynamique - cette route utilise des paramètres de requête
export const dynamic = 'force-dynamic';

// ============================================================================
// CONFIGURATION OPEN-METEO
// ============================================================================

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Paramètres pour les prévisions horaires
const HOURLY_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'cloud_cover',
  'is_day',
].join(',');

// Paramètres pour les prévisions journalières
const DAILY_PARAMS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'sunrise',
  'sunset',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'wind_direction_10m_dominant',
  'uv_index_max',
].join(',');

// ============================================================================
// TYPES
// ============================================================================

interface HourlyForecast {
  time: string;
  hour: string;
  timestamp: number;
  temperature: number;
  feels_like: number;
  humidity: number;
  precipitation: number;
  precipitation_probability: number;
  weather_code: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  wind_speed: number;
  wind_deg: number;
  clouds: number;
  is_day: boolean;
}

interface DailyForecast {
  date: string;
  date_formatted: string;
  day_name: string;
  temp_min: number;
  temp_max: number;
  feels_like_min: number;
  feels_like_max: number;
  weather_code: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  precipitation_sum: number;
  precipitation_probability: number;
  wind_speed_max: number;
  wind_gusts_max: number;
  wind_direction: number;
  uv_index: number;
  sunrise: string;
  sunset: string;
  hourly: HourlyForecast[];
}

interface ForecastData {
  code_zone: string;
  lib_zone: string;
  latitude: number;
  longitude: number;
  timezone: string;
  daily: DailyForecast[];
  last_updated: number;
}

interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: Record<string, string>;
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    cloud_cover: number[];
    is_day: number[];
  };
  daily_units: Record<string, string>;
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
    uv_index_max: number[];
  };
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

// Utiliser les fonctions utilitaires centralisées pour les dates
const formatDate = formatDateUtil;
const getDayName = (isoDate: string, index: number) => getDayNameUtil(isoDate, index);

/**
 * Formate une heure ISO en format HH:MM
 */
function formatTime(isoTime: string): string {
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '--:--';
  }
}

/**
 * Extrait l'heure d'une chaîne ISO
 */
function extractHour(isoTime: string): string {
  try {
    const date = new Date(isoTime);
    return date.getHours().toString().padStart(2, '0') + 'h';
  } catch {
    return '--h';
  }
}

// ============================================================================
// FONCTION DE RÉCUPÉRATION DES PRÉVISIONS
// ============================================================================

/**
 * Récupère les prévisions pour une commune avec retry en cas d'erreur 429
 */
async function fetchCommuneForecast(
  codeZone: string,
  info: { name: string; lat: number; lon: number },
  addDelay: boolean = false,
  retryCount: number = 0
): Promise<ForecastData> {
  const MAX_RETRIES = 3;
  const INITIAL_DELAY = 1000; // 1 seconde de base

  try {
    // Petit délai pour éviter le rate limiting lors des requêtes individuelles
    if (addDelay) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const url = new URL(OPEN_METEO_BASE_URL);
    url.searchParams.set('latitude', info.lat.toString());
    url.searchParams.set('longitude', info.lon.toString());
    url.searchParams.set('hourly', HOURLY_PARAMS);
    url.searchParams.set('daily', DAILY_PARAMS);
    url.searchParams.set('timezone', 'America/Guadeloupe');
    url.searchParams.set('forecast_days', '3');

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
    });

    // Gérer spécifiquement les erreurs 429 (rate limiting)
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        // Backoff exponentiel : 1s, 2s, 4s
        const delay = INITIAL_DELAY * Math.pow(2, retryCount);
        console.warn(`[Forecast] Rate limit pour ${info.name}, attente ${delay}ms avant retry ${retryCount + 1}/${MAX_RETRIES}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchCommuneForecast(codeZone, info, addDelay, retryCount + 1);
      } else {
        throw new Error(`HTTP ${response.status} - Rate limit après ${MAX_RETRIES} tentatives`);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: OpenMeteoForecastResponse = await response.json();

    // Organiser les données par jour
    const dailyForecasts: DailyForecast[] = [];

    for (let dayIndex = 0; dayIndex < data.daily.time.length; dayIndex++) {
      const dayDate = data.daily.time[dayIndex];
      const weatherCode = data.daily.weather_code[dayIndex];
      const weatherInfo = getWeatherInfo(weatherCode);
      // Pour les prévisions journalières, utiliser l'icône du jour (12h)
      const dayIcon = getWeatherIcon(weatherCode, 12);

      // Filtrer les heures correspondant à ce jour
      const dayHourly: HourlyForecast[] = [];

      for (let hourIndex = 0; hourIndex < data.hourly.time.length; hourIndex++) {
        const hourTime = data.hourly.time[hourIndex];
        if (hourTime.startsWith(dayDate)) {
          const hourWeatherCode = data.hourly.weather_code[hourIndex];
          const hourWeatherInfo = getWeatherInfo(hourWeatherCode);
          const isDay = data.hourly.is_day[hourIndex] === 1;
          const hour = new Date(hourTime).getHours();

          dayHourly.push({
            time: hourTime,
            hour: extractHour(hourTime),
            timestamp: new Date(hourTime).getTime() / 1000,
            temperature: Math.round(data.hourly.temperature_2m[hourIndex] * 10) / 10,
            feels_like: Math.round(data.hourly.apparent_temperature[hourIndex] * 10) / 10,
            humidity: data.hourly.relative_humidity_2m[hourIndex],
            precipitation: data.hourly.precipitation[hourIndex],
            precipitation_probability: data.hourly.precipitation_probability[hourIndex],
            weather_code: hourWeatherCode,
            weather_main: getShortWeatherLabel(hourWeatherCode),
            weather_description: getWeatherDescription(hourWeatherCode, isDay, hour),
            weather_icon: getWeatherIcon(hourWeatherCode, hour),
            wind_speed: Math.round(data.hourly.wind_speed_10m[hourIndex] * 10) / 10,
            wind_deg: data.hourly.wind_direction_10m[hourIndex],
            clouds: data.hourly.cloud_cover[hourIndex],
            is_day: isDay,
          });
        }
      }

      dailyForecasts.push({
        date: dayDate,
        date_formatted: formatDate(dayDate),
        day_name: getDayName(dayDate, dayIndex),
        temp_min: Math.round(data.daily.temperature_2m_min[dayIndex] * 10) / 10,
        temp_max: Math.round(data.daily.temperature_2m_max[dayIndex] * 10) / 10,
        feels_like_min: Math.round(data.daily.apparent_temperature_min[dayIndex] * 10) / 10,
        feels_like_max: Math.round(data.daily.apparent_temperature_max[dayIndex] * 10) / 10,
        weather_code: weatherCode,
        weather_main: getShortWeatherLabel(weatherCode),
        weather_description: getWeatherDescription(weatherCode, true), // Pour les prévisions journalières, on utilise le jour
        weather_icon: dayIcon,
        precipitation_sum: Math.round(data.daily.precipitation_sum[dayIndex] * 10) / 10,
        precipitation_probability: data.daily.precipitation_probability_max[dayIndex],
        wind_speed_max: Math.round(data.daily.wind_speed_10m_max[dayIndex] * 10) / 10,
        wind_gusts_max: Math.round(data.daily.wind_gusts_10m_max[dayIndex] * 10) / 10,
        wind_direction: data.daily.wind_direction_10m_dominant[dayIndex],
        uv_index: Math.round(data.daily.uv_index_max[dayIndex] * 10) / 10,
        sunrise: formatTime(data.daily.sunrise[dayIndex]),
        sunset: formatTime(data.daily.sunset[dayIndex]),
        hourly: dayHourly,
      });
    }

    return {
      code_zone: codeZone,
      lib_zone: info.name,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      daily: dailyForecasts,
      last_updated: Date.now(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`[Forecast] Erreur pour ${info.name}: ${message}`);

    return {
      code_zone: codeZone,
      lib_zone: info.name,
      latitude: info.lat,
      longitude: info.lon,
      timezone: 'America/Guadeloupe',
      daily: [],
      last_updated: Date.now(),
    };
  }
}

/**
 * Récupère les prévisions pour toutes les communes (résumé uniquement)
 */
async function fetchAllForecastsSummary(): Promise<Record<string, ForecastData>> {
  console.log('[Forecast Open-Meteo] Récupération des prévisions pour toutes les communes...');

  const entries = Object.entries(COMMUNE_COORDINATES);
  const forecasts: Record<string, ForecastData> = {};

  // Diviser en lots de 5 pour les prévisions (plus de données par requête)
  const batchSize = 5;
  const batches = [];

  for (let i = 0; i < entries.length; i += batchSize) {
    batches.push(entries.slice(i, i + batchSize));
  }

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];

    // Exécuter chaque lot en parallèle avec gestion d'erreur individuelle
    const promises = batch.map(([codeZone, info]) =>
      fetchCommuneForecast(codeZone, info, false)
        .then((data) => ({ codeZone, data, success: true }))
        .catch((error) => {
          console.error(`[Forecast] Erreur pour ${info.name}: ${error.message}`);
          return { codeZone, data: null, success: false, error: error.message };
        })
    );

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result.success && result.data) {
        forecasts[result.codeZone] = result.data;
      }
    }

    // Délai augmenté entre les lots (500ms) pour respecter les limites de l'API gratuite
    // Open-Meteo recommande de ne pas dépasser 10 requêtes/seconde
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`[Forecast Open-Meteo] Prévisions récupérées pour ${Object.keys(forecasts).length} communes`);

  return forecasts;
}

// ============================================================================
// HANDLER GET
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const codeZone = searchParams.get('code_zone');

    // Si un code_zone est spécifié, retourner les prévisions pour cette commune
    if (codeZone) {
      // Valider le code_zone
      if (!/^\d{5}$/.test(codeZone)) {
        return createErrorResponse('Code zone invalide (format attendu: 5 chiffres)', 400);
      }

      const commune = COMMUNE_COORDINATES[codeZone];
      if (!commune) {
        return createErrorResponse(`Commune ${codeZone} non trouvée`, 404);
      }

      // Cache individuel par commune
      const cacheKey = CACHE_KEYS.FORECAST(codeZone);

      const data = await CacheManager.getOrFetch<ForecastData>(
        cacheKey,
        () => fetchCommuneForecast(codeZone, commune, true),
        { ttl: CACHE_TTL.FORECAST, staleWhileRevalidate: true }
      );

      return NextResponse.json(data, {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_TTL.FORECAST}, stale-while-revalidate=${CACHE_TTL.FORECAST * 2}`,
        },
      });
    }

    // Sinon, retourner les prévisions pour toutes les communes
    const cacheKey = 'forecast_all';

    const data = await CacheManager.getOrFetch<Record<string, ForecastData>>(
      cacheKey,
      fetchAllForecastsSummary,
      { ttl: CACHE_TTL.FORECAST, staleWhileRevalidate: true }
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL.FORECAST}, stale-while-revalidate=${CACHE_TTL.FORECAST * 2}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[API meteo/forecast] Erreur:', message);

    return createErrorResponse(
      `Impossible de récupérer les prévisions: ${message}`,
      500
    );
  }
}
