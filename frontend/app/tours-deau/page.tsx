'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import GuadeloupeMap, { HoverInfo, AirData } from '../components/GuadeloupeMap';
import { CommuneSelector } from '../components/shared/CommuneSelector';
// import { WaterTooltip, TooltipAnchor } from './components/WaterTooltip';
import { WaterSidebar } from './components/WaterSidebar';
import { WaterDataMap, DateFilter } from './types';
import { getCommuneColors, hasCutsOnDay, getTargetDate } from './utils';
import { Droplets, MapPin, CalendarDays, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';

export default function WaterMapPage() {
  const [waterData, setWaterData] = useState<WaterDataMap>({});
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedCommune, setSelectedCommune] = useState<string>('');

  // 1. Récupérer les données
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/water-cuts')
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
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    if (dateFilter === 'today') {
      return new Date().toLocaleDateString('fr-FR', options);
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toLocaleDateString('fr-FR', options);
    }
    return 'Planning de la semaine';
  };

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
    <main className="flex min-h-screen flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="w-full max-w-7xl space-y-8">
        {/* En-tête */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3 text-gray-800 dark:text-white">Tours d&apos;eau en Guadeloupe</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-2">{getDateLabel()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Source: SMGEAG</p>
        </div>

        {/* Statistiques clés */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Communes suivies',
              value: waterEntries.length || '—',
              description: 'Zones couvertes',
              icon: MapPin,
              accent: 'from-cyan-50 to-white',
              text: 'text-cyan-700'
            },
            {
              title: 'Communes impactées',
              value: archipelInfo.affectedCommunes || '—',
              description: dateFilter === 'week' ? 'Période hebdo' : 'Filtre du jour',
              icon: AlertTriangle,
              accent: 'from-amber-50 to-white',
              text: 'text-amber-700'
            },
            {
              title: 'Coupures enregistrées',
              value: totalCuts || '—',
              description: 'Segments déclarés',
              icon: Droplets,
              accent: 'from-blue-50 to-white',
              text: 'text-blue-700'
            },
            {
              title: 'Période suivie',
              value: dateFilter === 'today' ? "Aujourd'hui" : dateFilter === 'tomorrow' ? 'Demain' : 'Semaine',
              description: 'Mise à jour continue',
              icon: CalendarDays,
              accent: 'from-slate-50 to-white',
              text: 'text-slate-700'
            }
          ].map(({ title, value, description, icon: Icon, accent, text }) => (
            <article
              key={title}
              className="flex flex-col gap-3 rounded-3xl border border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-600"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${text}`} />
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </article>
          ))}
        </section>

        <CommuneSelector
          selectedCommune={selectedCommune}
          onSelectCommune={setSelectedCommune}
          communes={communesForSelector}
          title="Sélectionner une commune"
        />

        {/* Onglets de filtrage */}
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shadow-sm">
            {(['today', 'tomorrow', 'week'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
                  dateFilter === filter
                    ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {filter === 'today' ? "Aujourd'hui" : filter === 'tomorrow' ? "Demain" : "Semaine"}
              </button>
            ))}
          </div>
        </div>

        {/* Cartes d'information */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Cartographie instantanée',
              description: 'Visualisez en un coup d’œil les communes actuellement en coupure.',
              icon: Droplets,
              badge: 'Live',
              accent: 'text-blue-600',
              border: 'hover:border-blue-200'
            },
            {
              title: 'Planning intelligent',
              description: 'Anticipez les tours d’eau grâce aux filtres Aujourd’hui, Demain et Semaine.',
              icon: CalendarDays,
              badge: 'Prévision',
              accent: 'text-emerald-600',
              border: 'hover:border-emerald-200'
            },
            {
              title: 'Alertes locales',
              description: 'Accédez aux secteurs, horaires et conseils pour chaque commune impactée.',
              icon: Sparkles,
              badge: 'Focus',
              accent: 'text-amber-600',
              border: 'hover:border-amber-200'
            }
          ].map(({ title, description, icon: Icon, badge, accent, border }) => (
            <article
              key={title}
              className={`group relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-700 ${border} overflow-hidden flex flex-col`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                <Icon className={`w-32 h-32 ${accent} transform -rotate-6 translate-x-8 -translate-y-8`} />
              </div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-fit px-3 py-1 text-xs font-semibold rounded-full bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-sm border border-gray-100 dark:border-gray-600">
                  {badge}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {title}
                  <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition" />
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-1">{description}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Layout Principal : Carte + Sidebar */}
        <section className="flex flex-col lg:flex-row gap-6 w-full items-start relative z-10">

            {/* Carte */}
            <div className="w-full lg:flex-1 bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 flex flex-col relative" style={{ height: '700px' }}>
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    💧 <span className="font-semibold">
                        {dateFilter === 'week'
                        ? 'Chaque commune concernée par des tours d\'eau a sa propre couleur'
                        : `Les communes en couleur ont des coupures d'eau ${dateFilter === 'today' ? 'aujourd\'hui' : 'demain'}`
                        }
                    </span> - Cliquez sur une commune pour voir les détails
                    </p>
                </div>

                <div className="w-full flex justify-center items-center p-6 bg-white dark:bg-gray-800 flex-1 min-h-0 relative">
                    <GuadeloupeMap
                        data={mapDataForComponent}
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

            {/* Sidebar */}
            <WaterSidebar
                data={sidebarData}
                dateFilter={dateFilter}
                archipelInfo={archipelInfo}
            />

        </section>
      </div>
    </main>
  );
}
