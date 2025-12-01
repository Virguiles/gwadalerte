import React, { RefObject } from 'react';
import { HoverInfo } from '../../components/GuadeloupeMap';
import { WeatherData } from '../types';
import { getWeatherEmoji, getSeaState } from '../utils';
import { ALL_COMMUNES } from '../constants';
import { Droplets, Wind, Gauge, Sun, Cloud, X, Waves } from 'lucide-react';
import { TooltipContainer } from '../../components/shared/TooltipContainer';

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

  // Déterminer si c'est la vue globale (Guadeloupe) ou une commune
  const isGlobalView = communeName === 'Guadeloupe' || communeName === 'guadeloupe';

  // Calculer l'état de la mer pour la vue globale
  const seaState = isGlobalView && weatherInfo.wind_speed !== null
    ? getSeaState(weatherInfo.wind_speed)
    : null;

  return (
    <TooltipContainer
      ref={tooltipRef}
      position={tooltipPosition}
      onClose={onClose}
      transparent={true}
      className={`bg-gradient-to-br ${getGradientColors()} border-2 border-white/30`}
      width="300px"
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
          {/* En-tête épuré - Hauteur fixe pour éviter les décalages */}
          <div className="relative mb-5 pr-10 min-h-[3.5rem]">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-white truncate drop-shadow-md leading-tight" title={communeName}>
                {communeName}
              </h3>
              <p className="text-xs text-white/80 mt-0.5 leading-tight">Guadeloupe</p>
            </div>
            {/* Espace réservé pour le bouton - toujours présent pour éviter les décalages */}
            <div className="absolute top-0 right-0 w-8 h-8"></div>
            <button
              type="button"
              onClick={onClose}
              className="absolute top-0 right-0 p-1.5 rounded-lg bg-white/20 text-white/90 hover:bg-white/30 hover:text-white transition-all backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shrink-0"
              aria-label="Fermer"
              title="Fermer"
            >
              <X className="h-4 w-4" />
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
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 rounded-full bg-white/25 blur-lg"></div>
                  <span className="relative text-5xl drop-shadow-lg inline-block leading-none" style={{ fontSize: '3rem', lineHeight: '1' }}>
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
                {/* Humidité ou Mer */}
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                  {isGlobalView ? (
                    <>
                      <Waves className="h-5 w-5 text-white/90 shrink-0" />
                      <span className="text-xs font-medium text-white/80 min-h-[1.25rem] flex items-center justify-center">Mer</span>
                      <span className="text-base font-bold text-white">
                        {seaState || '—'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Droplets className="h-5 w-5 text-white/90 shrink-0" />
                      <span className="text-xs font-medium text-white/80 min-h-[1.25rem] flex items-center justify-center">Humidité</span>
                      <span className="text-base font-bold text-white">
                        {weatherInfo.humidity != null ? `${weatherInfo.humidity}%` : '—'}
                      </span>
                    </>
                  )}
                </div>

                {/* Vent */}
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                  <Wind className="h-5 w-5 text-white/90 shrink-0" />
                  <span className="text-xs font-medium text-white/80">Vent</span>
                  <span className="text-base font-bold text-white">
                    {weatherInfo.wind_speed != null ? `${Math.round(weatherInfo.wind_speed)} km/h` : '—'}
                  </span>
                </div>

                {/* Pression */}
                <div className="flex flex-col items-center gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                  <Gauge className="h-5 w-5 text-white/90 shrink-0" />
                  <span className="text-xs font-medium text-white/80">Pression</span>
                  <span className="text-base font-bold text-white">
                    {weatherInfo.pressure != null ? `${weatherInfo.pressure} hPa` : '—'}
                  </span>
                </div>

                {/* Nuages ou UV */}
                {weatherInfo.uv_index !== null && weatherInfo.uv_index !== undefined ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                    <Sun className="h-5 w-5 text-white/90 shrink-0" />
                    <span className="text-xs font-medium text-white/80">UV Index</span>
                    <span className="text-base font-bold text-white">{weatherInfo.uv_index}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-white/15 p-3 backdrop-blur-md">
                    <Cloud className="h-5 w-5 text-white/90 shrink-0" />
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
              <div className="text-4xl mb-3 opacity-60 inline-block leading-none" style={{ fontSize: '2.5rem', lineHeight: '1' }}>🌤️</div>
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
    </TooltipContainer>
  );
};
