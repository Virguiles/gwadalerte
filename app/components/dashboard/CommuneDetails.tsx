import React from 'react';
import { CloudSun, Droplet, DropletOff, Wind, X } from 'lucide-react';
import type { AirData } from '../GuadeloupeMap';
import type { WaterCutData } from '../../tours-deau/types';
import type { WeatherDataMap } from '../../meteo/types';
import {
  WATER_STATUS_DETAILS,
  getCommuneWaterStatus,
  getCutsForFilter,
} from '../../tours-deau/utils';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { ErrorDisplay } from '../shared/ErrorDisplay';
import { HelpButton } from '../shared/HelpButton';
import { AtmoBadge } from './AtmoBadge';

interface CommuneDetailsProps {
  communeCode: string;
  communeName: string;

  weatherData: WeatherDataMap;
  meteoLoading: boolean;

  waterCommune?: WaterCutData;
  waterLoading: boolean;
  waterError: Error | null;
  onRetryWater: () => void;

  airData: AirData;
  airLoading: boolean;
  airError: Error | null;
  onRetryAir: () => void;

  onClose: () => void;
}

const SECTION_CLASSES = {
  meteo:
    'p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800',
  water:
    'p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border border-cyan-100 dark:border-cyan-800',
  air: 'p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-100 dark:border-green-800',
};

/** Bandeau d'état des tours d'eau pour la commune sélectionnée. */
const WaterStatusBanner: React.FC<{ commune: WaterCutData }> = ({ commune }) => {
  const status = getCommuneWaterStatus(commune, 'today');

  if (status === 'ongoing') {
    return (
      <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg mb-2 border border-red-200 dark:border-red-800">
        <strong>🚱 {WATER_STATUS_DETAILS.ongoing.label} en ce moment</strong>
      </div>
    );
  }

  if (status === 'scheduled') {
    return (
      <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 rounded-lg mb-2 border border-amber-200 dark:border-amber-800">
        <strong>⚠️ Coupure prévue aujourd&apos;hui</strong>
      </div>
    );
  }

  return (
    <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg mb-2 border border-green-200 dark:border-green-800">
      ✅ Pas de coupure prévue aujourd&apos;hui
    </div>
  );
};

/** Panneau affiché quand une commune est sélectionnée sur la carte. */
export const CommuneDetails: React.FC<CommuneDetailsProps> = ({
  communeCode,
  communeName,
  weatherData,
  meteoLoading,
  waterCommune,
  waterLoading,
  waterError,
  onRetryWater,
  airData,
  airLoading,
  airError,
  onRetryAir,
  onClose,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const weather = weatherData[communeCode];
  const air = airData[communeCode];
  const todayCuts = waterCommune ? getCutsForFilter(waterCommune, 'today') : [];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{communeName}</h2>
        <button
          onClick={onClose}
          className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
            prefersReducedMotion ? '' : 'transition-all duration-200 hover:scale-110'
          }`}
          aria-label={`Fermer les détails de ${communeName}`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Météo locale */}
        <div className={SECTION_CLASSES.meteo}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center text-lg font-semibold text-blue-900 dark:text-blue-300 gap-2">
              <CloudSun className="w-6 h-6" aria-hidden="true" /> Météo
              {!meteoLoading && weather && (
                <span
                  className="text-4xl font-bold ml-4"
                  aria-label={`Température: ${weather.temperature} degrés`}
                >
                  {weather.temperature}°
                </span>
              )}
            </h3>
            <HelpButton
              title="Données météo"
              content="Température actuelle, conditions météorologiques, humidité et vitesse du vent pour cette commune."
            />
          </div>
          {meteoLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-full bg-blue-200 dark:bg-blue-800 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-blue-200 dark:bg-blue-800 rounded animate-pulse"></div>
            </div>
          ) : weather ? (
            <div className="text-gray-700 dark:text-gray-300">
              <p className="capitalize mb-2">{weather.weather_description}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Droplet className="w-4 h-4" aria-hidden="true" /> Humidité: {weather.humidity}%
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="w-4 h-4" aria-hidden="true" /> Vent: {weather.wind_speed} km/h
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pas de données météo spécifiques pour cette commune.
            </p>
          )}
        </div>

        {/* Tours d'eau */}
        <div className={SECTION_CLASSES.water}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center text-lg font-semibold text-cyan-900 dark:text-cyan-300 gap-2">
              <DropletOff className="w-6 h-6" aria-hidden="true" />
              <span className="flex flex-col">
                <span>Tours d&apos;eau</span>
                <span className="text-xs font-normal text-cyan-700 dark:text-cyan-400 normal-case">
                  Coupures d&apos;eau planifiées
                </span>
              </span>
            </h3>
            <HelpButton
              title="Tours d'eau"
              content="Les tours d'eau sont des coupures d'eau planifiées pour permettre la maintenance du réseau de distribution."
            />
          </div>
          {waterLoading ? (
            <div className="space-y-3">
              <div className="h-12 w-full bg-cyan-200 dark:bg-cyan-800 rounded-lg animate-pulse"></div>
              <div className="h-4 w-full bg-cyan-200 dark:bg-cyan-800 rounded animate-pulse"></div>
            </div>
          ) : waterError ? (
            <ErrorDisplay variant="inline" message={waterError.message} onRetry={onRetryWater} />
          ) : waterCommune ? (
            <div>
              <WaterStatusBanner commune={waterCommune} />

              {todayCuts.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Secteurs concernés aujourd&apos;hui :
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                    {todayCuts.map((cut, index) => (
                      <li key={index}>
                        {cut.secteur} : {cut.horaires}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucune information de tour d&apos;eau connue.
            </p>
          )}
        </div>

        {/* Qualité de l'air */}
        <div className={SECTION_CLASSES.air}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="flex items-center text-lg font-semibold text-green-900 dark:text-green-300 gap-2">
              <Wind className="w-6 h-6" aria-hidden="true" /> Qualité de l&apos;Air
            </h3>
            <HelpButton
              title="Qualité de l'air"
              content="L'indice ATMO mesure la qualité de l'air sur une échelle de 1 (Bon) à 6 (Extrêmement mauvais). Il prend en compte plusieurs polluants."
            />
          </div>
          {airLoading ? (
            <div className="space-y-2">
              <div className="h-8 w-24 bg-green-200 dark:bg-green-800 rounded-full animate-pulse"></div>
              <div className="h-3 w-full bg-green-200 dark:bg-green-800 rounded animate-pulse"></div>
            </div>
          ) : airError ? (
            <ErrorDisplay variant="inline" message={airError.message} onRetry={onRetryAir} />
          ) : air ? (
            <AtmoBadge quality={air.lib_qual || 'Bon'} color={air.coul_qual} />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Données non disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
};
