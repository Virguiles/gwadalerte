import React, { Suspense, lazy, useMemo } from 'react';
import { AirData, CommuneData, HoverInfo } from '../../components/GuadeloupeMap';
import { WeatherDataMap, VigilanceLevelInfo } from '../types';
import { ALL_COMMUNES } from '../constants';

const GuadeloupeMap = lazy(() => import('../../components/GuadeloupeMap').then(module => ({ default: module.default })));

interface WeatherMapSectionProps {
  weatherData: WeatherDataMap;
  currentVigilanceInfo: VigilanceLevelInfo;
  selectedCommune: string;
  onCommuneHover: (info: HoverInfo) => void;
  onCommuneLeave: () => void;
  onCommuneClick: (code: string) => void;
  loading: boolean;
}

export const WeatherMapSection: React.FC<WeatherMapSectionProps> = ({
  weatherData,
  currentVigilanceInfo,
  selectedCommune,
  onCommuneHover,
  onCommuneLeave,
  onCommuneClick,
  loading,
}) => {
  // Transformer les données météo pour la carte
  const mapDataForComponent = useMemo(() => {
    const vigilanceColor = currentVigilanceInfo.color;
    const vigilanceLabel = currentVigilanceInfo.label;
    const result: AirData = {};

    Object.keys(ALL_COMMUNES).forEach((code) => {
      const weather = weatherData[code];
      if (weather) {
        result[code] = {
          ...weather,
          coul_qual: vigilanceColor,
          lib_zone: weather.lib_zone,
          lib_qual: vigilanceLabel,
        } as unknown as CommuneData;
      } else {
        result[code] = {
          lib_zone: ALL_COMMUNES[code] || code,
          coul_qual: vigilanceColor,
          lib_qual: vigilanceLabel,
          code_zone: code,
        } as unknown as CommuneData;
      }
    });

    return result;
  }, [weatherData, currentVigilanceInfo]);

  return (
    <div className="flex-1 w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 flex flex-col relative h-[400px] sm:h-[500px] lg:h-[700px]">
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          🌤️ <span className="font-semibold">Les couleurs indiquent le niveau de vigilance météo par commune</span> - Survolez une commune pour voir les détails météorologiques
        </p>
      </div>
      <div className="w-full flex justify-center items-center p-6 bg-white dark:bg-gray-800 flex-1 min-h-0">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 dark:border-blue-800 mb-4"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 dark:border-blue-400 absolute top-0 left-0"></div>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-pulse">Chargement de la carte...</p>
            </div>
          }
        >
          <GuadeloupeMap
            data={mapDataForComponent}
            selectedCommune={selectedCommune}
            onCommuneHover={onCommuneHover}
            onCommuneLeave={onCommuneLeave}
            onCommuneClick={onCommuneClick}
          />
        </Suspense>
      </div>
      {loading && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 dark:border-blue-800 mb-4"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 dark:border-blue-400 absolute top-0 left-0"></div>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-pulse">Mise à jour des données...</p>
        </div>
      )}
    </div>
  );
};
