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
    <div className="w-full h-full flex justify-center items-center relative">
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
      {loading && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
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
