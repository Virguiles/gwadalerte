import React from 'react';
import { hexToRgba } from '../../qualite-air/components/colorUtils';

interface AtmoBadgeProps {
  /** Libellé de qualité (« Bon », « Dégradé »…) */
  quality: string;
  /** Couleur officielle ATMO renvoyée par Gwad'Air */
  color?: string;
  /** Rappel de l'échelle sous la pastille */
  withScale?: boolean;
  /** Étiquette pour les lecteurs d'écran (rend la pastille annonçable) */
  ariaLabel?: string;
}

/**
 * Pastille d'indice ATMO, colorée par la palette officielle.
 * Le rendu était dupliqué (avec sa propre copie de `hexToRgba`) dans le
 * widget d'accueil et dans le détail commune.
 */
export const AtmoBadge: React.FC<AtmoBadgeProps> = ({
  quality,
  color,
  withScale = true,
  ariaLabel,
}) => {
  const safeColor = color || '#50F0E6'; // Repli : « Bon »

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className="px-3 py-1.5 rounded-full text-sm font-bold border transition-colors"
          style={{
            backgroundColor: hexToRgba(safeColor),
            color: safeColor,
            borderColor: safeColor,
          }}
          title="Indice ATMO"
          {...(ariaLabel ? { role: 'status', 'aria-label': ariaLabel } : {})}
        >
          {quality}
        </span>
      </div>
      {withScale && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
          Échelle ATMO : 1=Bon → 6=Critique
        </p>
      )}
    </div>
  );
};
