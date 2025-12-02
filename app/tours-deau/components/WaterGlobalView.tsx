import React from 'react';
import { DateFilter } from '../types';
import { WaterLogoIcon } from './WaterIcons';

interface WaterGlobalViewProps {
  archipelInfo?: {
    affectedCommunes: number;
    affectedCommunesList?: string[];
  };
  dateFilter: DateFilter;
}

export const WaterGlobalView: React.FC<WaterGlobalViewProps> = ({
  archipelInfo,
  dateFilter,
}) => {
  return (
    <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <WaterLogoIcon />
          Tours d&apos;eau
        </h2>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-lg">Situation Générale</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {archipelInfo && archipelInfo.affectedCommunes > 0 ? (
              <>
                <span className="font-bold text-blue-600 text-xl">{archipelInfo.affectedCommunes}</span> commune{archipelInfo.affectedCommunes > 1 ? 's' : ''} concernée{archipelInfo.affectedCommunes > 1 ? 's' : ''} par des tours d&apos;eau {dateFilter === 'today' ? "aujourd'hui" : dateFilter === 'tomorrow' ? "demain" : "cette semaine"}.
              </>
            ) : (
              "Aucune perturbation majeure signalée sur le réseau d'eau potable pour la période sélectionnée."
            )}
          </p>

          {archipelInfo && archipelInfo.affectedCommunes > 0 && archipelInfo.affectedCommunesList && archipelInfo.affectedCommunesList.length > 0 && (
            <div className="mt-4">
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                {archipelInfo.affectedCommunesList.map((name, i) => (
                  <li key={i} className="truncate">• {name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
