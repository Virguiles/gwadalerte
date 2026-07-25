'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloudSun, Droplet, Wind } from 'lucide-react';

import GuadeloupeMap, { HoverInfo } from './GuadeloupeMap';
import { useWaterData, useAirData, useMeteoData } from '../providers/DataProvider';
import { getCommuneWaterStatus, getWaterStatusColor } from '../tours-deau/utils';
import { WaterMapLegend } from '../tours-deau/components/WaterMapLegend';
import { VIGILANCE_LEVEL_DETAILS, ALL_COMMUNES } from '../meteo/constants';
import { CommuneSelector } from './shared/CommuneSelector';
import { CommuneTooltip } from './shared/CommuneTooltip';
import { CommuneDetailsSkeleton } from './shared/SkeletonLoader';
import { MapTabs, type MapTab } from './shared/MapTabs';
import { OnboardingTour } from './shared/OnboardingTour';
import { DashboardOverview } from './dashboard/DashboardOverview';
import { CommuneDetails } from './dashboard/CommuneDetails';

type TabType = 'meteo' | 'water' | 'air';

const TABS: MapTab<TabType>[] = [
  {
    id: 'meteo',
    label: 'Météo',
    getIcon: (isActive) => (
      <CloudSun
        size={16}
        className={`-ms-0.5 me-1.5 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'opacity-60'}`}
        aria-hidden="true"
      />
    ),
  },
  {
    id: 'water',
    label: 'Eau',
    getIcon: (isActive) => (
      <Droplet
        size={16}
        className={`-ms-0.5 me-1.5 ${isActive ? 'text-cyan-500 dark:text-cyan-400' : 'opacity-60'}`}
        aria-hidden="true"
      />
    ),
  },
  {
    id: 'air',
    label: 'Air',
    getIcon: (isActive) => (
      <Wind
        size={16}
        className={`-ms-0.5 me-1.5 ${isActive ? 'text-emerald-500 dark:text-emerald-400' : 'opacity-60'}`}
        aria-hidden="true"
      />
    ),
  },
];

const NEUTRAL_FILL = '#e5e7eb';
const DEFAULT_VIGILANCE_FILL = '#28d761';

export default function HomeDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('meteo');
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);

  const {
    data: waterData,
    loading: waterLoading,
    error: waterError,
    sourceDate: waterSourceDate,
    retry: retryWater,
  } = useWaterData();
  const {
    data: airData,
    loading: airLoading,
    error: airError,
    lastUpdate: airLastUpdate,
    retry: retryAir,
  } = useAirData();
  const { weatherData, vigilanceData, loading: meteoLoading, mounted: meteoMounted } = useMeteoData();

  // --- Couleur de la carte selon l'onglet actif ---
  const getFillColor = useCallback(
    (communeId: string): string => {
      const code = communeId.split(' ')[0];

      if (activeTab === 'air') {
        return airData[code]?.coul_qual || NEUTRAL_FILL;
      }

      if (activeTab === 'water') {
        // Échelle d'état : gris = rien, ambre = coupure prévue, rouge = en cours
        return getWaterStatusColor(getCommuneWaterStatus(waterData[code], 'today'));
      }

      // Météo : couleur de vigilance, uniforme sur l'archipel
      if (vigilanceData?.level !== undefined) {
        return VIGILANCE_LEVEL_DETAILS[vigilanceData.level]?.color || DEFAULT_VIGILANCE_FILL;
      }
      return DEFAULT_VIGILANCE_FILL;
    },
    [activeTab, airData, waterData, vigilanceData]
  );

  // --- Sélection ---
  const revealInfoPanelOnMobile = useCallback(() => {
    if (window.innerWidth >= 1024) return;
    setTimeout(() => {
      infoPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleCommuneClick = useCallback(
    (codeZone: string) => {
      setSelectedCommune((previous) => {
        const next = previous === codeZone ? null : codeZone;
        if (next) revealInfoPanelOnMobile();
        return next;
      });
    },
    [revealInfoPanelOnMobile]
  );

  const handleCommuneSelect = useCallback(
    (code: string) => {
      setSelectedCommune(code || null);
      if (code) revealInfoPanelOnMobile();
    },
    [revealInfoPanelOnMobile]
  );

  // Nom de la commune, cherché dans les trois sources de données
  const communeName = selectedCommune
    ? waterData[selectedCommune]?.commune ||
      airData[selectedCommune]?.lib_zone ||
      weatherData[selectedCommune]?.lib_zone ||
      selectedCommune
    : '';

  const allLoading = waterLoading && airLoading && meteoLoading;

  return (
    <>
      <OnboardingTour />

      <div className="flex flex-col lg:flex-row min-h-[600px] gap-4 sm:gap-6 p-2 xs:p-3 sm:p-4 max-w-7xl mx-auto">
        {/* Colonne Gauche : sélecteur + onglets + carte */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          <CommuneSelector
            selectedCommune={selectedCommune || ''}
            onSelectCommune={handleCommuneSelect}
            communes={ALL_COMMUNES}
          />

          <MapTabs
            tabs={TABS}
            value={activeTab}
            onValueChange={setActiveTab}
            ariaLabel="Catégories de données"
          >
            <div className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[65vh] max-h-[80vh] bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
              {/* Légende flottante dynamique */}
              <div
                className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur p-2 sm:p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 max-w-[240px] sm:max-w-[280px]"
                role="complementary"
                aria-label="Légende de la carte"
              >
                {activeTab === 'water' ? (
                  <WaterMapLegend periodLabel="Aujourd'hui" className="mb-2" />
                ) : (
                  <>
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      {activeTab === 'meteo' ? 'Vigilance Météo' : "Qualité de l'air"}
                    </h4>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                      {activeTab === 'meteo'
                        ? !meteoMounted || meteoLoading
                          ? 'Chargement...'
                          : vigilanceData?.label ?? 'Chargement...'
                        : 'Indice ATMO'}
                    </p>
                  </>
                )}

                {selectedCommune && (
                  <div
                    className={`text-xs leading-relaxed pt-2 ${
                      activeTab === 'water' ? 'border-t border-blue-200 dark:border-blue-600' : ''
                    }`}
                  >
                    <p className="text-blue-600 dark:text-blue-400 hidden lg:block">
                      ✓ Commune sélectionnée · Cliquez ailleurs pour désélectionner
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 lg:hidden">
                      ✓ Commune sélectionnée · Touchez ailleurs pour désélectionner
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <GuadeloupeMap
                  getFillColor={getFillColor}
                  onCommuneHover={setHoveredInfo}
                  onCommuneLeave={() => setHoveredInfo(null)}
                  onCommuneClick={handleCommuneClick}
                  selectedCommune={selectedCommune}
                />
              </div>
            </div>
          </MapTabs>

          {/* Tooltip flottant au survol */}
          <CommuneTooltip hoveredInfo={hoveredInfo} />
        </div>

        {/* Colonne Droite : panneau d'information (collant sur desktop) */}
        <div
          ref={infoPanelRef}
          className="lg:w-1/3 lg:h-[800px] lg:sticky lg:top-4"
          role="region"
          aria-label="Informations détaillées"
        >
          {!selectedCommune ? (
            <DashboardOverview
              vigilanceData={vigilanceData}
              meteoLoading={!meteoMounted || meteoLoading}
              waterData={waterData}
              waterLoading={waterLoading}
              waterError={waterError}
              waterSourceDate={waterSourceDate}
              onRetryWater={retryWater}
              airData={airData}
              airLoading={airLoading}
              airError={airError}
              airLastUpdate={airLastUpdate}
              onRetryAir={retryAir}
              onSelectMeteo={() => setActiveTab('meteo')}
              onSelectWater={() => setActiveTab('water')}
              onSelectAir={() => router.push('/qualite-air#polluants')}
            />
          ) : allLoading ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full overflow-y-auto">
              <CommuneDetailsSkeleton />
            </div>
          ) : (
            <CommuneDetails
              communeCode={selectedCommune}
              communeName={communeName}
              weatherData={weatherData}
              meteoLoading={meteoLoading}
              waterCommune={waterData[selectedCommune]}
              waterLoading={waterLoading}
              waterError={waterError}
              onRetryWater={retryWater}
              airData={airData}
              airLoading={airLoading}
              airError={airError}
              onRetryAir={retryAir}
              onClose={() => setSelectedCommune(null)}
            />
          )}
        </div>
      </div>
    </>
  );
}
