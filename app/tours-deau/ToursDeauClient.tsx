'use client';

import React, { useState, useMemo, useCallback } from 'react';
import GuadeloupeMap, { HoverInfo, AirData } from '../components/GuadeloupeMap';
import { CommuneSelector } from '../components/shared/CommuneSelector';
import { CommuneTooltip } from '../components/shared/CommuneTooltip';
import { WaterSidebar } from './components/WaterSidebar';
import { WaterTowersGuide } from './components/WaterTowersGuide';
import { WaterMapLegend } from './components/WaterMapLegend';
import { DateFilter } from './types';
import {
  getCommuneWaterStatus,
  getWaterStatusColor,
  formatCommuneName,
  WATER_STATUS_DETAILS,
} from './utils';
import { useWaterData } from '../providers/DataProvider';
import { ErrorDisplay } from '../components/shared/ErrorDisplay';
import { DataPageLayout } from '../components/shared/DataPageLayout';
import { MapPanel } from '../components/shared/MapPanel';
import { MapTabs } from '../components/shared/MapTabs';

export default function ToursDeauClient() {
  const { data: waterData, loading, error, sourceDate, retry } = useWaterData();
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedCommune, setSelectedCommune] = useState<string>('');

  // 2. Gestion du survol (Hover)
  const handleCommuneHover = useCallback((info: HoverInfo) => {
    setHoveredInfo(info);
  }, []);

  const handleCommuneLeave = useCallback(() => {
    setHoveredInfo(null);
  }, []);

  const handleCommuneClick = useCallback((code: string) => {
    setSelectedCommune(prev => prev === code ? '' : code);
  }, []);

  // Préparation des données pour la carte : la couleur encode l'ÉTAT de la
  // commune (pas d'identité), et le libellé de statut alimente le tooltip.
  const mapDataForComponent = useMemo(() => {
    const now = new Date();

    return Object.keys(waterData).reduce((acc, code) => {
      const commune = waterData[code];
      if (commune) {
        const status = getCommuneWaterStatus(commune, dateFilter, now);

        acc[code] = {
          ...commune,
          coul_qual: getWaterStatusColor(status),
          lib_zone: commune.commune,
          lib_qual: WATER_STATUS_DETAILS[status].label,
        };
      }
      return acc;
    }, {} as AirData);
  }, [waterData, dateFilter]);

  const getDateLabel = (): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    if (dateFilter === 'today') {
      return new Date().toLocaleDateString('fr-FR', options);
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toLocaleDateString('fr-FR', options);
    }
    return 'Planning de la semaine';
  };

  const DATE_TABS: { id: DateFilter; label: string; labelShort: string }[] = [
    { id: 'today', label: "Aujourd'hui", labelShort: 'Auj.' },
    { id: 'tomorrow', label: 'Demain', labelShort: 'Dem.' },
    { id: 'week', label: 'Semaine', labelShort: 'Sem.' },
  ];

  const communesForSelector = useMemo(() => {
    const communes: { [code: string]: string } = {};
    Object.entries(waterData).forEach(([code, data]) => {
      communes[code] = data.commune;
    });
    return communes;
  }, [waterData]);

  // Le décompte s'appuie sur le même statut que la couleur de la carte :
  // il comptait auparavant toute commune ayant des détails, si bien qu'un
  // planning non exploitable était annoncé « concerné » tout en restant gris.
  const archipelInfo = useMemo(() => {
    const now = new Date();
    const affectedCommunesList = Object.values(waterData)
      .filter((commune) => getCommuneWaterStatus(commune, dateFilter, now) !== 'none')
      .map((commune) => formatCommuneName(commune.commune))
      .sort();

    return {
      affectedCommunes: affectedCommunesList.length,
      affectedCommunesList,
    };
  }, [waterData, dateFilter]);

  const sidebarData = useMemo(() => {
    const code = selectedCommune;
    if (code && waterData[code]) {
      return waterData[code];
    }
    return null;
  }, [selectedCommune, waterData]);


  return (
    <DataPageLayout
      accent="water"
      title={<>Tours d&apos;Eau</>}
      subtitle={<>{getDateLabel()} - Consultez les coupures d&apos;eau programmées pour votre commune.</>}
      sources={
        <a href="https://www.smgeag.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors">
          SMGEAG
        </a>
      }
      loading={loading}
      loadingLabel="Chargement des données de tours d'eau"
      sectionLabel="Carte et planning des tours d'eau"
      error={
        error && Object.keys(waterData).length === 0 ? (
          <div className="p-4 m-4">
            <ErrorDisplay
              title="Impossible de charger les tours d'eau"
              message={error.message}
              onRetry={retry}
            />
          </div>
        ) : null
      }
      below={<WaterTowersGuide />}
    >
      {/* Colonne Gauche : Carte + Onglets */}
      <div className="w-full lg:flex-1 flex flex-col gap-4">
        <CommuneSelector
          selectedCommune={selectedCommune}
          onSelectCommune={setSelectedCommune}
          communes={communesForSelector}
        />

        <MapTabs
          tabs={DATE_TABS}
          value={dateFilter}
          onValueChange={setDateFilter}
          ariaLabel="Période du planning"
        >
          <MapPanel underTabs>
            {/* Légende flottante : clé de lecture des couleurs */}
            <WaterMapLegend
              periodLabel={getDateLabel()}
              statuses={dateFilter === 'tomorrow' ? ['scheduled', 'none'] : ['ongoing', 'scheduled', 'none']}
              className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 max-w-[200px]"
            />

            <div className="p-4 h-full flex justify-center items-center">
              <GuadeloupeMap
                data={mapDataForComponent}
                selectedCommune={selectedCommune}
                onCommuneHover={handleCommuneHover}
                onCommuneLeave={handleCommuneLeave}
                onCommuneClick={handleCommuneClick}
              />
            </div>
          </MapPanel>
        </MapTabs>

        {/* Tooltip Flottant simple (toujours visible au survol) */}
        <CommuneTooltip hoveredInfo={hoveredInfo} />
      </div>

      <WaterSidebar
        data={sidebarData}
        dateFilter={dateFilter}
        archipelInfo={archipelInfo}
        sourceDate={sourceDate}
        onClose={() => setSelectedCommune('')}
      />
    </DataPageLayout>
  );
}
