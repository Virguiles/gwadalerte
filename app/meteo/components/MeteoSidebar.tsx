import React from 'react';
import { WeatherDataMap, VigilanceLevelInfo, WeatherData } from '../types';
import { VigilanceSection } from './VigilanceSection';
import { useArchipelMeteo } from '../hooks/useArchipelMeteo';
import { MeteoGlobalView } from './MeteoGlobalView';
import { MeteoCommuneView } from './MeteoCommuneView';

type ForecastFilter = 'today' | 'tomorrow' | '3days';

interface MeteoSidebarProps {
  weatherData: WeatherDataMap;
  currentVigilanceInfo: VigilanceLevelInfo;
  relativeLastUpdate: string | null;
  focusedCommuneCode?: string | null;
  focusedCommuneName?: string | null;
  focusedCommuneData?: WeatherData | null;
  risks?: Array<{ type: string; level: number }>;
  forecastFilter: ForecastFilter;
  onClose?: () => void;
}

export const MeteoSidebar: React.FC<MeteoSidebarProps> = ({
  weatherData,
  currentVigilanceInfo,
  focusedCommuneCode,
  focusedCommuneName,
  focusedCommuneData,
  risks,
  forecastFilter,
  onClose,
}) => {
  const archipelInfo = useArchipelMeteo(weatherData);

  return (
    <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-6">
      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 space-y-6">

        {/* Section Météo (Globale ou Locale avec prévisions) */}
        {focusedCommuneData && focusedCommuneName && focusedCommuneCode ? (
            <MeteoCommuneView
                name={focusedCommuneName}
                data={focusedCommuneData}
                codeZone={focusedCommuneCode}
                archipelSunrise={archipelInfo.sunrise}
                archipelSunset={archipelInfo.sunset}
                forecastFilter={forecastFilter}
                onClose={onClose}
            />
        ) : (
            <MeteoGlobalView
                avgTemperature={archipelInfo.avgTemperature}
                generalWeather={archipelInfo.generalWeather}
                sunrise={archipelInfo.sunrise}
                sunset={archipelInfo.sunset}
                avgWindSpeed={archipelInfo.avgWindSpeed}
                forecastFilter={forecastFilter}
            />
        )}

        {/* Section Vigilance */}
        <VigilanceSection
          vigilanceInfo={currentVigilanceInfo}
          risks={risks}
        />
      </div>
    </div>
  );
};
