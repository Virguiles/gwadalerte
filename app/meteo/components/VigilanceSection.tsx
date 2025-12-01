import React from 'react';
import { AlertTriangle, Wind, CloudRain, CloudLightning, Waves, Snowflake, ThermometerSun, Mountain } from 'lucide-react';
import { VigilanceLevelInfo } from '../types';
import { getVigilanceLevelInfo } from '../utils';

interface VigilanceSectionProps {
  vigilanceInfo: VigilanceLevelInfo;
  risks?: Array<{ type: string; level: number }>;
}

export const VigilanceSection: React.FC<VigilanceSectionProps> = ({ vigilanceInfo, risks }) => {

  const getRiskIcon = (type: string) => {
    switch (type) {
      case 'Vent': return <Wind className="w-5 h-5" />;
      case 'Pluie-inondation': return <CloudRain className="w-5 h-5" />;
      case 'Orages': return <CloudLightning className="w-5 h-5" />;
      case 'Crues': return <Waves className="w-5 h-5" />;
      case 'Vagues-submersion': return <Waves className="w-5 h-5" />;
      case 'Mer-houle': return <Waves className="w-5 h-5" />;
      case 'Neige-verglas': return <Snowflake className="w-5 h-5" />;
      case 'Canicule': return <ThermometerSun className="w-5 h-5" />;
      case 'Grand froid': return <Snowflake className="w-5 h-5" />;
      case 'Avalanches': return <Mountain className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  // Filtrer les risques avec niveau >= 2 (vigilance à observer)
  const risksToShow = risks?.filter(risk => risk.level >= 2) || [];

  return (
    <section className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Vigilance</h2>
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:border-blue-200 dark:hover:border-blue-700 transition-all">
        {/* Icône en arrière-plan */}
        <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="relative space-y-4">
          {/* Niveau de vigilance actuel */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-3 py-1.5 rounded-full text-sm font-bold border transition-colors"
                style={{
                  backgroundColor: vigilanceInfo.highlight,
                  color: vigilanceInfo.color,
                  borderColor: vigilanceInfo.color
                }}
              >
                {vigilanceInfo.label}
              </span>
            </div>
            {vigilanceInfo.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {vigilanceInfo.description}
              </p>
            )}
          </div>

          {/* Liste des risques */}
          {risksToShow.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Types de risques
              </p>
              <div className="flex flex-wrap gap-2">
                {risksToShow.map((risk, index) => {
                  const riskLevelInfo = getVigilanceLevelInfo(risk.level);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                    >
                      <div className="text-gray-600 dark:text-gray-400 flex-shrink-0">
                        {getRiskIcon(risk.type)}
                      </div>
                      <div
                        className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: riskLevelInfo.color }}
                      >
                        {risk.level}
                      </div>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        {risk.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aucune vigilance particulière.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
