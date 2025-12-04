import { CommuneData } from '../components/GuadeloupeMap';

export type WeatherData = {
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
  wind_gust?: number | null;
  weather_main: string;
  weather_description: string;
  weather_icon: string; // Nom de l'icône Lucide React (ex: 'Sun', 'CloudRain')
  clouds: number | null;
  visibility?: number | null;
  dew_point?: number | null;
  sunrise?: string | null;
  sunset?: string | null;
  timezone?: number | null;
  rain_1h?: number | null;
  rain_3h?: number | null;
  uv_index?: number | null;
  // Nouveaux champs Open-Meteo
  weather_code?: number; // Code WMO
  is_day?: boolean;
};

// Types pour les prévisions Open-Meteo
export type HourlyForecast = {
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
};

export type DailyForecast = {
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
};

export type ForecastData = {
  code_zone: string;
  lib_zone: string;
  latitude: number;
  longitude: number;
  timezone: string;
  daily: DailyForecast[];
  last_updated: number;
};

export type WeatherDataMap = {
  [code_zone: string]: WeatherData;
};

export type VigilanceData = {
  department: string;
  department_name: string;
  level: number;
  color: string;
  label: string;
  risks: Array<{ type: string; level: number }>;
  last_update: number;
  phenomenes_phrases?: string[];
};

export type VigilanceLevelInfo = {
  level: number;
  label: string;
  color: string;
  description: string;
  advice: string;
  icon: string;
  highlight: string;
  characteristics?: string[];
};

export type { CommuneData };
