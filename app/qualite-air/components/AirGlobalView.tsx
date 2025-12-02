import React from 'react';
import { Wind } from 'lucide-react';

interface AirGlobalViewProps {
  lastUpdate: Date | null;
  formatDateTime: (date: Date) => string;
}

export const AirGlobalView: React.FC<AirGlobalViewProps> = ({ lastUpdate, formatDateTime }) => {
  const qualityLevels = [
    { label: 'Bon', color: '#50F0E6' },
    { label: 'Moyen', color: '#50CCAA' },
    { label: 'Dégradé', color: '#F0E641' },
    { label: 'Mauvais', color: '#FF5050' },
    { label: 'Très Mauvais', color: '#960032' },
    { label: 'Extrêmement Mauvais', color: '#803399' },
  ];

  return (
    <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Wind className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
          Qualité de l&apos;Air
        </h2>

        <div className="p-4 bg-teal-50 dark:bg-teal-900/30 rounded-xl border border-teal-100 dark:border-teal-800">
           <h3 className="font-semibold text-teal-900 dark:text-teal-300 mb-2 text-lg">Synthèse Régionale</h3>
           <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-sm">
              La qualité de l&apos;air est surveillée en permanence sur l&apos;ensemble de l&apos;archipel par les stations de mesure de Gwad&apos;Air.
           </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Échelle ATMO</h3>
          <div className="space-y-2">
              {qualityLevels.map((level) => (
              <div key={level.label} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                  <div
                  className="w-8 h-8 rounded-lg border-2 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: level.color, borderColor: level.color + '80' }}
                  ></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{level.label}</span>
              </div>
              ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-gray-700">
          {lastUpdate && (
            <div className="mb-3 text-center">
              <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400 font-bold mb-1">Dernière mise à jour</p>
              <p className="text-sm text-slate-700 dark:text-gray-300 font-medium">{formatDateTime(lastUpdate)}</p>
            </div>
          )}
          <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-xs font-medium text-slate-600 dark:text-gray-300">
                  Source: Gwad&apos;Air
              </span>
          </div>
        </div>
      </div>
    </div>
  );
};
