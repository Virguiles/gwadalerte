export default function Credits() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Crédits & Sources</h1>
          <p className="text-slate-600 dark:text-gray-400">Transparence sur les données et ressources utilisées</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">1. Sources de Données</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Ce site agrège et affiche des données provenant des organismes suivants, qui en conservent la pleine propriété intellectuelle et la responsabilité de leur exactitude :
            </p>
            <ul className="list-disc ml-6 text-slate-600 dark:text-gray-300 leading-relaxed space-y-2">
              <li><strong>Météo-France :</strong> Données officielles de vigilance météorologique et bulletins publics (<a href="https://meteofrance.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">meteofrance.fr</a> via leur API).</li>
              <li><strong>Gwad&apos;Air :</strong> Indices de qualité de l&apos;air (ATMO) fournis par l&apos;association agréée de surveillance de la qualité de l&apos;air en Guadeloupe (<a href="http://www.gwadair.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">gwadair.fr</a> via leur API).</li>
              <li><strong>OpenWeatherMap :</strong> Données météorologiques et prévisions complémentaires (<a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">openweathermap.org</a> via leur API).</li>
              <li><strong>SMGEAG :</strong> Planning des tours d&apos;eau pour la Guadeloupe (<a href="https://www.smgeag.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">smgeag.fr</a>).</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">2. Ressources Graphiques</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Les ressources visuelles utilisées sur ce site proviennent des sources suivantes :
            </p>
            <ul className="list-disc ml-6 text-slate-600 dark:text-gray-300 leading-relaxed space-y-2">
              <li><strong>Photographies :</strong> Les images d&apos;illustration proviennent de banques d&apos;images libres de droits : <a href="https://www.pexels.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pexels</a> et <a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Unsplash</a>.</li>
              <li><strong>Icônes :</strong> Les icônes utilisées sur ce site proviennent de la librairie <a href="https://lucide.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lucide</a>.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">3. Avertissement</h2>
            <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
              Ce site est un projet indépendant et n&apos;est pas affilié directement aux organismes cités ci-dessus.
              Les données sont utilisées dans le respect des licences Open Data disponibles.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
