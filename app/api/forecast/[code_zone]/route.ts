/**
 * API Route: /api/forecast/[code_zone]
 *
 * Récupère les prévisions météo sur 5 jours pour une commune spécifique
 * depuis l'API OpenWeatherMap.
 *
 * Cache: 3 heures (aligné sur le backend Python original)
 */

import { NextResponse } from 'next/server';
import { CacheManager, CACHE_TTL, CACHE_KEYS } from '@/lib/cache';
import {
  API_CONFIG,
  COMMUNE_COORDINATES,
  ForecastData,
  HourlyForecast,
  DailySummary,
  createErrorResponse,
} from '@/lib/api-clients';

// Configuration ISR - 3 heures
export const revalidate = 10800;

// ============================================================================
// TYPES INTERNES (réponse OpenWeatherMap Forecast)
// ============================================================================

interface OpenWeatherForecastItem {
  dt: number;
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
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg?: number;
  };
  pop?: number;
  rain?: {
    '3h'?: number;
  };
}

interface OpenWeatherForecastResponse {
  list: OpenWeatherForecastItem[];
  city: {
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
  };
}

// ============================================================================
// FONCTION DE RÉCUPÉRATION DES PRÉVISIONS
// ============================================================================

/**
 * Récupère les prévisions pour une commune
 */
async function fetchForecastData(codeZone: string): Promise<ForecastData> {
  const commune = COMMUNE_COORDINATES[codeZone];

  if (!commune) {
    return {
      code_zone: codeZone,
      lib_zone: 'Commune inconnue',
      daily: {},
      error: `Commune ${codeZone} non trouvée`,
    };
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY non configurée');
  }

  console.log(`[Forecast] Récupération des prévisions pour ${commune.name}...`);

  const url = `${API_CONFIG.OPENWEATHER.BASE_URL}${API_CONFIG.OPENWEATHER.FORECAST_ENDPOINT}?lat=${commune.lat}&lon=${commune.lon}&appid=${apiKey}&units=metric&lang=fr&cnt=40`;

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} depuis OpenWeatherMap`);
  }

  const data: OpenWeatherForecastResponse = await response.json();

  // Organiser les prévisions par jour
  const forecastsByDay: Record<string, HourlyForecast[]> = {};

  for (const item of data.list) {
    const dt = new Date(item.dt * 1000);
    const dayKey = dt.toISOString().split('T')[0];

    if (!forecastsByDay[dayKey]) {
      forecastsByDay[dayKey] = [];
    }

    const hourlyForecast: HourlyForecast = {
      time: dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      timestamp: item.dt,
      temperature: Math.round(item.main.temp * 10) / 10,
      feels_like: Math.round(item.main.feels_like * 10) / 10,
      temp_min: Math.round(item.main.temp_min * 10) / 10,
      temp_max: Math.round(item.main.temp_max * 10) / 10,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      weather_main: item.weather[0]?.main ?? 'N/A',
      weather_description: item.weather[0]?.description ?? 'Données non disponibles',
      weather_icon: item.weather[0]?.icon ?? '01d',
      clouds: item.clouds.all,
      wind_speed: Math.round(item.wind.speed * 3.6 * 10) / 10, // m/s -> km/h
      wind_deg: item.wind.deg ?? 0,
      pop: Math.round((item.pop ?? 0) * 100), // Probabilité de précipitation en %
      rain_3h: item.rain?.['3h'] ?? 0,
    };

    forecastsByDay[dayKey].push(hourlyForecast);
  }

  // Calculer les min/max par jour et créer le résumé
  const dailySummary: Record<string, DailySummary> = {};

  for (const [day, forecasts] of Object.entries(forecastsByDay)) {
    const temps = forecasts.map((f) => f.temperature);
    const midIndex = Math.floor(forecasts.length / 2);

    dailySummary[day] = {
      date: day,
      temp_min: Math.round(Math.min(...temps) * 10) / 10,
      temp_max: Math.round(Math.max(...temps) * 10) / 10,
      hourly: forecasts,
      // Prendre la météo la plus représentative (vers midi)
      main_weather: forecasts[midIndex]?.weather_main ?? 'N/A',
      main_weather_description: forecasts[midIndex]?.weather_description ?? '',
      main_weather_icon: forecasts[midIndex]?.weather_icon ?? '01d',
    };
  }

  const result: ForecastData = {
    code_zone: codeZone,
    lib_zone: commune.name,
    daily: dailySummary,
    city: data.city,
  };

  console.log(`[Forecast] ${Object.keys(dailySummary).length} jours de prévisions pour ${commune.name}`);

  return result;
}

// ============================================================================
// HANDLER GET
// ============================================================================

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code_zone: string }> }
) {
  try {
    const { code_zone } = await params;

    // Valider le code_zone
    if (!code_zone || !/^\d{5}$/.test(code_zone)) {
      return createErrorResponse('Code zone invalide (format attendu: 5 chiffres)', 400);
    }

    // Vérifier si la commune existe
    if (!COMMUNE_COORDINATES[code_zone]) {
      return NextResponse.json(
        {
          code_zone,
          lib_zone: 'Commune inconnue',
          daily: {},
          error: `Commune ${code_zone} non trouvée`,
        },
        { status: 404 }
      );
    }

    // Vérifier la clé API
    if (!process.env.OPENWEATHER_API_KEY) {
      return createErrorResponse('OPENWEATHER_API_KEY non configurée', 500);
    }

    // Utiliser le système de cache avec clé unique par commune
    const cacheKey = CACHE_KEYS.FORECAST(code_zone);

    const data = await CacheManager.getOrFetch<ForecastData>(
      cacheKey,
      () => fetchForecastData(code_zone),
      { ttl: CACHE_TTL.FORECAST, staleWhileRevalidate: true }
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL.FORECAST}, stale-while-revalidate=${CACHE_TTL.FORECAST * 2}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[API forecast] Erreur:', message);

    return createErrorResponse(
      `Impossible de récupérer les prévisions: ${message}`,
      500
    );
  }
}
