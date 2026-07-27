'use client'; // Indispensable pour utiliser les hooks

import { useState, useMemo, useCallback, useEffect } from 'react';
import GuadeloupeMap, { HoverInfo } from '@/app/components/GuadeloupeMap';
import { CommuneSelector } from '@/app/components/shared/CommuneSelector';
import { CommuneTooltip } from '@/app/components/shared/CommuneTooltip';
import { DataPageLayout } from '@/app/components/shared/DataPageLayout';
import { MapPanel } from '@/app/components/shared/MapPanel';
import { AirSidebar } from './components/AirSidebar';
import { AirQualityGuide } from './components/AirQualityGuide';
import { PollutantsGuide } from './components/PollutantsGuide';
import { useAirData } from '@/app/providers/DataProvider';

export default function QualiteAirClient() {
  // --- GESTION DES DONNÉES ---
  const { data: airData, lastUpdate, loading } = useAirData();

  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const [selectedCommune, setSelectedCommune] = useState<string>('');

  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(date);
  };

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

  // Scroll vers la section polluants si hash #polluants (ex: depuis le widget air de l'accueil)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#polluants') return;
    const el = document.getElementById('polluants');
    if (!el) return;
    const timer = setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DataPageLayout
      accent="air"
      title={<>Qualité de l&apos;Air</>}
      subtitle={<>Consultez en temps réel l&apos;indice ATMO et les prévisions de qualité de l&apos;air pour votre commune.</>}
      sources={
        <a href="https://www.gwadair.fr/" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-semibold transition-colors">
          Gwad&apos;Air
        </a>
      }
      loading={loading}
      loadingLabel="Chargement des données de qualité de l'air"
      sectionLabel="Carte et détails qualité de l'air"
      error={
        !loading && Object.keys(airData).length === 0 ? (
          <div role="alert" className="p-4 m-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-center text-red-600 dark:text-red-400">
            <p className="font-medium">Impossible de charger les données de qualité de l&apos;air.</p>
            <p className="text-sm mt-1 opacity-80">Veuillez vérifier votre connexion internet ou réessayer plus tard.</p>
          </div>
        ) : null
      }
      below={
        <>
          {/* Comprendre l'indice (interactif) */}
          <AirQualityGuide airData={airData} selectedCommune={selectedCommune} />

          {/* Guide des polluants (interactif) */}
          <section id="polluants" aria-label="Guide des polluants">
            <PollutantsGuide />
          </section>
        </>
      }
    >
      {/* Colonne Gauche : Carte + Sélecteur */}
      <div className="w-full lg:flex-1 flex flex-col gap-4">
        <CommuneSelector
          selectedCommune={selectedCommune}
          onSelectCommune={setSelectedCommune}
          communes={communesForSelector}
        />

        <MapPanel>
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
          <CommuneTooltip hoveredInfo={hoveredInfo} />
        </MapPanel>
      </div>

      <AirSidebar
        data={sidebarData}
        lastUpdate={lastUpdate}
        formatDateTime={formatDateTime}
        onClose={() => setSelectedCommune('')}
      />
    </DataPageLayout>
  );
}
