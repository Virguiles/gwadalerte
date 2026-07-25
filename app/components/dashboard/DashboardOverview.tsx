import React from 'react';
import type { AirData } from '../GuadeloupeMap';
import type { WaterDataMap } from '../../tours-deau/types';
import type { VigilanceData } from '../../meteo/types';
import { ErrorDisplay } from '../shared/ErrorDisplay';
import { HelpButton } from '../shared/HelpButton';
import { VigilanceWidget } from './VigilanceWidget';
import { WaterWidget } from './WaterWidget';
import { AirWidget } from './AirWidget';

interface DashboardOverviewProps {
  vigilanceData: VigilanceData | null;
  meteoLoading: boolean;

  waterData: WaterDataMap;
  waterLoading: boolean;
  waterError: Error | null;
  waterSourceDate: Date | null;
  onRetryWater: () => void;

  airData: AirData;
  airLoading: boolean;
  airError: Error | null;
  airLastUpdate: Date | null;
  onRetryAir: () => void;

  onSelectMeteo: () => void;
  onSelectWater: () => void;
  onSelectAir: () => void;
}

/** Panneau affiché quand aucune commune n'est sélectionnée. */
export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  vigilanceData,
  meteoLoading,
  waterData,
  waterLoading,
  waterError,
  waterSourceDate,
  onRetryWater,
  airData,
  airLoading,
  airError,
  airLastUpdate,
  onRetryAir,
  onSelectMeteo,
  onSelectWater,
  onSelectAir,
}) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        <span className="w-2 h-6 bg-blue-500 rounded-full" aria-hidden="true"></span>
        Vue d&apos;ensemble
      </h2>
      <HelpButton
        title="À propos de ce dashboard"
        content="Cette vue vous donne un aperçu rapide de la situation en Guadeloupe : vigilance météo, coupures d'eau et qualité de l'air. Cliquez sur un widget pour explorer les détails."
      />
    </div>

    <div className="grid grid-cols-1 gap-4">
      <VigilanceWidget
        vigilanceData={vigilanceData}
        loading={meteoLoading}
        onSelect={onSelectMeteo}
      />

      <div className="grid grid-cols-2 gap-4">
        {waterError ? (
          <div className="col-span-2">
            <ErrorDisplay
              variant="inline"
              title="Erreur tours d'eau"
              message={waterError.message}
              onRetry={onRetryWater}
            />
          </div>
        ) : (
          <WaterWidget
            waterData={waterData}
            loading={waterLoading}
            sourceDate={waterSourceDate}
            onSelect={onSelectWater}
          />
        )}

        {airError ? (
          <div className="col-span-2">
            <ErrorDisplay
              variant="inline"
              title="Erreur qualité de l'air"
              message={airError.message}
              onRetry={onRetryAir}
            />
          </div>
        ) : (
          <AirWidget
            airData={airData}
            loading={airLoading}
            lastUpdate={airLastUpdate}
            onSelect={onSelectAir}
          />
        )}
      </div>
    </div>
  </div>
);
