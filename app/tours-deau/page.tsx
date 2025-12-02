'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import GuadeloupeMap, { HoverInfo, AirData } from '../components/GuadeloupeMap';
import { CommuneSelector } from '../components/shared/CommuneSelector';
import { CommuneTooltip } from '../components/shared/CommuneTooltip';
// import { WaterTooltip, TooltipAnchor } from './components/WaterTooltip';
import { WaterSidebar } from './components/WaterSidebar';
import { WaterTowersGuide } from './components/WaterTowersGuide';
import { WaterDataMap, DateFilter } from './types';
import { getCommuneColors, hasCutsOnDay, getTargetDate } from './utils';
import { CalendarDays } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function WaterMapPage() {
  const [waterData, setWaterData] = useState<WaterDataMap>({});
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedCommune, setSelectedCommune] = useState<string>('');

  // 1. Récupérer les données
  useEffect(() => {
    // Utiliser les API Routes Next.js locales
    fetch('/api/water-cuts')
      .then((res) => res.json())
      .then((data) => {
        setWaterData(data);
      })
      .catch(console.error);
  }, []);

  // 2. Logique de couleur
  const getCommuneColor = useCallback((code_zone: string): string => {
    const commune = waterData[code_zone];
    if (!commune || commune.details.length === 0) {
      return '#B9B9B9';
    }

    if (dateFilter !== 'week') {
      const targetDate = getTargetDate(dateFilter);
      if (!hasCutsOnDay(commune, targetDate)) {
        return '#B9B9B9';
      }
    }

    const colors = getCommuneColors(commune.commune);
    return colors.primary;
  }, [waterData, dateFilter]);


  // 3. Gestion du survol (Hover)
  const handleCommuneHover = useCallback((info: HoverInfo) => {
    setHoveredInfo(info);
  }, []);

  const handleCommuneLeave = useCallback(() => {
    setHoveredInfo(null);
  }, []);

  const handleCommuneClick = useCallback((code: string) => {
    setSelectedCommune(prev => prev === code ? '' : code);
  }, []);

  // Préparation des données pour la carte
  const mapDataForComponent = useMemo(() => {
    const targetDate = getTargetDate(dateFilter);

    const result = Object.keys(waterData).reduce((acc, code) => {
      const commune = waterData[code];
      if (commune) {
        let coul_qual = '#B9B9B9';

        if (commune.details.length > 0) {
          if (dateFilter !== 'week') {
            if (hasCutsOnDay(commune, targetDate)) {
              const colors = getCommuneColors(commune.commune);
              coul_qual = colors.primary;
            }
          } else {
            const colors = getCommuneColors(commune.commune);
            coul_qual = colors.primary;
          }
        }

        acc[code] = {
          ...commune,
          coul_qual: coul_qual,
          lib_zone: commune.commune,
          lib_qual: '',
        };
      }
      return acc;
    }, {} as AirData);
    return result;
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

  const DATE_TABS: { id: DateFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'today', label: "Aujourd'hui", icon: <CalendarDays size={16} className="-ms-0.5 me-1.5 opacity-60" /> },
    { id: 'tomorrow', label: 'Demain', icon: <CalendarDays size={16} className="-ms-0.5 me-1.5 opacity-60" /> },
    { id: 'week', label: 'Semaine', icon: <CalendarDays size={16} className="-ms-0.5 me-1.5 opacity-60" /> },
  ];

  const communesForSelector = useMemo(() => {
    const communes: { [code: string]: string } = {};
    Object.entries(waterData).forEach(([code, data]) => {
      communes[code] = data.commune;
    });
    return communes;
  }, [waterData]);

  const waterEntries = useMemo(() => Object.values(waterData || {}), [waterData]);

  const archipelInfo = useMemo(() => {
    const targetDate = getTargetDate(dateFilter);
    const affectedCommunes = waterEntries.filter(commune => {
      if (!commune.details || commune.details.length === 0) return false;
      if (dateFilter === 'week') return true;
      return hasCutsOnDay(commune, targetDate);
    }).length;
    return { affectedCommunes };
  }, [waterEntries, dateFilter]);

  const totalCuts = useMemo(
    () => waterEntries.reduce((acc, commune) => acc + (commune.details?.length || 0), 0),
    [waterEntries]
  );

  const sidebarData = useMemo(() => {
    const code = selectedCommune;
    if (code && waterData[code]) {
      return waterData[code];
    }
    return null;
  }, [selectedCommune, waterData]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-16 md:pt-24 pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-slate-950 dark:via-blue-950 dark:to-cyan-950 transition-colors duration-300">
      <div className="w-full max-w-7xl space-y-6 md:space-y-8">
        {/* En-tête */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400 bg-clip-text text-transparent">
              Tours d&apos;Eau
              <span className="block text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-600 dark:text-slate-400 mt-1">Guadeloupe</span>
            </h1>
          </div>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
            {getDateLabel()} - Consultez les coupures d&apos;eau programmées pour votre commune.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full shadow-sm border border-blue-100 dark:border-blue-900/50">
              <span className="text-slate-500 dark:text-gray-400 font-medium">Données officielles :</span>
              <a href="https://www.smgeag.fr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors">
                SMGEAG
              </a>
            </div>
          </div>
        </header>



        {/* Layout Principal : Carte + Sidebar */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 relative z-20">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-gray-700 p-1">
            <div className="p-4">
              <section className="flex flex-col lg:flex-row gap-6 w-full items-start relative z-10">
                {/* Colonne Gauche : Carte + Tabs Navigation */}
                <div className="w-full lg:flex-1 flex flex-col gap-4">
                  {/* Selecteur de commune */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                    <CommuneSelector
                      selectedCommune={selectedCommune}
                      onSelectCommune={setSelectedCommune}
                      communes={communesForSelector}
                    />
                  </div>

                  {/* Navigation Tabs */}
                  <Tabs value={dateFilter} onValueChange={(val) => setDateFilter(val as DateFilter)} className="w-full gap-0">
                    <TabsList className="relative flex h-auto w-full gap-0 bg-transparent p-0">
                      {DATE_TABS.map((tab) => (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="flex-1 overflow-hidden rounded-b-none border border-gray-200 dark:border-gray-700 border-b bg-muted py-3 -ml-px first:ml-0 data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:data-[state=active]:text-white data-[state=active]:border-b-0 data-[state=active]:mb-[-1px]"
                        >
                          {tab.icon}
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {/* Carte Container */}
                    <div className="relative h-[500px] md:h-[700px] min-h-[400px] md:min-h-[500px] bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
                      {/* Légende flottante */}
                      <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 max-w-[200px]">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Tours d&apos;eau
                        </h4>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {getDateLabel()}
                        </p>
                      </div>

                      <div className="p-4 h-full flex justify-center items-center">
                        <GuadeloupeMap
                          data={mapDataForComponent}
                          selectedCommune={selectedCommune}
                          onCommuneHover={handleCommuneHover}
                          onCommuneLeave={handleCommuneLeave}
                          onCommuneClick={handleCommuneClick}
                        />
                      </div>
                    </div>
                  </Tabs>

                  {/* Tooltip Flottant simple (toujours visible au survol) */}
                  <CommuneTooltip hoveredInfo={hoveredInfo} />
                </div>

                {/* Sidebar */}
                <WaterSidebar
                  data={sidebarData}
                  dateFilter={dateFilter}
                  archipelInfo={archipelInfo}
                  onClose={() => setSelectedCommune('')}
                />

              </section>
            </div>
          </div>
        </div>

        {/* Guide Informatif */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <WaterTowersGuide />
        </div>
      </div>
    </main>
  );
}
