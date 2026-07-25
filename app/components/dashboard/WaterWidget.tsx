import React, { useMemo } from 'react';
import { Database, DropletOff } from 'lucide-react';
import type { WaterDataMap } from '../../tours-deau/types';
import { formatCommuneName, getCommuneWaterStatus } from '../../tours-deau/utils';
import { SourceDateIndicator } from '../shared/SourceDateIndicator';
import { WidgetCard, WidgetTitle } from './WidgetCard';

interface WaterWidgetProps {
  waterData: WaterDataMap;
  loading: boolean;
  sourceDate: Date | null;
  onSelect: () => void;
}

/** Communes concernées par une coupure d'eau aujourd'hui. */
export const WaterWidget: React.FC<WaterWidgetProps> = ({
  waterData,
  loading,
  sourceDate,
  onSelect,
}) => {
  const affected = useMemo(() => {
    const now = new Date();
    return Object.values(waterData)
      .filter((commune) => getCommuneWaterStatus(commune, 'today', now) !== 'none')
      .map((commune) => formatCommuneName(commune.commune))
      .sort();
  }, [waterData]);

  const title = (
    <WidgetTitle
      icon={DropletOff}
      iconClassName="text-cyan-500 dark:text-cyan-400"
      subtitle="Coupures d'eau planifiées"
      className="mb-2"
    >
      Tours d&apos;eau
    </WidgetTitle>
  );

  return (
    <WidgetCard
      icon={DropletOff}
      accent="cyan"
      size="compact"
      onActivate={onSelect}
      ariaLabel="Voir les détails des tours d'eau"
      actionLabel="Voir le planning"
      title={title}
    >
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      ) : Object.keys(waterData).length === 0 ? (
        <div className="text-center py-2">
          <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Aucune donnée</p>
        </div>
      ) : (
        <div>
          <div
            className={`text-2xl font-bold mb-1 ${affected.length > 0 ? 'text-red-500' : 'text-emerald-500'}`}
            role="status"
            aria-label={`${affected.length} communes avec coupures d'eau`}
          >
            {affected.length > 0 ? affected.length : 'OK'}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mb-2">
            {affected.length > 0 ? 'communes touchées' : 'Réseau stable'}
          </p>

          <SourceDateIndicator sourceDate={sourceDate} source="SMGEAG" compact className="mb-2" />

          {affected.length > 0 && (
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              {affected.map((name) => (
                <li key={name} className="truncate">
                  • {name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </WidgetCard>
  );
};
