/**
 * API Route: /api/weather
 *
 * Récupère les données météo actuelles pour toutes les communes de Guadeloupe
 * depuis l'API OpenWeatherMap.
 *
 * Cache: 1 heure (aligné sur le backend Python original)
 */

import { NextResponse } from 'next/server';
import { CacheManager, CACHE_TTL, CACHE_KEYS } from '@/lib/cache';
import {
  API_CONFIG,
  COMMUNE_COORDINATES,
  WeatherData,
  WeatherDataMap,
  createErrorResponse,
  calculateDewPoint,
  calculateApproximateUV,
} from '@/lib/api-clients';

// Configuration ISR - 1 heure
export const revalidate = 3600;

// ============================================================================
// TYPES INTERNES (réponse OpenWeatherMap)
// ============================================================================

interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg?: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  visibility?: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  timezone?: number;
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
}

// ============================================================================
// FONCTION DE RÉCUPÉRATION POUR UNE COMMUNE
// ============================================================================

/**
 * Récupère les données météo pour une commune spécifique
 */
async function fetchCommuneWeather(
  codeZone: string,
  info: { name: string; lat: number; lon: number }
): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY non configurée');
  }

  try {
    const url = `${API_CONFIG.OPENWEATHER.BASE_URL}${API_CONFIG.OPENWEATHER.WEATHER_ENDPOINT}?lat=${info.lat}&lon=${info.lon}&appid=${apiKey}&units=metric&lang=fr`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: OpenWeatherResponse = await response.json();

    const temp = data.main.temp;

    // Validation des données (température dans une plage raisonnable)
    if (temp === null || temp === undefined || temp < -50 || temp > 60) {
      throw new Error(`Température invalide: ${temp}°C`);
    }

    // Vérification de cohérence
    if (temp === 0 && (!data.main.humidity || data.main.humidity === 0)) {
      throw new Error('Données suspectes (temp=0, humidité manquante)');
    }

    // Calculer le point de rosée
    const dewPoint = calculateDewPoint(temp, data.main.humidity);

    // Construire l'objet WeatherData
    const weatherData: WeatherData = {
      lib_zone: info.name,
      code_zone: codeZone,
      temperature: Math.round(temp * 10) / 10,
      feels_like: Math.round(data.main.feels_like * 10) / 10,
      temp_min: Math.round(data.main.temp_min * 10) / 10,
      temp_max: Math.round(data.main.temp_max * 10) / 10,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: Math.round(data.wind.speed * 3.6 * 10) / 10, // m/s -> km/h
      wind_deg: data.wind.deg ?? 0,
      wind_gust: data.wind.gust ? Math.round(data.wind.gust * 3.6 * 10) / 10 : null,
      weather_main: data.weather[0]?.main ?? 'N/A',
      weather_description: data.weather[0]?.description ?? 'Données non disponibles',
      weather_icon: data.weather[0]?.icon ?? '01d',
      clouds: data.clouds.all,
      visibility: data.visibility ?? 10000,
      dew_point: Math.round(dewPoint * 10) / 10,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      timezone: data.timezone ?? 0,
      rain_1h: data.rain?.['1h'] ?? null,
      rain_3h: data.rain?.['3h'] ?? null,
      uv_index: calculateApproximateUV(data.clouds.all),
    };

    return weatherData;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error(`[Weather] Erreur pour ${info.name}: ${message}`);

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
      weather_icon: '01d',
      clouds: null,
      visibility: null,
      dew_point: null,
      sunrise: null,
      sunset: null,
      timezone: null,
      rain_1h: null,
      rain_3h: null,
      uv_index: null,
    };
  }
}

// ============================================================================
// FONCTION DE RÉCUPÉRATION POUR TOUTES LES COMMUNES
// ============================================================================

/**
 * Récupère les données météo pour toutes les communes en parallèle
 */
async function fetchAllWeatherData(): Promise<WeatherDataMap> {
  console.log('[Weather] Récupération des données pour toutes les communes...');

  // Créer toutes les promesses en parallèle
  const entries = Object.entries(COMMUNE_COORDINATES);
  const promises = entries.map(([codeZone, info]) =>
    fetchCommuneWeather(codeZone, info).then((data) => [codeZone, data] as const)
  );

  // Exécuter toutes les requêtes en parallèle
  const results = await Promise.all(promises);

  // Construire le dictionnaire de résultats
  const weatherData: WeatherDataMap = {};
  for (const [codeZone, data] of results) {
    weatherData[codeZone] = data;
  }

  console.log(`[Weather] Données récupérées pour ${Object.keys(weatherData).length} communes`);

  return weatherData;
}

// ============================================================================
// HANDLER GET
// ============================================================================

export async function GET() {
  try {
    // Vérifier la clé API
    if (!process.env.OPENWEATHER_API_KEY) {
      return createErrorResponse('OPENWEATHER_API_KEY non configurée', 500);
    }

    // Utiliser le système de cache
    const data = await CacheManager.getOrFetch<WeatherDataMap>(
      CACHE_KEYS.WEATHER,
      fetchAllWeatherData,
      { ttl: CACHE_TTL.WEATHER, staleWhileRevalidate: true }
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL.WEATHER}, stale-while-revalidate=${CACHE_TTL.WEATHER * 2}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[API weather] Erreur:', message);

    return createErrorResponse(
      `Impossible de récupérer les données météo: ${message}`,
      500
    );
  }
}
