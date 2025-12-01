/**
 * Configuration et types partagés pour les API Routes
 *
 * Ce module centralise :
 * - Les URLs des APIs externes
 * - Les coordonnées des communes de Guadeloupe
 * - Les types/interfaces partagés
 * - Les fonctions utilitaires communes
 */

// ============================================================================
// CONFIGURATION API EXTERNES
// ============================================================================

export const API_CONFIG = {
  // Gwad'Air - Qualité de l'air en Guadeloupe
  GWADAIR: {
    BASE_URL: 'https://services8.arcgis.com/7RrxpwWeFIQ8JGGp/arcgis/rest/services/ind_guadeloupe_1/FeatureServer/0/query',
  },

  // OpenWeatherMap - Données météo
  OPENWEATHER: {
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    WEATHER_ENDPOINT: '/weather',
    FORECAST_ENDPOINT: '/forecast',
  },

  // Météo-France - Vigilance
  METEOFRANCE: {
    TOKEN_URL: 'https://portail-api.meteofrance.fr/token',
    VIGILANCE_URL: 'https://public-api.meteofrance.fr/public/DPVigilance/v1/vigilanceom/flux/dernier',
    GUADELOUPE_FILE: 'CDPV85_TFFR_.txt',
    DOMAIN_ID: 'VIGI971',
  },
} as const;

// ============================================================================
// COORDONNÉES DES COMMUNES DE GUADELOUPE
// ============================================================================

export interface CommuneInfo {
  name: string;
  lat: number;
  lon: number;
}

export const COMMUNE_COORDINATES: Record<string, CommuneInfo> = {
  "97101": { name: "Les Abymes", lat: 16.269098, lon: -61.491712 },
  "97102": { name: "Anse-Bertrand", lat: 16.471009, lon: -61.506 },
  "97103": { name: "Baie-Mahault", lat: 16.250984, lon: -61.593918 },
  "97104": { name: "Baillif", lat: 16.04277, lon: -61.7313 },
  "97105": { name: "Basse-Terre", lat: 15.998443, lon: -61.72447 },
  "97106": { name: "Bouillante", lat: 16.101058, lon: -61.764318 },
  "97107": { name: "Capesterre-Belle-Eau", lat: 16.060373, lon: -61.574103 },
  "97108": { name: "Capesterre-de-Marie-Galante", lat: 15.893608, lon: -61.222379 },
  "97109": { name: "Gourbeyre", lat: 15.991118, lon: -61.684582 },
  "97110": { name: "La Désirade", lat: 16.30279, lon: -61.077034 },
  "97111": { name: "Deshaies", lat: 16.30812, lon: -61.793379 },
  "97112": { name: "Grand-Bourg", lat: 15.902875, lon: -61.307448 },
  "97113": { name: "Le Gosier", lat: 16.225134, lon: -61.467175 },
  "97114": { name: "Goyave", lat: 16.130428, lon: -61.585075 },
  "97115": { name: "Lamentin", lat: 16.246752, lon: -61.650672 },
  "97116": { name: "Morne-à-l'Eau", lat: 16.321248, lon: -61.457015 },
  "97117": { name: "Le Moule", lat: 16.32455, lon: -61.352319 },
  "97118": { name: "Petit-Bourg", lat: 16.193519, lon: -61.600424 },
  "97119": { name: "Petit-Canal", lat: 16.379163, lon: -61.442341 },
  "97120": { name: "Pointe-à-Pitre", lat: 16.241587, lon: -61.537708 },
  "97121": { name: "Pointe-Noire", lat: 16.210064, lon: -61.780597 },
  "97122": { name: "Port-Louis", lat: 16.418389, lon: -61.52852 },
  "97124": { name: "Saint-Claude", lat: 16.0167, lon: -61.709911 },
  "97125": { name: "Saint-François", lat: 16.260504, lon: -61.289773 },
  "97126": { name: "Saint-Louis", lat: 15.956251, lon: -61.315493 },
  "97128": { name: "Sainte-Anne", lat: 16.257101, lon: -61.352828 },
  "97129": { name: "Sainte-Rose", lat: 16.318948, lon: -61.695059 },
  "97130": { name: "Terre-de-Bas", lat: 15.848911, lon: -61.643872 },
  "97131": { name: "Terre-de-Haut", lat: 15.86704, lon: -61.58231 },
  "97132": { name: "Trois-Rivières", lat: 15.979825, lon: -61.641339 },
  "97133": { name: "Vieux-Fort", lat: 15.952554, lon: -61.702531 },
  "97134": { name: "Vieux-Habitants", lat: 16.045746, lon: -61.750473 },
  "97801": { name: "Saint-Martin", lat: 18.067043, lon: -63.084698 },
};

// ============================================================================
// TYPES POUR LA QUALITÉ DE L'AIR
// ============================================================================

export interface AirQualityData {
  code_zone: string;
  lib_zone?: string;
  code_qual?: number;
  lib_qual?: string;
  date_ech?: string;
  date_dif?: string;
  source?: string;
  coul_qual?: string;
  // Polluants
  code_no2?: number;
  code_so2?: number;
  code_o3?: number;
  code_pm10?: number;
  code_pm25?: number;
  // Permettre des champs supplémentaires de l'API ArcGIS
  [key: string]: unknown;
}

export type AirQualityDataMap = Record<string, AirQualityData>;

// ============================================================================
// TYPES POUR LA MÉTÉO
// ============================================================================

export interface WeatherData {
  lib_zone: string;
  code_zone: string;
  temperature: number | null;
  feels_like: number | null;
  temp_min: number | null;
  temp_max: number | null;
  humidity: number | null;
  pressure: number | null;
  wind_speed: number | null;
  wind_deg: number | null;
  wind_gust: number | null;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  clouds: number | null;
  visibility: number | null;
  dew_point: number | null;
  sunrise: string | null;
  sunset: string | null;
  timezone: number | null;
  rain_1h: number | null;
  rain_3h: number | null;
  uv_index: number | null;
}

export type WeatherDataMap = Record<string, WeatherData>;

// ============================================================================
// TYPES POUR LES PRÉVISIONS
// ============================================================================

export interface HourlyForecast {
  time: string;
  timestamp: number;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  clouds: number;
  wind_speed: number;
  wind_deg: number;
  pop: number;
  rain_3h: number;
}

export interface DailySummary {
  date: string;
  temp_min: number;
  temp_max: number;
  hourly: HourlyForecast[];
  main_weather: string;
  main_weather_description: string;
  main_weather_icon: string;
}

export interface ForecastData {
  code_zone: string;
  lib_zone: string;
  daily: Record<string, DailySummary>;
  city?: {
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
  };
  error?: string;
}

// ============================================================================
// TYPES POUR LA VIGILANCE
// ============================================================================

export interface VigilanceRisk {
  type: string;
  level: number;
}

export interface VigilanceData {
  department: string;
  department_name: string;
  level: number;
  color: string;
  label: string;
  risks: VigilanceRisk[];
  last_update: number;
  error?: string;
}

// Mapping des niveaux de vigilance vers couleurs et labels
export const VIGILANCE_LEVELS: Record<number, { color: string; label: string }> = {
  [-1]: { color: "#CCCCCC", label: "Non disponible" },
  0: { color: "#28d761", label: "Vert" },
  1: { color: "#28d761", label: "Vert" },
  2: { color: "#FFFF00", label: "Jaune" },
  3: { color: "#FF9900", label: "Orange" },
  4: { color: "#FF0000", label: "Rouge" },
};

// Mapping des phenomenon_id vers leurs noms (API Météo-France)
export const PHENOMENON_NAMES: Record<number, string> = {
  1: "Vent",
  2: "Pluie-inondation",
  3: "Orages",
  4: "Crues",
  5: "Neige-verglas",
  6: "Canicule",
  7: "Grand froid",
  8: "Avalanches",
  9: "Vagues-submersion",
  10: "Mer-houle",
};

// ============================================================================
// TYPES POUR LES TOURS D'EAU
// ============================================================================

export interface WaterCutDetail {
  secteur: string;
  horaires: string;
  zones_alimentation_favorables?: string;
}

export interface WaterCutData {
  commune: string;
  details: WaterCutDetail[];
}

export type WaterCutsDataMap = Record<string, WaterCutData>;

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Crée une réponse JSON standardisée pour les API Routes
 */
export function createApiResponse<T>(
  data: T,
  options: { status?: number; headers?: Record<string, string> } = {}
): Response {
  const { status = 200, headers = {} } = options;

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      ...headers,
    },
  });
}

/**
 * Crée une réponse d'erreur standardisée
 */
export function createErrorResponse(
  message: string,
  status: number = 500
): Response {
  console.error(`[API Error] ${message}`);

  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      timestamp: Date.now(),
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Formate une date pour l'affichage
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Calcule le point de rosée approximatif
 */
export function calculateDewPoint(temperature: number, humidity: number): number {
  return temperature - ((100 - humidity) / 5);
}

/**
 * Calcule un indice UV approximatif basé sur l'heure et la couverture nuageuse
 */
export function calculateApproximateUV(cloudCoverage: number): number | null {
  const currentHour = new Date().getHours();

  // Nuit = pas d'UV
  if (currentHour < 6 || currentHour > 18) {
    return 0;
  }

  // UV de base pour les latitudes tropicales (Guadeloupe)
  const baseUV = (10 <= currentHour && currentHour <= 14) ? 8 : 5;

  // Réduction basée sur la couverture nuageuse
  const cloudFactor = 1 - (cloudCoverage / 200);

  return Math.round(baseUV * Math.max(cloudFactor, 0.3) * 10) / 10;
}
