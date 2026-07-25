'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useMeteoData } from '../providers/DataProvider';
// import { useTooltip } from './hooks/useTooltip';
import { getVigilanceLevelInfo, formatRelativeTime } from './utils';
import { CommuneSelector } from '../components/shared/CommuneSelector';
import { ALL_COMMUNES } from './constants';
import { WeatherMapSection } from './components/WeatherMapSection';
import { MeteoSidebar } from './components/MeteoSidebar';
import { CommuneTooltip } from '../components/shared/CommuneTooltip';
// import { MeteoTooltip } from './components/MeteoTooltip';
import { HoverInfo } from '../components/GuadeloupeMap';
import { CyclonicVigilanceGuide } from './components/CyclonicVigilanceGuide';
import { DataPageLayout } from '../components/shared/DataPageLayout';
import { MapPanel } from '../components/shared/MapPanel';
import { MapTabs } from '../components/shared/MapTabs';
// Icônes Lucide supprimées - utilisant maintenant le composant WeatherIcon

// Type pour les filtres de prévision
type ForecastFilter = 'today' | 'tomorrow' | '3days';

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
      name: "Météo-France / Gwad'Alerte"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default function MeteoClient() {
  const { weatherData, vigilanceData, loading, mounted } = useMeteoData();
  const [selectedCommune, setSelectedCommune] = useState<string>('');
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const [forecastFilter, setForecastFilter] = useState<ForecastFilter>('today');

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

  // Variables conservées pour référence future si besoin
  // const weatherEntries = useMemo(() => Object.values(weatherData || {}), [weatherData]);

  const FORECAST_TABS: { id: ForecastFilter; label: string; labelShort: string }[] = [
    { id: 'today', label: "Aujourd'hui", labelShort: 'Auj.' },
    { id: 'tomorrow', label: 'Demain', labelShort: 'Dem.' },
    { id: '3days', label: '3 jours', labelShort: '3J' },
  ];

  return (
    <DataPageLayout
      accent="meteo"
      title={<>Météo &amp; Vigilance</>}
      subtitle={<>Suivez en temps réel les conditions météorologiques et les niveaux de vigilance officiels pour votre commune.</>}
      sourcesLabel="Données :"
      sources={
        <>
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold transition-colors">
            Open-Meteo
          </a>
          <span className="text-slate-300 dark:text-gray-600 mx-1">•</span>
          <a href="https://meteofrance.gp/" target="_blank" rel="noopener noreferrer" className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-300 font-semibold transition-colors">
            Météo France (vigilance)
          </a>
        </>
      }
      sectionLabel="Carte et détails météo"
      below={
        <>
          <MeteoJsonLd />

          {/* Section éducative sur la vigilance cyclonique */}
          <CyclonicVigilanceGuide />

          {/* Section SEO & Information */}
          <section className="mt-4 pt-8 border-t border-slate-200 dark:border-gray-700 text-center text-slate-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 p-6 rounded-2xl backdrop-blur-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Pourquoi consulter la météo par commune ?</h2>
            <p className="text-sm leading-relaxed max-w-3xl mx-auto">
              Le relief de la Guadeloupe (Basse-Terre montagneuse vs Grande-Terre calcaire) crée des micro-climats. Il peut pleuvoir abondamment à <strong>Saint-Claude</strong> ou <strong>Capesterre-Belle-Eau</strong> tout en faisant grand soleil à <strong>Saint-François</strong> ou <strong>Sainte-Anne</strong>.
              Utilisez notre carte interactive pour obtenir les prévisions précises localisées pour votre zone géographique.
            </p>
          </section>
        </>
      }
    >
      {/* Colonne Gauche : Carte + Onglets */}
      <div className="w-full lg:flex-1 flex flex-col gap-4">
        <CommuneSelector
          selectedCommune={selectedCommune}
          onSelectCommune={setSelectedCommune}
          communes={ALL_COMMUNES}
        />

        <MapTabs
          tabs={FORECAST_TABS}
          value={forecastFilter}
          onValueChange={setForecastFilter}
          ariaLabel="Période de prévision"
        >
          <MapPanel underTabs>
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
          </MapPanel>
        </MapTabs>

        {/* Tooltip Flottant simple (toujours visible au survol) */}
        <CommuneTooltip hoveredInfo={hoveredInfo} />
      </div>

      <MeteoSidebar
        weatherData={weatherData}
        currentVigilanceInfo={currentVigilanceInfo}
        relativeLastUpdate={relativeLastUpdate}
        focusedCommuneCode={sidebarCommuneCode}
        focusedCommuneName={sidebarCommuneName}
        focusedCommuneData={sidebarCommuneData}
        risks={vigilanceData?.risks}
        forecastFilter={forecastFilter}
        onClose={() => setSelectedCommune('')}
      />
    </DataPageLayout>
  );
}
