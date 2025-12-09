'use client';

import Link from 'next/link';
import HomeDashboard from './components/HomeDashboard';
import { Wind, Droplets, CloudSun, ArrowRight, Activity, Info } from 'lucide-react';
import { useAirData } from './hooks/useAirData';

export default function HomeClient() {
  const { data: airData } = useAirData();

  // Filtrer les communes en alerte
  const alertCommunes = Object.values(airData || {}).filter(data => {
    const label = data?.lib_qual?.toLowerCase() || '';
    return ['dégradé', 'mauvais', 'très mauvais', 'extrêmement mauvais', 'médiocre'].includes(label);
  });

  return (
    <main className="flex min-h-screen flex-col items-center bg-white dark:bg-gray-900 text-slate-900 dark:text-gray-100 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="w-full relative overflow-hidden bg-slate-50 dark:bg-gray-900">
        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,#3b82f615,transparent)] dark:bg-[radial-gradient(circle_800px_at_50%_-100px,#3b82f630,transparent)] pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white leading-tight">
            Gwad&apos;<span className="text-blue-600 dark:text-blue-400">Alerte</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed font-light mb-10">
            Le tableau de bord citoyen pour surveiller l&apos;eau, l&apos;air et la météo en Guadeloupe.
          </p>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-20 relative z-20">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-700 p-1">
          <HomeDashboard />
        </div>
      </div>

      {/* Cards Navigation Section */}
      <div className="w-full bg-slate-50/50 dark:bg-gray-900/50 border-t border-slate-100 dark:border-gray-800 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Explorer les données</h2>
              <p className="text-slate-500 dark:text-gray-400 mt-3 text-lg">Accédez aux analyses détaillées par thématique</p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400 dark:text-gray-500 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-slate-200 dark:border-gray-700 shadow-sm">
              <Info className="w-4 h-4" />
              <span>Données mises à jour en temps réel</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Qualité de l'air Card */}
            <Link
              href="/qualite-air"
              className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-200/60 dark:border-gray-700/60 hover:border-teal-500/30 dark:hover:border-teal-400/30 overflow-hidden flex flex-col h-full hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                <Wind className="w-48 h-48 text-teal-600 dark:text-teal-400 transform rotate-12 translate-x-10 -translate-y-10" />
              </div>

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-md ring-1 ring-teal-100 dark:ring-teal-800">
                  <Wind className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors flex items-center gap-3">
                  Qualité de l&apos;Air
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-teal-500 dark:text-teal-400" />
                </h3>

                <div className="text-slate-600 dark:text-gray-300 leading-relaxed mb-8 flex-1">
                  {alertCommunes.length > 0 ? (
                    <div className="mb-2">
                      <p className="font-bold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Alertes en cours
                      </p>
                      <ul className="text-sm space-y-2">
                        {alertCommunes.slice(0, 3).map((commune, idx) => (
                          <li key={idx} className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            <span className="font-medium">{commune.lib_zone}</span>
                          </li>
                        ))}
                        {alertCommunes.length > 3 && (
                          <li className="text-xs text-slate-400 italic ml-1">
                            + {alertCommunes.length - 3} autres zones
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p>
                      Carte interactive de l&apos;indice ATMO, détails des polluants et recommandations sanitaires.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-900/30 w-fit px-4 py-2 rounded-full border border-teal-100 dark:border-teal-800/50">
                  <Activity className="w-4 h-4" />
                  <span>Données Gwad&apos;Air</span>
                </div>
              </div>
            </Link>

            {/* Tours d'eau Card */}
            <Link
              href="/tours-deau"
              className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-200/60 dark:border-gray-700/60 hover:border-cyan-500/30 dark:hover:border-cyan-400/30 overflow-hidden flex flex-col h-full hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                <Droplets className="w-48 h-48 text-cyan-600 dark:text-cyan-400 transform -rotate-12 translate-x-10 -translate-y-10" />
              </div>

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-md ring-1 ring-cyan-100 dark:ring-cyan-800">
                  <Droplets className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-3">
                  Tours d&apos;Eau
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-cyan-500 dark:text-cyan-400" />
                </h3>

                <p className="text-slate-600 dark:text-gray-300 leading-relaxed mb-8 flex-1">
                  Calendrier des coupures d&apos;eau programmées, planning SMGEAG et zones impactées en temps réel.
                </p>

                <div className="flex items-center gap-2 text-sm text-cyan-700 dark:text-cyan-400 font-semibold bg-cyan-50 dark:bg-cyan-900/30 w-fit px-4 py-2 rounded-full border border-cyan-100 dark:border-cyan-800/50">
                  <Activity className="w-4 h-4" />
                  <span>Info SMGEAG</span>
                </div>
              </div>
            </Link>

            {/* Météo Card */}
            <Link
              href="/meteo"
              className="group relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-200/60 dark:border-gray-700/60 hover:border-blue-500/30 dark:hover:border-blue-400/30 overflow-hidden flex flex-col h-full hover:-translate-y-2"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                <CloudSun className="w-48 h-48 text-blue-600 dark:text-blue-400 transform rotate-6 translate-x-10 -translate-y-10" />
              </div>

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-md ring-1 ring-blue-100 dark:ring-blue-800">
                  <CloudSun className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors flex items-center gap-3">
                  Météo & Vigilance
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-500 dark:text-blue-400" />
                </h3>

                <p className="text-slate-600 dark:text-gray-300 leading-relaxed mb-8 flex-1">
                  Prévisions complètes, bulletins de vigilance et alertes météorologiques.
                </p>

                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 w-fit px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800/50">
                  <Activity className="w-4 h-4" />
                  <span>Source Météo-France</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
