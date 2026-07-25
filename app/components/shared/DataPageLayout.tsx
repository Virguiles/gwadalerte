import React from 'react';

/**
 * Ossature commune aux trois pages thématiques (météo, air, tours d'eau).
 *
 * Ces pages partageaient la même structure recopiée à l'identique : en-tête à
 * dégradé, carte dans un panneau translucide, sidebar, sections explicatives.
 * Seuls la teinte et le contenu changeaient. Les centraliser ici garantit
 * qu'une correction de mise en page profite aux trois d'un coup.
 */

export type PageAccent = 'meteo' | 'water' | 'air';

const ACCENTS: Record<
  PageAccent,
  { page: string; title: string; pill: string; spinner: string }
> = {
  meteo: {
    page: 'from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950',
    title: 'from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400',
    pill: 'border-sky-100 dark:border-sky-900/50',
    spinner: 'border-blue-600',
  },
  water: {
    page: 'from-blue-50 via-cyan-50 to-sky-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950',
    title: 'from-blue-600 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400',
    pill: 'border-blue-100 dark:border-blue-900/50',
    spinner: 'border-blue-600',
  },
  air: {
    page: 'from-teal-50 via-emerald-50 to-green-50 dark:from-slate-950 dark:via-teal-950 dark:to-emerald-950',
    title: 'from-teal-600 via-emerald-600 to-green-600 dark:from-teal-400 dark:via-emerald-400 dark:to-green-400',
    pill: 'border-teal-100 dark:border-teal-900/50',
    spinner: 'border-teal-600',
  },
};

interface DataPageLayoutProps {
  /** Teinte de la thématique */
  accent: PageAccent;
  /** Titre principal (le sous-titre « Guadeloupe » est ajouté automatiquement) */
  title: React.ReactNode;
  /** Phrase d'introduction sous le titre */
  subtitle: React.ReactNode;
  /** Intitulé précédant les liens de sources */
  sourcesLabel?: string;
  /** Liens vers les sources officielles */
  sources: React.ReactNode;
  /** Affiche le voile de chargement sur le panneau principal */
  loading?: boolean;
  /** Libellé lu par les lecteurs d'écran pendant le chargement */
  loadingLabel?: string;
  /** Bloc d'erreur affiché en haut du panneau principal */
  error?: React.ReactNode;
  /** Contenu du panneau principal : carte + sidebar */
  children: React.ReactNode;
  /** Sections placées sous le panneau (guides, contenu explicatif) */
  below?: React.ReactNode;
  /** Étiquette d'accessibilité de la section carte + détails */
  sectionLabel?: string;
}

export const DataPageLayout: React.FC<DataPageLayoutProps> = ({
  accent,
  title,
  subtitle,
  sourcesLabel = 'Données officielles :',
  sources,
  loading = false,
  loadingLabel = 'Chargement des données',
  error,
  children,
  below,
  sectionLabel,
}) => {
  const theme = ACCENTS[accent];

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-start pt-16 md:pt-24 pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-br ${theme.page} transition-colors duration-300`}
    >
      <div className="w-full max-w-7xl space-y-6 md:space-y-8">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r ${theme.title} bg-clip-text text-transparent`}
            >
              {title}
              <span className="block text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-600 dark:text-slate-400 mt-1">
                Guadeloupe
              </span>
            </h1>
          </div>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <div
              className={`flex items-center gap-2 px-4 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full shadow-sm border ${theme.pill}`}
            >
              <span className="text-slate-500 dark:text-gray-400 font-medium">{sourcesLabel}</span>
              {sources}
            </div>
          </div>
        </header>

        {/* Panneau principal : carte + sidebar */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-20">
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-700 p-1">
            {loading && (
              <div
                role="status"
                aria-label={loadingLabel}
                className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-3xl"
              >
                <div
                  className={`animate-spin rounded-full h-12 w-12 border-b-2 ${theme.spinner}`}
                  aria-hidden="true"
                ></div>
              </div>
            )}

            {error}

            <div className="p-4">
              <section
                className="flex flex-col lg:flex-row gap-6 w-full items-start relative z-10"
                aria-label={sectionLabel}
              >
                {children}
              </section>
            </div>
          </div>
        </div>

        {below}
      </div>
    </main>
  );
};
