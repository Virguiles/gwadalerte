'use client'; // Indispensable pour utiliser les hooks

import { useState, useEffect, useMemo, useCallback } from 'react';
import GuadeloupeMap, { AirData, HoverInfo } from '../components/GuadeloupeMap';
import { CommuneSelector } from '../components/shared/CommuneSelector';
import { AirSidebar } from './components/AirSidebar';
import { AirQualityGuide } from './components/AirQualityGuide';
import { PollutantsGuide } from './components/PollutantsGuide';

export default function QualiteAir() {
  // --- GESTION DU CACHE ET DE L'ÉTAT ---
  const loadFromCache = (): { data: AirData; timestamp: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const CACHE_KEY = 'gwada_air_quality_cache';
      const CACHE_TIMESTAMP_KEY = 'gwada_air_quality_cache_timestamp';
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        return { data: JSON.parse(cachedData), timestamp };
      }
    } catch (error) {
      console.error('Erreur lecture cache:', error);
    }
    return null;
  };

  const [airData, setAirData] = useState<AirData>(() => {
    const cached = loadFromCache();
    return cached?.data || {};
  });
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(() => {
    const cached = loadFromCache();
    return cached ? new Date(cached.timestamp) : null;
  });
  const [selectedCommune, setSelectedCommune] = useState<string>('');

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const CACHE_KEY = 'gwada_air_quality_cache';
    const CACHE_TIMESTAMP_KEY = 'gwada_air_quality_cache_timestamp';

    const saveToCache = (data: AirData) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        const timestamp = Date.now();
        localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
        setLastUpdate(new Date(timestamp));
      } catch (error) {
        console.error('Erreur sauvegarde cache:', error);
      }
    };

    const shouldFetch = (): boolean => {
      try {
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (!cachedTimestamp) return true;
        const timestamp = parseInt(cachedTimestamp, 10);
        const lastUpdateDate = new Date(timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60);

        if (!isSameDay(lastUpdateDate, now) || diffMinutes > 3) {
          console.log(`[Cache] Expiré (${Math.round(diffMinutes)} min), refresh...`);
          return true;
        }
        console.log(`[Cache] Valide (${Math.round(diffMinutes)} min).`);
        return false;
      } catch {
        return true;
      }
    };

    if (shouldFetch()) {
      fetch('http://127.0.0.1:8000/api/air-quality')
        .then((res) => res.json())
        .then((data) => {
          setAirData(data);
          saveToCache(data);
        })
        .catch((error) => console.error('Erreur API:', error));
    }
  }, []);

  const communesForSelector = useMemo(() => {
    const communes: { [code: string]: string } = {};
    Object.entries(airData).forEach(([code, data]) => {
      communes[code] = data.lib_zone;
    });
    return communes;
  }, [airData]);

  // Gestion du survol (Hover)
  const handleCommuneHover = useCallback((info: HoverInfo) => {
    setHoveredInfo(info);
  }, []);

  const handleCommuneLeave = useCallback(() => {
    setHoveredInfo(null);
  }, []);

  // Gestion du clic
  const handleCommuneClick = useCallback((code: string) => {
    setSelectedCommune(prev => prev === code ? '' : code);
  }, []);

  // Données pour la Sidebar
  const sidebarData = useMemo(() => {
    const code = selectedCommune;
    if (code && airData[code]) {
      return airData[code];
    }
    return null;
  }, [selectedCommune, airData]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 dark:from-slate-950 dark:via-teal-950 dark:to-emerald-950 transition-colors duration-300">
      <div className="w-full max-w-7xl space-y-8">
        {/* En-tête amélioré */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 dark:from-teal-400 dark:via-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
              Qualité de l&apos;Air
              <span className="block text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-600 dark:text-slate-400 mt-1">Guadeloupe</span>
            </h1>
          </div>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
            Consultez en temps réel l&apos;indice ATMO et les prévisions de qualité de l&apos;air pour votre commune.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full shadow-sm border border-teal-100 dark:border-teal-900/50">
              <span className="text-slate-500 dark:text-gray-400 font-medium">Données officielles :</span>
              <a href="https://www.gwadair.fr/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-semibold transition-colors">
                Gwad&apos;Air
              </a>
            </div>
          </div>
        </header>

        {/* Layout Principal : Carte + Sidebar */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-20">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-700 p-1">
            <div className="p-4">
              <section className="flex flex-col lg:flex-row gap-6 w-full items-start relative z-10" aria-label="Carte et détails qualité de l'air">
                {/* Colonne Gauche : Carte + Sélecteur */}
                <div className="w-full lg:flex-1 flex flex-col gap-4">
                  {/* Selecteur de commune */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                    <CommuneSelector
                      selectedCommune={selectedCommune}
                      onSelectCommune={setSelectedCommune}
                      communes={communesForSelector}
                    />
                  </div>

                  {/* Carte Container */}
                  <div className="relative min-h-[500px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" style={{ height: '700px' }}>
                    <div className="w-full h-full flex justify-center items-center p-4">
                      <GuadeloupeMap
                        data={airData}
                        selectedCommune={selectedCommune}
                        onCommuneHover={handleCommuneHover}
                        onCommuneLeave={handleCommuneLeave}
                        onCommuneClick={handleCommuneClick}
                      />
                    </div>

                    {/* Tooltip Flottant simple au survol */}
                    {hoveredInfo && (
                      <div
                        className="fixed pointer-events-none z-50 bg-black/80 text-white text-xs px-2 py-1 rounded shadow-lg transform -translate-x-1/2 -translate-y-full"
                        style={{ left: hoveredInfo.x, top: hoveredInfo.y - 10 }}
                      >
                        {hoveredInfo.data.lib_zone || hoveredInfo.data.code_zone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Latérale */}
                <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
                  <AirSidebar
                    data={sidebarData}
                    lastUpdate={lastUpdate}
                    formatDateTime={formatDateTime}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* --- NOUVELLE SECTION: Comprendre l'indice (Interactive) --- */}
        <AirQualityGuide />

        {/* --- NOUVELLE SECTION: Guide des polluants (Interactive) --- */}
        <PollutantsGuide />

      </div>
    </main>
  );
}
