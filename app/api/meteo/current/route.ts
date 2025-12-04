/**
 * API Route: /api/meteo/current
 *
 * Récupère les données météo actuelles pour toutes les communes de Guadeloupe
 * depuis l'API Open-Meteo (gratuite, sans clé API).
 *
 * Cache: 15 minutes (données actuelles nécessitant des mises à jour fréquentes)
 */

import { NextResponse } from 'next/server';
import { CacheManager, CACHE_TTL, CACHE_KEYS } from '@/lib/cache';
import {
  COMMUNE_COORDINATES,
  WeatherData,
  WeatherDataMap,
  createErrorResponse,
} from '@/lib/api-clients';
import { getShortWeatherLabel, getWeatherIcon, getWeatherDescription } from '@/lib/weather-codes';

// Configuration ISR - 15 minutes
export const revalidate = 900;

// ============================================================================
// CONFIGURATION OPEN-METEO
// ============================================================================

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Paramètres pour la météo actuelle
const CURRENT_PARAMS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'cloud_cover',
  'surface_pressure',
  'is_day',
].join(',');

// Paramètres pour les données journalières (min/max du jour)
const DAILY_PARAMS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'sunrise',
  'sunset',
  'uv_index_max',
  'precipitation_sum',
].join(',');

// ============================================================================
// TYPES INTERNES (réponse Open-Meteo)
// ============================================================================

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: Record<string, string>;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    cloud_cover: number;
    surface_pressure: number;
    is_day: number;
  };
  daily_units: Record<string, string>;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
  };
}

// ============================================================================
// FONCTION DE RÉCUPÉRATION POUR UNE COMMUNE
// ============================================================================

/**
 * Calcule le point de rosée approximatif
 */
function calculateDewPoint(temperature: number, humidity: number): number {
  return temperature - ((100 - humidity) / 5);
}

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
 * Récupère les données météo pour une commune spécifique avec retry en cas d'erreur 429
 */
async function fetchCommuneWeather(
  codeZone: string,
  info: { name: string; lat: number; lon: number },
  retryCount: number = 0
): Promise<WeatherData> {
  const MAX_RETRIES = 3;
  const INITIAL_DELAY = 1000; // 1 seconde de base

  try {
    const url = new URL(OPEN_METEO_BASE_URL);
    url.searchParams.set('latitude', info.lat.toString());
    url.searchParams.set('longitude', info.lon.toString());
    url.searchParams.set('current', CURRENT_PARAMS);
    url.searchParams.set('daily', DAILY_PARAMS);
    url.searchParams.set('timezone', 'America/Guadeloupe');
    url.searchParams.set('forecast_days', '1');

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      // Ne pas mettre de cache ici car on gère le cache au niveau supérieur
    });

    // Gérer spécifiquement les erreurs 429 (rate limiting)
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        // Backoff exponentiel : 1s, 2s, 4s
        const delay = INITIAL_DELAY * Math.pow(2, retryCount);
        console.warn(`[Meteo] Rate limit pour ${info.name}, attente ${delay}ms avant retry ${retryCount + 1}/${MAX_RETRIES}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchCommuneWeather(codeZone, info, retryCount + 1);
      } else {
        throw new Error(`HTTP ${response.status} - Rate limit après ${MAX_RETRIES} tentatives`);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: OpenMeteoResponse = await response.json();

    const current = data.current;
    const daily = data.daily;

    // Validation des données
    if (current.temperature_2m === null || current.temperature_2m === undefined) {
      throw new Error('Température non disponible');
    }

    // Déterminer si c'est le jour ou la nuit
    const isDay = current.is_day === 1;
    // Extraire l'heure dans le fuseau horaire de la Guadeloupe
    // current.time est déjà dans le fuseau horaire spécifié (America/Guadeloupe)
    const currentTime = new Date(current.time);
    // Convertir en heure locale de la Guadeloupe pour être sûr
    const guadeloupeTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'America/Guadeloupe' }));
    const currentHour = guadeloupeTime.getHours();

    // Obtenir l'icône appropriée selon jour/nuit
    const weatherIcon = getWeatherIcon(current.weather_code, currentHour);

    // Calculer le point de rosée
    const dewPoint = calculateDewPoint(current.temperature_2m, current.relative_humidity_2m);

    // Construire l'objet WeatherData (compatible avec le format existant)
    const weatherData: WeatherData = {
      lib_zone: info.name,
      code_zone: codeZone,
      temperature: Math.round(current.temperature_2m * 10) / 10,
      feels_like: Math.round(current.apparent_temperature * 10) / 10,
      temp_min: Math.round(daily.temperature_2m_min[0] * 10) / 10,
      temp_max: Math.round(daily.temperature_2m_max[0] * 10) / 10,
      humidity: current.relative_humidity_2m,
      pressure: Math.round(current.surface_pressure),
      wind_speed: Math.round(current.wind_speed_10m * 10) / 10, // Déjà en km/h
      wind_deg: current.wind_direction_10m,
      wind_gust: current.wind_gusts_10m ? Math.round(current.wind_gusts_10m * 10) / 10 : null,
      weather_main: getShortWeatherLabel(current.weather_code),
      weather_description: getWeatherDescription(current.weather_code, isDay, currentHour),
      weather_icon: weatherIcon, // Icône Lucide avec distinction jour/nuit
      clouds: current.cloud_cover,
      visibility: 10000, // Open-Meteo ne fournit pas la visibilité, valeur par défaut
      dew_point: Math.round(dewPoint * 10) / 10,
      sunrise: formatTime(daily.sunrise[0]),
      sunset: formatTime(daily.sunset[0]),
      timezone: 0, // Non utilisé avec Open-Meteo
      rain_1h: current.precipitation > 0 ? current.precipitation : null,
      rain_3h: null, // Non disponible dans l'API actuelle
      uv_index: daily.uv_index_max[0] ? Math.round(daily.uv_index_max[0] * 10) / 10 : null,
      // Nouveaux champs spécifiques Open-Meteo
      weather_code: current.weather_code,
      is_day: isDay,
    };

    return weatherData;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`[Meteo] Erreur pour ${info.name}: ${message}`);

    // Retourner des données par défaut en cas d'erreur
    return {
      lib_zone: info.name,
      code_zone: codeZone,
      temperature: null,
      feels_like: null,
      temp_min: null,
      temp_max: null,
      humidity: null,
      pressure: null,
      wind_speed: null,
      wind_deg: null,
      wind_gust: null,
      weather_main: 'N/A',
      weather_description: 'Données non disponibles',
      weather_icon: 'HelpCircle',
      clouds: null,
      visibility: null,
      dew_point: null,
      sunrise: null,
      sunset: null,
      timezone: null,
      rain_1h: null,
      rain_3h: null,
      uv_index: null,
      weather_code: undefined,
      is_day: undefined,
    };
  }
}

// ============================================================================
// FONCTION DE RÉCUPÉRATION POUR TOUTES LES COMMUNES
// ============================================================================

/**
 * Récupère les données météo pour toutes les communes
 * Utilise des requêtes en parallèle mais avec un délai pour éviter le rate limiting
 */
async function fetchAllWeatherData(): Promise<WeatherDataMap> {
  console.log('[Meteo Open-Meteo] Récupération des données pour toutes les communes...');

  const entries = Object.entries(COMMUNE_COORDINATES);
  const weatherData: WeatherDataMap = {};

  // Réduire la taille des batchs à 5 pour éviter le rate limiting
  // Open-Meteo limite à ~10 requêtes/seconde en gratuit
  const batchSize = 5;
  const batches = [];

  for (let i = 0; i < entries.length; i += batchSize) {
    batches.push(entries.slice(i, i + batchSize));
  }

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];

    // Exécuter chaque lot en parallèle avec gestion d'erreur individuelle
    const promises = batch.map(([codeZone, info]) =>
      fetchCommuneWeather(codeZone, info)
        .then((data) => ({ codeZone, data, success: true }))
        .catch((error) => {
          console.error(`[Meteo] Erreur pour ${info.name}: ${error.message}`);
          return { codeZone, data: null, success: false, error: error.message };
        })
    );

    const results = await Promise.all(promises);

    for (const result of results) {
      if (result.success && result.data) {
        weatherData[result.codeZone] = result.data;
      }
    }

    // Délai augmenté entre les lots (500ms) pour respecter les limites de l'API gratuite
    // Open-Meteo recommande de ne pas dépasser 10 requêtes/seconde
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`[Meteo Open-Meteo] Données récupérées pour ${Object.keys(weatherData).length} communes`);

  return weatherData;
}

// ============================================================================
// HANDLER GET
// ============================================================================

export async function GET() {
  try {
    // Utiliser le système de cache avec TTL de 15 minutes
    const data = await CacheManager.getOrFetch<WeatherDataMap>(
      CACHE_KEYS.WEATHER,
      fetchAllWeatherData,
      { ttl: CACHE_TTL.CURRENT_WEATHER || 900, staleWhileRevalidate: true }
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL.CURRENT_WEATHER || 900}, stale-while-revalidate=${(CACHE_TTL.CURRENT_WEATHER || 900) * 2}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[API meteo/current] Erreur:', message);

    return createErrorResponse(
      `Impossible de récupérer les données météo: ${message}`,
      500
    );
  }
}
