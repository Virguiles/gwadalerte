import { useMemo } from 'react';
import { WeatherDataMap } from '../types';
import { getSeaState } from '../utils';

interface ArchipelMeteoInfo {
  avgTemperature: number | null;
  avgWindSpeed: number | null;
  generalWeather: string | null;
  seaState: string;
  sunrise: string | null;
  sunset: string | null;
}

export const useArchipelMeteo = (weatherData: WeatherDataMap): ArchipelMeteoInfo => {
  return useMemo(() => {
    const temperatures: number[] = [];
    const windSpeeds: number[] = [];
    const weatherDescriptions: string[] = [];
    let sunrise: string | null = null;
    let sunset: string | null = null;

    Object.values(weatherData).forEach((weather) => {
      if (weather.temperature !== null && typeof weather.temperature === 'number') {
        temperatures.push(weather.temperature);
      }
      if (weather.wind_speed !== null && typeof weather.wind_speed === 'number') {
        windSpeeds.push(weather.wind_speed);
      }
      if (weather.weather_description) {
        weatherDescriptions.push(weather.weather_description);
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

    const weatherCount: Record<string, number> = {};
    weatherDescriptions.forEach(desc => {
      const normalized = desc.toLowerCase();
      weatherCount[normalized] = (weatherCount[normalized] || 0) + 1;
    });
    const mostCommonWeather = Object.entries(weatherCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      avgTemperature,
      avgWindSpeed,
      generalWeather: mostCommonWeather,
      seaState: getSeaState(avgWindSpeed),
      sunrise,
      sunset,
    };
  }, [weatherData]);
};
