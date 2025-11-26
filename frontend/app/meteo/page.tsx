'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useMeteoData } from './hooks/useMeteoData';
// import { useTooltip } from './hooks/useTooltip';
import { getVigilanceLevelInfo, formatRelativeTime } from './utils';
import { CommuneSelector } from '../components/shared/CommuneSelector';
import { ALL_COMMUNES } from './constants';
import { WeatherMapSection } from './components/WeatherMapSection';
import { MeteoSidebar } from './components/MeteoSidebar';
// import { MeteoTooltip } from './components/MeteoTooltip';
import { HoverInfo } from '../components/GuadeloupeMap';
import { CyclonicVigilanceGuide } from './components/CyclonicVigilanceGuide';
import { CloudSun } from 'lucide-react';

// Composant pour les données structurées SEO (JSON-LD)
const MeteoJsonLd = () => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: 'Vigilance Météo Guadeloupe',
    serviceType: 'Weather Service',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Guadeloupe'
    },
    provider: {
      '@type': 'Organization',
      name: 'Météo France / GwadaSVG'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default function MeteoPage() {
  const { weatherData, vigilanceData, loading, mounted } = useMeteoData();
  const [selectedCommune, setSelectedCommune] = useState<string>('');
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const vigilanceDetailsRef = useRef<HTMLDivElement>(null);

  const currentVigilanceInfo = useMemo(
    () => getVigilanceLevelInfo(vigilanceData?.level),
    [vigilanceData?.level]
  );

  const relativeLastUpdate = useMemo(() => {
    if (!mounted || !vigilanceData?.last_update) {
      return null;
    }
    return formatRelativeTime(new Date(vigilanceData.last_update * 1000));
  }, [mounted, vigilanceData]);

  // Gestion du survol
  const handleCommuneHover = useCallback((info: HoverInfo) => {
    setHoveredInfo(info);
  }, []);

  const handleCommuneLeave = useCallback(() => {
    setHoveredInfo(null);
  }, []);

  // Gestion du clic (Sélection/Désélection)
  const handleCommuneClick = useCallback((code: string) => {
    setSelectedCommune(prev => prev === code ? '' : code);

    // Optionnel : scroll si mobile (comme dans HomeDashboard)
    if (window.innerWidth < 1024) {
      // setTimeout pour laisser le temps au rendu de se faire si besoin
      setTimeout(() => {
        // On peut scroller vers la sidebar ou vigilanceDetailsRef si on veut
        // Pour l'instant on laisse le comportement par défaut
      }, 100);
    }
  }, []);

  // Détermination des données à afficher dans la sidebar
  // Logique "HomeDashboard" :
  // - Si commune sélectionnée => Affiche commune
  // - Sinon => Affiche vue globale (Archipel)
  // - Le survol ne change pas le contenu de la sidebar, juste le tooltip flottant

  const sidebarCommuneCode = selectedCommune || null;

  const sidebarCommuneName = useMemo(() => {
    if (!sidebarCommuneCode) return null;
    return ALL_COMMUNES[sidebarCommuneCode] || weatherData[sidebarCommuneCode]?.lib_zone || sidebarCommuneCode;
  }, [sidebarCommuneCode, weatherData]);

  const sidebarCommuneData = useMemo(() => {
    if (!sidebarCommuneCode) return null;
    return weatherData[sidebarCommuneCode] || null;
  }, [sidebarCommuneCode, weatherData]);

  const weatherEntries = useMemo(() => Object.values(weatherData || {}), [weatherData]);
  const activeStations = useMemo(
    () => weatherEntries.filter((entry) => typeof entry.temperature === 'number').length,
    [weatherEntries]
  );
  const humidityAverage = useMemo(() => {
    const values = weatherEntries
      .map((entry) => entry.humidity)
      .filter((value): value is number => typeof value === 'number');
    if (values.length === 0) return null;
    return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
  }, [weatherEntries]);
  const phenomenaCount = vigilanceData?.phenomenes_phrases?.length || vigilanceData?.risks?.length || 0;


  const scrollToVigilanceDetails = useCallback(() => {
    if (vigilanceDetailsRef.current) {
      vigilanceDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-300">
      <MeteoJsonLd />

      <div className="w-full max-w-7xl space-y-8">
        {/* En-tête amélioré */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Météo & Vigilance
              <span className="block text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-600 dark:text-slate-400 mt-1">Guadeloupe</span>
            </h1>
          </div>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
            Suivez en temps réel les conditions météorologiques et les niveaux de vigilance officiels pour votre commune.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full shadow-sm border border-sky-100 dark:border-sky-900/50">
              <span className="text-slate-500 dark:text-gray-400 font-medium">Données officielles :</span>
              <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors">
                OpenWeather
              </a>
              <span className="text-slate-300 dark:text-gray-600 mx-1">•</span>
              <a href="https://meteofrance.gp/" target="_blank" rel="noopener noreferrer" className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-300 font-semibold transition-colors">
                Météo France
              </a>
            </div>
          </div>
        </header>




        {/* Layout Principal : Carte + Sidebar */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-20">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-700 p-1">
            <div className="p-4">
              <section className="flex flex-col lg:flex-row gap-6 w-full items-start relative z-10" aria-label="Carte et détails météo">
                {/* Colonne Gauche : Carte */}
                <div className="w-full lg:flex-1 flex flex-col gap-4">
                  {/* Selecteur de commune */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                    <CommuneSelector
                      selectedCommune={selectedCommune}
                      onSelectCommune={setSelectedCommune}
                      communes={ALL_COMMUNES}
                    />
                  </div>

                  {/* Carte Container */}
                  <div className="relative min-h-[500px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" style={{ height: '700px' }}>
                    {/* Légende flottante */}
                    <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 max-w-[200px]">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Vigilance Météo
                      </h4>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {currentVigilanceInfo.label || 'Chargement...'}
                      </p>
                    </div>

                    <div className="p-4 h-full flex justify-center items-center">
                      <WeatherMapSection
                        weatherData={weatherData}
                        currentVigilanceInfo={currentVigilanceInfo}
                        selectedCommune={selectedCommune}
                        onCommuneHover={handleCommuneHover}
                        onCommuneLeave={handleCommuneLeave}
                        onCommuneClick={handleCommuneClick}
                        loading={loading}
                      />
                    </div>
                  </div>

                  {/* Tooltip Flottant simple (toujours visible au survol) */}
                  {hoveredInfo && typeof document !== 'undefined' && createPortal(
                    <div
                      className="fixed pointer-events-none z-[9999] bg-black/80 text-white text-xs px-2 py-1 rounded shadow-lg transform -translate-x-1/2 -translate-y-full"
                      style={{ left: hoveredInfo.x, top: hoveredInfo.y - 10 }}
                    >
                      {ALL_COMMUNES[hoveredInfo.data.code_zone || ''] || hoveredInfo.data.lib_zone || hoveredInfo.data.code_zone}
                    </div>,
                    document.body
                  )}
                </div>

                <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
                  <MeteoSidebar
                    weatherData={weatherData}
                    currentVigilanceInfo={currentVigilanceInfo}
                    relativeLastUpdate={relativeLastUpdate}
                    focusedCommuneName={sidebarCommuneName}
                    focusedCommuneData={sidebarCommuneData}
                    risks={vigilanceData?.risks}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>



        {/* Nouvelle section éducative sur la vigilance cyclonique */}
        <CyclonicVigilanceGuide />

        {/* Section SEO & Information - Version simplifiée */}
        <section className="mt-4 pt-8 border-t border-slate-200 dark:border-gray-700 text-center text-slate-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 p-6 rounded-2xl backdrop-blur-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Pourquoi consulter la météo par commune ?</h2>
          <p className="text-sm leading-relaxed max-w-3xl mx-auto">
            Le relief de la Guadeloupe (Basse-Terre montagneuse vs Grande-Terre calcaire) crée des micro-climats. Il peut pleuvoir abondamment à <strong>Saint-Claude</strong> ou <strong>Capesterre-Belle-Eau</strong> tout en faisant grand soleil à <strong>Saint-François</strong> ou <strong>Sainte-Anne</strong>.
            Utilisez notre carte interactive pour obtenir les prévisions précises localisées pour votre zone géographique.
          </p>
        </section>

      </div>
    </main>
  );
}
