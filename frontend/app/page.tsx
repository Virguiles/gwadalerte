import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
          Gwad&apos;Alerte
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12">
          Visualisation des données environnementales de la Guadeloupe
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Qualité de l'air */}
          <Link
            href="/qualite-air"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">🌬️</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
              Qualité de l&apos;Air
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Consultez la qualité de l&apos;air en temps réel dans toutes les communes de Guadeloupe
            </p>
          </Link>

          {/* Tours d'eau */}
          <Link
            href="/tours-deau"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">💧</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
              Tours d&apos;Eau
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Informations sur les tours d&apos;eau et la distribution d&apos;eau en Guadeloupe
            </p>
          </Link>

          {/* Météo */}
          <Link
            href="/meteo"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-5xl mb-4">🌤️</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
              Météo
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Prévisions météorologiques et alertes pour la Guadeloupe
            </p>
          </Link>
        </div>

        <div className="mt-16 text-gray-500 text-sm">
          <p>Données fournies par Gwad&apos;Air, Météo-France et les services publics de Guadeloupe</p>
        </div>
      </div>
    </main>
  );
}
