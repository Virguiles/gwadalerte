import React from 'react';
import { WATER_STATUS_DETAILS, WaterCutStatus } from '../utils';

interface WaterMapLegendProps {
  /** Période affichée, pour adapter le libellé « prévue » */
  periodLabel?: string;
  /** Statuts à documenter (par défaut : les trois) */
  statuses?: WaterCutStatus[];
  className?: string;
}

const DEFAULT_STATUSES: WaterCutStatus[] = ['ongoing', 'scheduled', 'none'];

/**
 * Clé de lecture des couleurs de la carte des tours d'eau.
 * Chaque couleur est doublée d'un libellé : l'information ne repose jamais
 * sur la seule perception de la teinte.
 */
export const WaterMapLegend: React.FC<WaterMapLegendProps> = ({
  periodLabel,
  statuses = DEFAULT_STATUSES,
  className = '',
}) => {
  return (
    <div className={className}>
      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        Tours d&apos;eau
      </h4>
      {periodLabel && (
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          {periodLabel}
        </p>
      )}

      <ul className="space-y-1.5">
        {statuses.map((status) => {
          const { color, label } = WATER_STATUS_DETAILS[status];
          return (
            <li key={status} className="flex items-center gap-2 text-[11px] leading-tight">
              <span
                className="w-3 h-3 rounded-sm shrink-0 border border-black/10 dark:border-white/20"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className="text-gray-600 dark:text-gray-300">{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
