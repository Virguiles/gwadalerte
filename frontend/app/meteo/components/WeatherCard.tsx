import React from 'react';
import { Sunrise, Sunset, Wind, Droplets, Waves, CloudSun } from 'lucide-react';

interface WeatherCardProps {
  temperature: number | null;
  weatherDescription: string | null;
  sunrise?: string | null;
  sunset?: string | null;
  windSpeed: number | null;
  humidity?: number | null;
  seaState?: string; // Spécifique vue globale
  isGlobalView?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  temperature,
  weatherDescription,
  sunrise,
  sunset,
  windSpeed,
  humidity,
  seaState,
  isGlobalView = false,
}) => {

  // --- Helpers d'affichage ---

  const isDayTime = (sunriseStr?: string | null, sunsetStr?: string | null): boolean => {
    if (!sunriseStr || !sunsetStr) return true;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [sunriseHours, sunriseMinutes] = sunriseStr.split(':').map(Number);
    const sunriseTime = sunriseHours * 60 + sunriseMinutes;

    const [sunsetHours, sunsetMinutes] = sunsetStr.split(':').map(Number);
    const sunsetTime = sunsetHours * 60 + sunsetMinutes;

    return currentTime >= sunriseTime && currentTime < sunsetTime;
  };

  const getWeatherEmoji = (desc: string | null, isDay: boolean): string => {
    if (!desc) return isDay ? '🌤️' : '🌙';
    const d = desc.toLowerCase();

    if (d.includes('thunderstorm') || d.includes('orage')) return '⛈️';
    if (d.includes('heavy rain') || d.includes('pluie forte') || d.includes('pluie intense')) return '🌧️';
    if (d.includes('rain') || d.includes('pluie') || d.includes('drizzle') || d.includes('bruine')) return isDay ? '🌦️' : '🌧️';
    if (d.includes('snow') || d.includes('neige')) return '❄️';
    if (d.includes('fog') || d.includes('mist') || d.includes('brume') || d.includes('brouillard')) return '🌫️';
    if (d.includes('overcast') || d.includes('couvert')) return '☁️';
    if (d.includes('broken clouds') || d.includes('nuages fragmentés')) return isDay ? '⛅' : '☁️';
    if (d.includes('scattered clouds') || d.includes('nuages dispersés')) return isDay ? '⛅' : '☁️';
    if (d.includes('few clouds') || d.includes('quelques nuages')) return isDay ? '🌤️' : '☁️';
    if (d.includes('clear') || d.includes('dégagé') || d.includes('ciel dégagé')) return isDay ? '☀️' : '🌙';

    return isDay ? '🌤️' : '🌙';
  };

  // --- Rendu ---

  if (temperature === null) {
    return (
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <CloudSun className="w-10 h-10" />
        </div>
        <div className="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  const isDay = isDayTime(sunrise, sunset);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800 p-4 shadow-sm hover:border-blue-200 dark:hover:border-blue-700 transition-all">
      {/* Icône en arrière-plan */}
      <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
        <CloudSun className="w-10 h-10" />
      </div>

      <div className="relative space-y-4">
        {/* Température principale */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {Math.round(temperature)}°
              </span>
              <span className="text-2xl opacity-70">
                {getWeatherEmoji(weatherDescription, isDay)}
              </span>
            </div>
            {weatherDescription && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">
                {weatherDescription}
              </p>
            )}
          </div>
        </div>

        {/* Soleil */}
        {(sunrise || sunset) && (
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/60 dark:bg-gray-800/60 p-3 backdrop-blur-sm">
            {sunrise && (
              <div className="flex items-center gap-2">
                <Sunrise className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lever</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{sunrise}</p>
                </div>
              </div>
            )}
            {sunset && (
              <div className="flex items-center gap-2">
                <Sunset className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Coucher</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{sunset}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Détails météo */}
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/60 dark:bg-gray-800/60 p-3 backdrop-blur-sm">
          {/* Slot Gauche: Humidité ou Mer */}
          <div className="flex items-center gap-2">
            {isGlobalView ? (
              <>
                <Waves className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mer</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{seaState || '—'}</p>
                </div>
              </>
            ) : (
              <>
                <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Humidité</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {humidity !== null && humidity !== undefined ? `${humidity}%` : '—'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Slot Droite: Vent */}
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Vent</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {windSpeed !== null ? `${Math.round(windSpeed)} km/h` : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
