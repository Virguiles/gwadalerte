import React from 'react';
import { ArrowRight } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export type WidgetAccent = 'blue' | 'cyan' | 'emerald';

/**
 * Classes déclinées par teinte. Elles sont écrites en toutes lettres pour
 * rester détectables par le scanner de Tailwind.
 */
const ACCENT_CLASSES: Record<WidgetAccent, { border: string; ring: string; action: string }> = {
  blue: {
    border: 'hover:border-blue-300 dark:hover:border-blue-600',
    ring: 'focus-within:ring-blue-500',
    action: 'text-blue-600 dark:text-blue-400',
  },
  cyan: {
    border: 'hover:border-cyan-300 dark:hover:border-cyan-600',
    ring: 'focus-within:ring-cyan-500',
    action: 'text-cyan-600 dark:text-cyan-400',
  },
  emerald: {
    border: 'hover:border-emerald-300 dark:hover:border-emerald-600',
    ring: 'focus-within:ring-emerald-500',
    action: 'text-emerald-600 dark:text-emerald-400',
  },
};

interface WidgetCardProps {
  /** Titre court affiché en capitales */
  title: React.ReactNode;
  /** Icône affichée devant le titre et en filigrane */
  icon: React.ComponentType<{ className?: string }>;
  accent: WidgetAccent;
  /** Action déclenchée au clic, à Entrée et à Espace */
  onActivate: () => void;
  /** Description de l'action pour les lecteurs d'écran */
  ariaLabel: string;
  /** Libellé de l'action révélée au survol */
  actionLabel: string;
  /** Taille du pied d'action (les widgets de la grille sont plus compacts) */
  size?: 'default' | 'compact';
  children: React.ReactNode;
}

/**
 * Tuile cliquable du tableau de bord.
 *
 * Ce cadre — carte, filigrane, gestion clavier, pied « Voir détails » —
 * était recopié trois fois dans HomeDashboard, avec des divergences
 * d'accessibilité à chaque copie.
 */
export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  icon: Icon,
  accent,
  onActivate,
  ariaLabel,
  actionLabel,
  size = 'default',
  children,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const theme = ACCENT_CLASSES[accent];
  const isCompact = size === 'compact';

  return (
    <div
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onActivate();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-xl cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 ${theme.border} ${theme.ring} ${
        prefersReducedMotion ? '' : 'hover:scale-[1.02] transition-all duration-300'
      }`}
    >
      <div
        className={`absolute top-2 right-2 opacity-5 ${prefersReducedMotion ? '' : 'group-hover:opacity-10 transition-opacity'}`}
        aria-hidden="true"
      >
        <Icon className="w-10 h-10" />
      </div>

      {title}
      {children}

      {/* Indicateur de cliquabilité */}
      <div
        className={`${isCompact ? 'mt-3 pt-2 text-xs' : 'mt-4 pt-3 text-sm'} border-t border-gray-100 dark:border-gray-700 flex items-center justify-between font-medium opacity-0 group-hover:opacity-100 ${theme.action} ${
          prefersReducedMotion ? '' : 'transition-opacity duration-300'
        }`}
        aria-hidden="true"
      >
        <span>{actionLabel}</span>
        <ArrowRight className={isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </div>
    </div>
  );
};

/** En-tête normalisé des tuiles */
export const WidgetTitle: React.FC<{
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  iconClassName: string;
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}> = ({ icon: Icon, iconClassName, children, subtitle, className = 'mb-3' }) => (
  <h3
    className={`text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2 ${className}`}
  >
    <Icon className={`w-4 h-4 ${iconClassName}`} aria-hidden={true} />
    {subtitle ? (
      <span className="flex flex-col">
        <span>{children}</span>
        <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500 normal-case tracking-normal">
          {subtitle}
        </span>
      </span>
    ) : (
      children
    )}
  </h3>
);
