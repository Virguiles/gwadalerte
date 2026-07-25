import { useMemo } from 'react';
import { WeatherDataMap } from '../types';
import { getSeaState } from '../utils';
import { getWeatherDescription } from '@/lib/weather-codes';

interface ArchipelMeteoInfo {
  avgTemperature: number | null;
  avgWindSpeed: number | null;
  /** Description des conditions dominantes sur l'archipel */
  generalWeather: string | null;
  /** Code WMO dominant — source unique de l'icône ET de la description */
  generalWeatherCode: number | null;
  /** Jour ou nuit d'après les données Open-Meteo (et non l'heure du visiteur) */
  isDay: boolean;
  seaState: string;
  sunrise: string | null;
  sunset: string | null;
}

/** Renvoie la valeur la plus fréquente d'une liste */
function mostFrequent<T>(values: T[]): T | null {
  const counts = new Map<T, number>();
  let winner: T | null = null;
  let maxCount = 0;

  for (const value of values) {
    const next = (counts.get(value) ?? 0) + 1;
    counts.set(value, next);
    if (next > maxCount) {
      maxCount = next;
      winner = value;
    }
  }

  return winner;
}

export const useArchipelMeteo = (weatherData: WeatherDataMap): ArchipelMeteoInfo => {
  return useMemo(() => {
    const temperatures: number[] = [];
    const windSpeeds: number[] = [];
    const weatherCodes: number[] = [];
    const dayFlags: boolean[] = [];
    let sunrise: string | null = null;
    let sunset: string | null = null;

    Object.values(weatherData).forEach((weather) => {
      if (typeof weather.temperature === 'number') {
        temperatures.push(weather.temperature);
      }
      if (typeof weather.wind_speed === 'number') {
        windSpeeds.push(weather.wind_speed);
      }
      if (typeof weather.weather_code === 'number') {
        weatherCodes.push(weather.weather_code);
      }
      if (typeof weather.is_day === 'boolean') {
        dayFlags.push(weather.is_day);
      }
      if (!sunrise && weather.sunrise) {
        sunrise = weather.sunrise;
      }
      if (!sunset && weather.sunset) {
        sunset = weather.sunset;
      }
    });

    const avgTemperature = temperatures.length > 0
      ? Math.round((temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length) * 10) / 10
      : null;

    const avgWindSpeed = windSpeeds.length > 0
      ? Math.round((windSpeeds.reduce((sum, speed) => sum + speed, 0) / windSpeeds.length) * 10) / 10
      : null;

    // On agrège le code météo plutôt que le libellé : c'est lui qui détermine
    // l'icône. En agrégeant la description seule, l'icône se rabattait sur le
    // code des prévisions du jour et pouvait annoncer des averses pendant que
    // le texte décrivait un ciel dégagé.
    const generalWeatherCode = mostFrequent(weatherCodes);
    // Sans donnée, on suppose le jour plutôt que de lire l'heure du visiteur,
    // qui n'est pas forcément en Guadeloupe.
    const isDay = mostFrequent(dayFlags) ?? true;

    return {
      avgTemperature,
      avgWindSpeed,
      generalWeather:
        generalWeatherCode !== null ? getWeatherDescription(generalWeatherCode, isDay) : null,
      generalWeatherCode,
      isDay,
      seaState: getSeaState(avgWindSpeed),
      sunrise,
      sunset,
    };
  }, [weatherData]);
};
