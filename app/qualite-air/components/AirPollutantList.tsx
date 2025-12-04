import React from 'react';
import { Activity } from 'lucide-react';
import { CommuneData } from '../../components/GuadeloupeMap';
import { hexToRgba } from './colorUtils';

interface AirPollutantListProps {
  data: CommuneData;
}

// Fonction utilitaire locale pour éviter les imports circulaires ou complexes
function getQualityFromCode(code: number | undefined): { label: string; color: string } {
  const qualityMap: Record<number, { label: string; color: string }> = {
    1: { label: 'Bon', color: '#50F0E6' },
    2: { label: 'Moyen', color: '#50CCAA' },
    3: { label: 'Dégradé', color: '#F0E641' },
    4: { label: 'Mauvais', color: '#FF5050' },
    5: { label: 'Très Mauvais', color: '#960032' },
    6: { label: 'Extrêmement Mauvais', color: '#803399' },
    0: { label: 'Absent', color: '#DDDDDD' },
  };

  if (code === undefined || code === null) {
    return { label: 'N/A', color: '#b9b9b9' };
  }
  return qualityMap[code] || { label: 'Inconnu', color: '#b9b9b9' };
}

export const AirPollutantList: React.FC<AirPollutantListProps> = ({ data }) => {
  const pollutants = [
    { code: data.code_no2, label: 'NO₂', name: 'Dioxyde d\'azote' },
    { code: data.code_so2, label: 'SO₂', name: 'Dioxyde de soufre' },
    { code: data.code_o3, label: 'O₃', name: 'Ozone' },
    { code: data.code_pm10, label: 'PM10', name: 'Particules < 10µm' },
    { code: data.code_pm25, label: 'PM2.5', name: 'Particules < 2.5µm' },
  ].filter(p => p.code !== undefined);

  if (pollutants.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-bold text-slate-400 dark:text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Détails par polluant
      </p>
      <div className="space-y-2">
        {pollutants.map((polluant) => {
          const quality = getQualityFromCode(polluant.code as number | undefined);
          const isNotBon = polluant.code !== undefined && polluant.code !== 1;

          return (
            <div
              key={polluant.label}
              className={`flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl transition-colors shadow-sm ${
                !isNotBon ? 'border-slate-100 dark:border-gray-600 hover:border-slate-200 dark:hover:border-gray-500' : ''
              }`}
              style={isNotBon ? {
                borderColor: quality.color,
                borderWidth: '1px',
              } : undefined}
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 dark:text-white">{polluant.label}</span>
                <span className="text-[10px] text-slate-400 dark:text-gray-500">{polluant.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1.5 rounded-full text-sm font-bold border transition-colors"
                  style={{
                    backgroundColor: hexToRgba(quality.color),
                    color: quality.color || '#50F0E6',
                    borderColor: quality.color || '#50F0E6'
                  }}
                >
                  {quality.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
