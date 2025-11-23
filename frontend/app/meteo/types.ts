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
  weather_icon: string;
  clouds: number | null;
  visibility?: number | null;
  dew_point?: number | null;
  sunrise?: string | null;
  sunset?: string | null;
  timezone?: number | null;
  rain_1h?: number;
  rain_3h?: number;
  uv_index?: number | null;
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
};

export type { CommuneData };
