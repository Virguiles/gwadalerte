import React, { RefObject } from 'react';
import { HoverInfo, CommuneData } from '../../components/GuadeloupeMap';
import { WeatherData } from '../types';
import { getWeatherEmoji } from '../utils';
import { ALL_COMMUNES } from '../constants';

interface MeteoTooltipProps {
  tooltip: HoverInfo;
  tooltipPosition: { left: number; top: number };
  tooltipRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export const MeteoTooltip: React.FC<MeteoTooltipProps> = ({
  tooltip,
  tooltipPosition,
  tooltipRef,
  onClose,
}) => {
  const weatherInfo = tooltip.data as unknown as WeatherData;
  // Vérifier si on a des données météo valides
  const hasWeatherData = weatherInfo &&
    typeof weatherInfo.temperature === 'number' &&
    weatherInfo.temperature !== null &&
    !isNaN(weatherInfo.temperature) &&
    weatherInfo.temperature > -50 &&
    weatherInfo.temperature < 60;

  // Déterminer le gradient de fond
  const getGradientColors = () => {
    if (hasWeatherData && weatherInfo.temperature !== null) {
      if (weatherInfo.temperature <= 20) return 'from-blue-500 to-indigo-600';
      if (weatherInfo.temperature <= 24) return 'from-cyan-500 to-blue-500';
      if (weatherInfo.temperature <= 28) return 'from-sky-500 to-indigo-500';
      if (weatherInfo.temperature <= 32) return 'from-orange-500 to-red-500';
      return 'from-red-500 to-orange-600';
    }
    return 'from-sky-500 to-indigo-500';
  };

  // S'assurer que le nom de la commune est correctement formaté
  const communeName = weatherInfo.lib_zone || ALL_COMMUNES[weatherInfo.code_zone] || weatherInfo.code_zone || 'Commune';

  return (
    <div className="group relative w-[280px] sm:w-[300px]">
      <div
        ref={tooltipRef}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${getGradientColors()} shadow-2xl transition-all duration-200 pointer-events-auto z-50 border-2 border-white/30`}
        style={{
          left: `${tooltipPosition.left}px`,
          top: `${tooltipPosition.top}px`,
          position: 'fixed',
          maxHeight: 'calc(100vh - 24px)',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.3) transparent',
          animation: 'tooltip-fade-in 0.2s ease-out',
        }}
      >
        {/* Pattern de fond doux */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        ></div>

        <div className="relative p-5">
          {/* En-tête épuré */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white truncate drop-shadow-md" title={communeName}>
                {communeName}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">Guadeloupe</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/20 text-white/90 hover:bg-white/30 hover:text-white transition-all backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Fermer"
              title="Fermer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {hasWeatherData ? (
            <>
              {/* Section température principale - Design épuré */}
              <div className="flex items-center justify-between mb-6 bg-white/15 rounded-xl p-4 backdrop-blur-md">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white drop-shadow-lg">{weatherInfo.temperature !== null ? Math.round(weatherInfo.temperature) : '—'}</span>
                  <span className="text-2xl text-white/90">°C</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/25 blur-lg"></div>
                  <span className="relative text-5xl drop-shadow-lg">
                    {weatherInfo.weather_main && weatherInfo.weather_icon
                      ? getWeatherEmoji(weatherInfo.weather_main, weatherInfo.weather_icon)
                      : '🌤️'}
                  </span>
                </div>
              </div>

              {/* Description météo */}
              {weatherInfo.weather_description && (
                <div className="mb-5 text-center">
                  <p className="text-sm font-medium text-white/95 capitalize px-3 py-1.5 rounded-full bg-white/10 inline-block backdrop-blur-sm">
                    {weatherInfo.weather_description}
                  </p>
                </div>
              )}

              {/* Grille 2x2 - Plus compacte et moderne */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Humidité */}
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                  <svg
                    className="h-5 w-5 text-white/90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
                  </svg>
                  <span className="text-xs font-medium text-white/80">Humidité</span>
                  <span className="text-base font-bold text-white">
                    {weatherInfo.humidity != null ? `${weatherInfo.humidity}%` : '—'}
                  </span>
                </div>

                {/* Vent */}
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                  <svg
                    className="h-5 w-5 text-white/90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12.8 19.6A2 2 0 1 0 14 16H2"/>
                    <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/>
                    <path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>
                  </svg>
                  <span className="text-xs font-medium text-white/80">Vent</span>
                  <span className="text-base font-bold text-white">
                    {weatherInfo.wind_speed != null ? `${Math.round(weatherInfo.wind_speed)} km/h` : '—'}
                  </span>
                </div>

                {/* Pression */}
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                  <svg
                    className="h-5 w-5 text-white/90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span className="text-xs font-medium text-white/80">Pression</span>
                  <span className="text-base font-bold text-white">
                    {weatherInfo.pressure != null ? `${weatherInfo.pressure} hPa` : '—'}
                  </span>
                </div>

                {/* Nuages ou UV */}
                {weatherInfo.uv_index !== null && weatherInfo.uv_index !== undefined ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                    <svg
                      className="h-5 w-5 text-white/90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
                    </svg>
                    <span className="text-xs font-medium text-white/80">UV Index</span>
                    <span className="text-base font-bold text-white">{weatherInfo.uv_index}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                    <svg
                      className="h-5 w-5 text-white/90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"/>
                    </svg>
                    <span className="text-xs font-medium text-white/80">Nuages</span>
                    <span className="text-base font-bold text-white">
                      {weatherInfo.clouds != null ? `${weatherInfo.clouds}%` : '—'}
                    </span>
                  </div>
                )}
              </div>

              {/* Informations supplémentaires - Plus discrètes */}
              {((weatherInfo.wind_gust != null && weatherInfo.wind_gust > 0) ||
                (weatherInfo.rain_1h != null && weatherInfo.rain_1h > 0) ||
                (weatherInfo.rain_3h != null && weatherInfo.rain_3h > 0)) && (
                <div className="space-y-2 mt-4 pt-4 border-t border-white/20">
                  {weatherInfo.wind_gust != null && weatherInfo.wind_gust > 0 && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                      <span className="text-xs font-medium text-white/90">Rafales</span>
                      <span className="text-xs font-bold text-white">{Math.round(weatherInfo.wind_gust)} km/h</span>
                    </div>
                  )}

                  {(weatherInfo.rain_1h != null && weatherInfo.rain_1h > 0) ||
                   (weatherInfo.rain_3h != null && weatherInfo.rain_3h > 0) ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                      <span className="text-xs font-medium text-white/90">Pluie</span>
                      <span className="text-xs font-bold text-white">
                        {weatherInfo.rain_1h != null && weatherInfo.rain_1h > 0
                          ? `${weatherInfo.rain_1h.toFixed(1)} mm/h`
                          : `${weatherInfo.rain_3h?.toFixed(1)} mm/3h`}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 opacity-60">🌤️</div>
              <div className="text-sm font-semibold text-white mb-1">Données non disponibles</div>
              <div className="text-xs text-white/80">
                Chargement en cours...
              </div>
            </div>
          )}

          {/* Footer minimaliste */}
          {hasWeatherData && (
            <div className="mt-4 pt-3 border-t border-white/20 text-center">
              <p className="text-xs text-white/70">
                {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
