import React from 'react';
import { CloudSun } from 'lucide-react';
import { VIGILANCE_LEVEL_DETAILS } from '@/app/(site)/meteo/constants';
import type { VigilanceData } from '@/app/(site)/meteo/types';
import { WidgetCard, WidgetTitle } from './WidgetCard';

interface VigilanceWidgetProps {
  vigilanceData: VigilanceData | null;
  loading: boolean;
  onSelect: () => void;
}

/** Niveau de vigilance en cours et phénomènes associés. */
export const VigilanceWidget: React.FC<VigilanceWidgetProps> = ({
  vigilanceData,
  loading,
  onSelect,
}) => {
  const levelDetails =
    vigilanceData?.level !== undefined ? VIGILANCE_LEVEL_DETAILS[vigilanceData.level] : undefined;
  const color = vigilanceData?.color || '#3b82f6';
  const activeRisks = vigilanceData?.risks?.filter((risk) => risk.level > 1) ?? [];
  const phenomena = vigilanceData?.phenomenes_phrases ?? [];

  return (
    <WidgetCard
      icon={CloudSun}
      accent="blue"
      onActivate={onSelect}
      ariaLabel="Voir les détails de la vigilance météo"
      actionLabel="Voir détails"
      title={
        <WidgetTitle icon={CloudSun} iconClassName="text-blue-500 dark:text-blue-400">
          Vigilance Météo
        </WidgetTitle>
      }
    >
      {loading ? (
        <div className="space-y-3">
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-3 py-1.5 rounded-full text-sm font-bold border transition-colors"
              style={{
                backgroundColor: levelDetails?.highlight || 'rgba(59, 130, 246, 0.1)',
                color,
                borderColor: color,
              }}
              role="status"
              aria-label={`Niveau de vigilance: ${vigilanceData?.label || 'Normal'}`}
            >
              {vigilanceData?.label || 'Normal'}
            </span>
            {levelDetails?.description && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {levelDetails.description}
              </span>
            )}
          </div>

          {/* Conduite à tenir : l'information la plus actionnable du widget */}
          {levelDetails?.advice && vigilanceData?.level !== undefined && vigilanceData.level > 1 && (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
              {levelDetails.advice}
            </p>
          )}

          {activeRisks.length > 0 && (
            <div className="space-y-2 mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Types de risques
              </p>
              <div className="flex flex-wrap gap-2">
                {activeRisks.map((risk, index) => {
                  const riskDetails = VIGILANCE_LEVEL_DETAILS[risk.level];
                  const riskColor = riskDetails?.color || '#3b82f6';
                  return (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors"
                      style={{
                        backgroundColor: riskDetails?.highlight || 'rgba(59, 130, 246, 0.1)',
                        color: riskColor,
                        borderColor: riskColor,
                      }}
                      title={`${risk.type} : ${riskDetails?.label || 'Normal'}`}
                    >
                      {risk.type}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {phenomena.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Phénomènes en cours
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
                {phenomena.slice(0, 2).map((phenomenon, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="leading-relaxed">{phenomenon}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Aucune vigilance particulière.
            </p>
          )}
        </div>
      )}
    </WidgetCard>
  );
};
