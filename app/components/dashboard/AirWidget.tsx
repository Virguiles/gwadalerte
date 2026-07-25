import React, { useMemo } from 'react';
import { Database, Wind } from 'lucide-react';
import type { AirData } from '../GuadeloupeMap';
import { isAirQualityOfConcern } from '../../qualite-air/airQuality';
import { DataFreshnessIndicator } from '../shared/DataFreshnessIndicator';
import { AtmoBadge } from './AtmoBadge';
import { WidgetCard, WidgetTitle } from './WidgetCard';

interface AirWidgetProps {
  airData: AirData;
  loading: boolean;
  lastUpdate: Date | null;
  onSelect: () => void;
}

const MAX_LISTED_ZONES = 5;

/** Qualité de l'air dominante sur l'archipel et zones à surveiller. */
export const AirWidget: React.FC<AirWidgetProps> = ({
  airData,
  loading,
  lastUpdate,
  onSelect,
}) => {
  const summary = useMemo(() => {
    const entries = Object.values(airData);

    // État global = qualité majoritaire sur l'archipel
    const counts = new Map<string, number>();
    let globalQuality = 'Bon';
    let maxCount = 0;

    for (const entry of entries) {
      const quality = entry.lib_qual;
      if (!quality || quality.toLowerCase() === 'indisponible') continue;

      const next = (counts.get(quality) ?? 0) + 1;
      counts.set(quality, next);
      if (next > maxCount) {
        maxCount = next;
        globalQuality = quality;
      }
    }

    const globalColor = entries.find((entry) => entry.lib_qual === globalQuality)?.coul_qual;

    const zonesToWatch = entries
      .filter((entry) => isAirQualityOfConcern(entry.lib_qual))
      .map((entry) => entry.lib_zone)
      .sort((a, b) => a.localeCompare(b));

    return { globalQuality, globalColor, zonesToWatch };
  }, [airData]);

  return (
    <WidgetCard
      icon={Wind}
      accent="emerald"
      size="compact"
      onActivate={onSelect}
      ariaLabel="Voir les détails de la qualité de l'air et les polluants"
      actionLabel="Voir les polluants"
      title={
        <WidgetTitle icon={Wind} iconClassName="text-emerald-500 dark:text-emerald-400">
          Qualité de l&apos;Air
        </WidgetTitle>
      }
    >
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ) : Object.keys(airData).length === 0 ? (
        <div className="text-center py-2">
          <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Aucune donnée</p>
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <AtmoBadge
              quality={summary.globalQuality}
              color={summary.globalColor}
              ariaLabel={`Qualité de l'air: ${summary.globalQuality}`}
            />
            {lastUpdate && <DataFreshnessIndicator lastUpdated={lastUpdate} className="mt-1.5" />}
          </div>

          {summary.zonesToWatch.length > 0 ? (
            <div className="space-y-2 mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Zones à surveiller
              </p>
              <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                {summary.zonesToWatch.slice(0, MAX_LISTED_ZONES).map((zone) => (
                  <li key={zone} className="truncate">
                    • {zone}
                  </li>
                ))}
                {summary.zonesToWatch.length > MAX_LISTED_ZONES && (
                  <li className="truncate text-gray-500 dark:text-gray-400">
                    • +{summary.zonesToWatch.length - MAX_LISTED_ZONES} autres
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Aucune zone à surveiller sur l&apos;archipel.
            </p>
          )}
        </div>
      )}
    </WidgetCard>
  );
};
