import React, { useMemo } from 'react';
import { Sunrise, Sunset, Wind, Waves, AlertTriangle, Shield, Droplets, MapPin } from 'lucide-react';
import { WeatherDataMap, VigilanceLevelInfo } from '../types';

interface MeteoSidebarProps {
  weatherData: WeatherDataMap;
  currentVigilanceInfo: VigilanceLevelInfo;
  relativeLastUpdate: string | null;
  focusedCommuneName?: string | null;
  focusedCommuneData?: any | null; // Type plus précis si possible, mais flexible pour l'instant
}

export const MeteoSidebar: React.FC<MeteoSidebarProps> = ({
  weatherData,
  currentVigilanceInfo,
  relativeLastUpdate,
  focusedCommuneName,
  focusedCommuneData,
}) => {
  // Calculer les informations communes de l'archipel
  const archipelInfo = useMemo(() => {
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

    const getSeaState = (windSpeed: number | null): string => {
      if (windSpeed === null) return 'Données non disponibles';
      if (windSpeed < 10) return 'Calme';
      if (windSpeed < 20) return 'Peu agitée';
      if (windSpeed < 30) return 'Agitée';
      if (windSpeed < 40) return 'Très agitée';
      return 'Dangereuse';
    };

    return {
      avgTemperature,
      avgWindSpeed,
      generalWeather: mostCommonWeather,
      seaState: getSeaState(avgWindSpeed),
      sunrise,
      sunset,
    };
  }, [weatherData]);

  // Rendu pour une commune spécifique
  const renderCommuneView = () => {
    if (!focusedCommuneData) return null;

    const temp = focusedCommuneData.temperature;
    const wind = focusedCommuneData.wind_speed;
    const desc = focusedCommuneData.weather_description;
    const humidity = focusedCommuneData.humidity;
    const sunriseTime = focusedCommuneData.sunrise || archipelInfo.sunrise;
    const sunsetTime = focusedCommuneData.sunset || archipelInfo.sunset;

    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {focusedCommuneName}
            </h2>
            <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                Météo locale
            </span>
        </div>

        <div
          className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 border border-white/20"
          style={{
            background: temp <= 20
              ? 'linear-gradient(to bottom, #3b82f6, #4f46e5)'
              : temp <= 24
              ? 'linear-gradient(to bottom, #06b6d4, #3b82f6)'
              : temp <= 28
              ? 'linear-gradient(to bottom, #0ea5e9, #4f46e5)'
              : temp <= 32
              ? 'linear-gradient(to bottom, #f97316, #ef4444)'
              : 'linear-gradient(to bottom, #ef4444, #f97316)',
          }}
        >
           {/* Pattern de fond SVG */}
           <div
            className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%221%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2016.2A4.5%204.5%200%200017.5%208h-1.8A7%207%200%104%2014.9%22%2F%3E%3Cpath%20d%3D%22M12%2012v9%22%2F%3E%3Cpath%20d%3D%22M8%2017l4%204%22%2F%3E%3Cpath%20d%3D%22M16%2017l-4%204%22%2F%3E%3C%2Fsvg%3E')] bg-center opacity-5"
          ></div>

          <div className="relative p-5">
            {/* Température principale avec icône */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-start">
                <span className="text-5xl font-bold text-white">{Math.round(temp)}°</span>
                <span className="mt-1 text-xl text-white/80">C</span>
              </div>
              <div className="text-right">
                <p className="text-white font-medium capitalize text-lg leading-tight">{desc}</p>
              </div>
            </div>

            {/* Détails Grid */}
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-1">
                    <Droplets className="h-5 w-5 text-white/90" />
                    <span className="text-xs font-medium text-white/80">Humidité</span>
                    <span className="text-sm font-semibold text-white">{humidity}%</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Wind className="h-5 w-5 text-white/90" />
                    <span className="text-xs font-medium text-white/80">Vent</span>
                    <span className="text-sm font-semibold text-white">{wind} km/h</span>
                </div>
            </div>

            {(sunriseTime || sunsetTime) && (
                <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm mt-3">
                    {sunriseTime && (
                        <div className="flex flex-col items-center gap-1">
                            <Sunrise className="h-5 w-5 text-white/90" />
                            <span className="text-xs font-medium text-white/80">Lever</span>
                            <span className="text-sm font-semibold text-white">{sunriseTime}</span>
                        </div>
                    )}
                    {sunsetTime && (
                        <div className="flex flex-col items-center gap-1">
                            <Sunset className="h-5 w-5 text-white/90" />
                            <span className="text-xs font-medium text-white/80">Coucher</span>
                            <span className="text-sm font-semibold text-white">{sunsetTime}</span>
                        </div>
                    )}
                </div>
            )}

          </div>
        </div>
      </section>
    );
  };

  // Rendu par défaut (Guadeloupe entière)
  const renderGlobalView = () => (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Guadeloupe</h2>
      {archipelInfo.avgTemperature !== null ? (
        <div
          className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 border border-white/20"
          style={{
            background: archipelInfo.avgTemperature <= 20
              ? 'linear-gradient(to bottom, #3b82f6, #4f46e5)'
              : archipelInfo.avgTemperature <= 24
              ? 'linear-gradient(to bottom, #06b6d4, #3b82f6)'
              : archipelInfo.avgTemperature <= 28
              ? 'linear-gradient(to bottom, #0ea5e9, #4f46e5)'
              : archipelInfo.avgTemperature <= 32
              ? 'linear-gradient(to bottom, #f97316, #ef4444)'
              : 'linear-gradient(to bottom, #ef4444, #f97316)',
          }}
        >
          {/* Pattern de fond SVG */}
          <div
            className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%221%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2016.2A4.5%204.5%200%200017.5%208h-1.8A7%207%200%104%2014.9%22%2F%3E%3Cpath%20d%3D%22M12%2012v9%22%2F%3E%3Cpath%20d%3D%22M8%2017l4%204%22%2F%3E%3Cpath%20d%3D%22M16%2017l-4%204%22%2F%3E%3C%2Fsvg%3E')] bg-center opacity-5"
          ></div>

          <div className="relative p-5">
            {/* Température principale avec icône */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-start">
                <span className="text-4xl font-bold text-white">{archipelInfo.avgTemperature}°</span>
                <span className="mt-1 text-lg text-white/80">C</span>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-white/20 blur-xl transition-opacity duration-300"></div>
                <span className="relative text-4xl drop-shadow-md">🌤️</span>
              </div>
            </div>

            {/* Grille de 2 colonnes pour lever/coucher du soleil */}
            {(archipelInfo.sunrise || archipelInfo.sunset) ? (
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm mb-3">
                {archipelInfo.sunrise && (
                  <div className="flex flex-col items-center gap-1">
                    <Sunrise className="h-5 w-5 text-white/90" />
                    <span className="text-xs font-medium text-white/80">Lever</span>
                    <span className="text-sm font-semibold text-white">{archipelInfo.sunrise}</span>
                  </div>
                )}
                {archipelInfo.sunset && (
                  <div className="flex flex-col items-center gap-1">
                    <Sunset className="h-5 w-5 text-white/90" />
                    <span className="text-xs font-medium text-white/80">Coucher</span>
                    <span className="text-sm font-semibold text-white">{archipelInfo.sunset}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm text-center mb-3">
                <p className="text-xs text-white/80">Données soleil en cours de chargement...</p>
              </div>
            )}

            {/* Grille de 2 colonnes pour état de la mer et vent */}
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
              {/* État de la mer */}
              <div className="flex flex-col items-center gap-1">
                <Waves className="h-5 w-5 text-white/90" />
                <span className="text-xs font-medium text-white/80">Mer</span>
                <span className="text-sm font-semibold text-white text-center">{archipelInfo.seaState}</span>
              </div>
              {/* Vent */}
              <div className="flex flex-col items-center gap-1">
                <Wind className="h-5 w-5 text-white/90" />
                <span className="text-xs font-medium text-white/80">Vent</span>
                <span className="text-sm font-semibold text-white">
                  {archipelInfo.avgWindSpeed !== null ? `${Math.round(archipelInfo.avgWindSpeed)} km/h` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 border border-gray-200/50 bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-start">
                <span className="text-4xl font-bold text-gray-400">—</span>
              </div>
              <div className="relative">
                <span className="relative text-4xl opacity-50">🌤️</span>
              </div>
            </div>
            <div className="rounded-lg bg-white/60 p-3 backdrop-blur-sm text-center">
              <p className="text-xs text-gray-600 font-medium">Données en cours de chargement...</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <div className="w-full lg:w-80 flex flex-col gap-6 lg:sticky lg:top-6">
      <div className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 space-y-8">
        {/* Section Météo (Globale ou Locale) */}
        {focusedCommuneData ? renderCommuneView() : renderGlobalView()}

        {/* Section Vigilance */}
        <section className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Vigilance</h2>
          <div
            className="rounded-xl border p-5 transition-all duration-300"
            style={{
              borderColor: `${currentVigilanceInfo.color}60`,
              backgroundColor: currentVigilanceInfo.highlight,
              boxShadow: `0 2px 8px ${currentVigilanceInfo.color}15`,
            }}
          >
            {/* Niveau de vigilance actuel */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: currentVigilanceInfo.color }}
              >
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentVigilanceInfo.label}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{currentVigilanceInfo.description}</p>
              </div>
            </div>

            {/* Phrase d'action */}
            <p className="text-sm text-gray-800 dark:text-gray-300 leading-relaxed font-medium">
              {currentVigilanceInfo.advice}
            </p>

          </div>
        </section>

        {/* Section Sources */}
        <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sources</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🌤️</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">OpenWeather</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Données météo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800">
              <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Météo-France</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Vigilance météo</p>
              </div>
            </div>
            {relativeLastUpdate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Dernière mise à jour {relativeLastUpdate}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
