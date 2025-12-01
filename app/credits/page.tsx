import Link from 'next/link';

export default function Credits() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Crédits & Sources</h1>
          <p className="text-slate-600 dark:text-gray-400">Transparence sur les données et ressources utilisées</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Sources de données */}
          <div className="bg-slate-50 dark:bg-gray-800 p-8 rounded-3xl border border-slate-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              📊 Sources des Données
            </h2>
            <ul className="space-y-6">
              <li>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Météo France</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Les données météorologiques et les niveaux de vigilance sont issus des bulletins publics de Météo France.
                </p>
              </li>
              <li>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Gwad'Air</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Les indices de qualité de l'air (ATMO) sont fournis par Gwad'Air, l'association agréée de surveillance de la qualité de l'air en Guadeloupe.
                </p>
              </li>
              <li>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">OpenWeather</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Certaines données météorologiques complémentaires peuvent provenir de l'API OpenWeather.
                </p>
              </li>
            </ul>
          </div>

          {/* Ressources Graphiques */}
          <div className="bg-slate-50 dark:bg-gray-800 p-8 rounded-3xl border border-slate-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              🎨 Ressources Graphiques
            </h2>
            <ul className="space-y-6">
              <li>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Photographies</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Les images d'illustration proviennent de banques d'images libres de droits :
                </p>
                <ul className="list-disc list-inside mt-2 text-sm text-slate-600 dark:text-gray-400 ml-2">
                  <li>Pexels</li>
                  <li>Unsplash</li>
                </ul>
              </li>
              <li>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Icônes</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Les icônes utilisées sur ce site proviennent de la librairie <a href="https://lucide.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lucide React</a>.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 text-center">
          <p className="text-slate-700 dark:text-blue-200 text-sm">
            Ce site est un projet indépendant et n'est pas affilié directement aux organismes cités ci-dessus.
            Les données sont utilisées dans le respect des licences Open Data disponibles.
          </p>
        </div>
      </div>
    </main>
  );
}
