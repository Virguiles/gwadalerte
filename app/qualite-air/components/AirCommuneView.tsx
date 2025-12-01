import React from 'react';
import { CommuneData } from '../../components/GuadeloupeMap';
import { AirPollutantList } from './AirPollutantList';

interface AirCommuneViewProps {
  data: CommuneData;
  lastUpdate: Date | null;
  formatLastUpdate: (date: Date) => string;
  onClose?: () => void;
}

// Fonction locale pour les descriptions
function getQualityDescription(libQual: string): string {
  const descriptions: Record<string, string> = {
    'Bon': 'Qualité de l\'air idéale. Profitez-en pour aérer et bouger !',
    'Moyen': 'Qualité acceptable. Aucun risque pour la majorité de la population.',
    'Dégradé': 'Qualité moyenne. Les personnes sensibles peuvent ressentir une gêne.',
    'Mauvais': 'Air pollué. Risques accrus pour les personnes fragiles.',
    'Très Mauvais': 'Forte pollution. Effets possibles sur la santé de tous.',
    'Extrêmement Mauvais': 'Situation critique. Risques sanitaires importants pour toute la population.',
    // Compatibilité
    'Très bon': 'Qualité de l\'air excellente.',
    'Médiocre': 'Qualité de l\'air préoccupante.',
    'Très mauvais': 'Forte pollution.',
  };
  return descriptions[libQual] || 'Données indisponibles.';
}

export const AirCommuneView: React.FC<AirCommuneViewProps> = ({ data, lastUpdate, formatLastUpdate, onClose }) => {
  return (
    <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full">

        {/* En-tête avec couleur dynamique */}
        <div
          className="px-6 py-5 text-white font-bold text-lg flex flex-col justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${data.coul_qual} 0%, ${data.coul_qual}ee 100%)`,
          }}
        >
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider opacity-90 block mb-1">Commune de</span>
              <span className="text-2xl font-bold truncate leading-tight block">{data.lib_zone}</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded transition-colors ml-2 flex-shrink-0"
                aria-label="Fermer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Indice Principal */}
          <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-4 border border-slate-100 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Indice ATMO</span>
              <span
                className="px-3 py-1.5 rounded-full text-sm font-bold border transition-colors"
                style={{
                  backgroundColor: (() => {
                    const hex = data.coul_qual || '#50F0E6';
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, 0.15)`;
                  })(),
                  color: data.coul_qual || '#50F0E6',
                  borderColor: data.coul_qual || '#50F0E6'
                }}
              >
                {data.lib_qual}
              </span>
            </div>
            {getQualityDescription(data.lib_qual || '') && (
              <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                {getQualityDescription(data.lib_qual || '')}
              </p>
            )}
          </div>

          {/* Liste des polluants */}
          <AirPollutantList data={data} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-gray-700 border-t border-slate-100 dark:border-gray-600 flex justify-between items-center text-xs text-slate-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span>Données Gwad&apos;Air</span>
          </div>
          {lastUpdate && (
            <span className="font-medium">
              MAJ {formatLastUpdate(lastUpdate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
