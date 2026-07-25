import React from 'react';
import { FileClock } from 'lucide-react';

/** Au-delà de ce délai, on signale visuellement que le planning date */
const STALE_AFTER_MS = 60 * 86_400_000;

/**
 * Heure de référence figée au chargement du module.
 *
 * Lire `Date.now()` pendant le rendu rendrait le composant impur ; sur un
 * seuil de 60 jours, la dérive au fil d'une session est sans conséquence.
 */
const LOADED_AT = Date.now();

interface SourceDateIndicatorProps {
  /** Date à laquelle la donnée a été relevée à la source */
  sourceDate: Date | null;
  /** Nom de la source (ex. « SMGEAG ») */
  source: string;
  /** Libellé raccourci, pour les colonnes étroites */
  compact?: boolean;
  className?: string;
}

/**
 * Date de RELEVÉ d'une donnée statique.
 *
 * À distinguer de <DataFreshnessIndicator />, qui mesure l'ancienneté du
 * dernier appel réseau : sur un planning figé, afficher « mis à jour il y a
 * 2 min » laisse croire à une donnée temps réel qu'elle n'est pas.
 */
export const SourceDateIndicator: React.FC<SourceDateIndicatorProps> = ({
  sourceDate,
  source,
  compact = false,
  className = '',
}) => {
  if (!sourceDate || Number.isNaN(sourceDate.getTime())) return null;

  const isStale = LOADED_AT - sourceDate.getTime() > STALE_AFTER_MS;

  const formatted = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(sourceDate);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isStale
          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
      } ${className}`}
      title={
        isStale
          ? `Ce planning ${source} n'a pas été actualisé depuis le ${formatted}. Vérifiez auprès de ${source} avant toute décision importante.`
          : `Planning ${source} relevé le ${formatted}`
      }
    >
      <FileClock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{compact ? `${source} · ${formatted}` : `Planning ${source} du ${formatted}`}</span>
    </div>
  );
};
