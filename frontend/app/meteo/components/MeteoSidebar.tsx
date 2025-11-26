import React, { useMemo } from 'react';
import { Sunrise, Sunset, Wind, Waves, AlertTriangle, Droplets, MapPin, CloudRain, CloudLightning, ThermometerSun, Snowflake, Mountain } from 'lucide-react';
import { WeatherDataMap, VigilanceLevelInfo, WeatherData } from '../types';
import { getVigilanceLevelInfo } from '../utils';

interface MeteoSidebarProps {
  weatherData: WeatherDataMap;
  currentVigilanceInfo: VigilanceLevelInfo;
  relativeLastUpdate: string | null;
  focusedCommuneName?: string | null;
  focusedCommuneData?: WeatherData | null;
  risks?: Array<{ type: string; level: number }>;
}

export const MeteoSidebar: React.FC<MeteoSidebarProps> = ({
  weatherData,
  currentVigilanceInfo,
  focusedCommuneName,
  focusedCommuneData,
  risks,
}) => {
  // Fonction pour déterminer si c'est jour ou nuit
  const isDayTime = (sunrise: string | null, sunset: string | null): boolean => {
    if (!sunrise || !sunset) return true; // Par défaut, considérer comme jour

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes depuis minuit

    const [sunriseHours, sunriseMinutes] = sunrise.split(':').map(Number);
    const sunriseTime = sunriseHours * 60 + sunriseMinutes;

    const [sunsetHours, sunsetMinutes] = sunset.split(':').map(Number);
    const sunsetTime = sunsetHours * 60 + sunsetMinutes;

    return currentTime >= sunriseTime && currentTime < sunsetTime;
  };

  // Fonction pour obtenir l'émoji météo selon la description et le moment de la journée
  const getWeatherEmoji = (weatherDescription: string | null, isDay: boolean): string => {
    if (!weatherDescription) return isDay ? '🌤️' : '🌙';

    const desc = weatherDescription.toLowerCase();

    // Conditions météorologiques
    if (desc.includes('thunderstorm') || desc.includes('orage')) {
      return '⛈️';
    }
    if (desc.includes('heavy rain') || desc.includes('pluie forte') || desc.includes('pluie intense')) {
      return '🌧️';
    }
    if (desc.includes('rain') || desc.includes('pluie') || desc.includes('drizzle') || desc.includes('bruine')) {
      return isDay ? '🌦️' : '🌧️';
    }
    if (desc.includes('snow') || desc.includes('neige')) {
      return '❄️';
    }
    if (desc.includes('fog') || desc.includes('mist') || desc.includes('brume') || desc.includes('brouillard')) {
      return '🌫️';
    }
    if (desc.includes('overcast') || desc.includes('couvert')) {
      return '☁️';
    }
    if (desc.includes('broken clouds') || desc.includes('nuages fragmentés')) {
      return isDay ? '⛅' : '☁️';
    }
    if (desc.includes('scattered clouds') || desc.includes('nuages dispersés')) {
      return isDay ? '⛅' : '☁️';
    }
    if (desc.includes('few clouds') || desc.includes('quelques nuages')) {
      return isDay ? '🌤️' : '☁️';
    }
    if (desc.includes('clear') || desc.includes('dégagé') || desc.includes('ciel dégagé')) {
      return isDay ? '☀️' : '🌙';
    }

    // Par défaut selon le moment de la journée
    return isDay ? '🌤️' : '🌙';
  };

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

    if (temp === null) {
      return (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {focusedCommuneName}
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 border border-gray-200/50 bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-start">
                  <span className="text-4xl font-bold text-gray-400">—</span>
                </div>
              </div>
              <div className="rounded-lg bg-white/60 p-3 backdrop-blur-sm text-center">
                <p className="text-xs text-gray-600 font-medium">Données en cours de chargement...</p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {focusedCommuneName}
          </h2>
        </div>

        <div
          className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 border border-white/20"
          style={{
            background: temp <= 20
              ? 'linear-gradient(to bottom, rgba(59, 130, 246, 0.5), rgba(79, 70, 229, 0.5))'
              : temp <= 24
                ? 'linear-gradient(to bottom, rgba(6, 182, 212, 0.5), rgba(59, 130, 246, 0.5))'
                : temp <= 28
                  ? 'linear-gradient(to bottom, rgba(14, 165, 233, 0.5), rgba(79, 70, 229, 0.5))'
                  : temp <= 32
                    ? 'linear-gradient(to bottom, rgba(249, 115, 22, 0.5), rgba(239, 68, 68, 0.5))'
                    : 'linear-gradient(to bottom, rgba(239, 68, 68, 0.5), rgba(249, 115, 22, 0.5))',
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
                <span className="text-4xl font-bold text-white">{Math.round(temp)}°</span>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-white/20 blur-xl transition-opacity duration-300"></div>
                <span className="relative text-4xl drop-shadow-md">
                  {getWeatherEmoji(desc, isDayTime(sunriseTime, sunsetTime))}
                </span>
              </div>
            </div>

            {/* Grille de 2 colonnes pour lever/coucher du soleil */}
            {(sunriseTime || sunsetTime) ? (
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm mb-3">
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
            ) : (
              <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm text-center mb-3">
                <p className="text-xs text-white/80">Données soleil en cours de chargement...</p>
              </div>
            )}

            {/* Grille de 2 colonnes pour humidité et vent */}
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
              {/* Humidité */}
              <div className="flex flex-col items-center gap-1">
                <Droplets className="h-5 w-5 text-white/90" />
                <span className="text-xs font-medium text-white/80">Humidité</span>
                <span className="text-sm font-semibold text-white text-center">
                  {humidity !== null ? `${humidity}%` : '—'}
                </span>
              </div>
              {/* Vent */}
              <div className="flex flex-col items-center gap-1">
                <Wind className="h-5 w-5 text-white/90" />
                <span className="text-xs font-medium text-white/80">Vent</span>
                <span className="text-sm font-semibold text-white">
                  {wind !== null ? `${Math.round(wind)} km/h` : '—'}
                </span>
              </div>
            </div>
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
              ? 'linear-gradient(to bottom, rgba(59, 130, 246, 0.5), rgba(79, 70, 229, 0.5))'
              : archipelInfo.avgTemperature <= 24
                ? 'linear-gradient(to bottom, rgba(6, 182, 212, 0.5), rgba(59, 130, 246, 0.5))'
                : archipelInfo.avgTemperature <= 28
                  ? 'linear-gradient(to bottom, rgba(14, 165, 233, 0.5), rgba(79, 70, 229, 0.5))'
                  : archipelInfo.avgTemperature <= 32
                    ? 'linear-gradient(to bottom, rgba(249, 115, 22, 0.5), rgba(239, 68, 68, 0.5))'
                    : 'linear-gradient(to bottom, rgba(239, 68, 68, 0.5), rgba(249, 115, 22, 0.5))',
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
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-white/20 blur-xl transition-opacity duration-300"></div>
                <span className="relative text-4xl drop-shadow-md">
                  {getWeatherEmoji(archipelInfo.generalWeather, isDayTime(archipelInfo.sunrise, archipelInfo.sunset))}
                </span>
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

            {/* Liste des risques (seulement niveau >= 2) */}
            {(() => {
              // Fonction pour obtenir l'icône selon le type de risque
              const getRiskIcon = (type: string) => {
                switch (type) {
                  case 'Vent':
                    return <Wind className="w-5 h-5" />;
                  case 'Pluie-inondation':
                    return <CloudRain className="w-5 h-5" />;
                  case 'Orages':
                    return <CloudLightning className="w-5 h-5" />;
                  case 'Crues':
                    return <Waves className="w-5 h-5" />;
                  case 'Vagues-submersion':
                    return <Waves className="w-5 h-5" />;
                  case 'Mer-houle':
                    return <Waves className="w-5 h-5" />;
                  case 'Neige-verglas':
                    return <Snowflake className="w-5 h-5" />;
                  case 'Canicule':
                    return <ThermometerSun className="w-5 h-5" />;
                  case 'Grand froid':
                    return <Snowflake className="w-5 h-5" />;
                  case 'Avalanches':
                    return <Mountain className="w-5 h-5" />;
                  default:
                    return <AlertTriangle className="w-5 h-5" />;
                }
              };

              // Filtrer les risques avec niveau >= 2 (vigilance à observer)
              const risksToShow = risks?.filter(risk => risk.level >= 2) || [];

              if (risksToShow.length > 0) {
                return (
                  <div className="space-y-2 mt-4">
                    {risksToShow.map((risk, index) => {
                      const riskLevelInfo = getVigilanceLevelInfo(risk.level);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-gray-900/50"
                        >
                          <div className="text-gray-700 dark:text-gray-300 flex-shrink-0">
                            {getRiskIcon(risk.type)}
                          </div>
                          <div
                            className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: riskLevelInfo.color }}
                          >
                            {risk.level}
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {risk.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                return (
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-4">
                    Aucune vigilance particulière
                  </p>
                );
              }
            })()}

          </div>
        </section>
      </div>
    </div>
  );
};
