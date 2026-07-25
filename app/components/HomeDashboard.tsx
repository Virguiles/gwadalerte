'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GuadeloupeMap, { HoverInfo } from './GuadeloupeMap';
import { useWaterData } from '../hooks/useWaterData';
import { useAirData } from '../hooks/useAirData';
import { useMeteoData } from '../meteo/hooks/useMeteoData';
import { getCommuneColors, hasCutsOnDay, formatCommuneName } from '../tours-deau/utils';
import { VIGILANCE_LEVEL_DETAILS, ALL_COMMUNES } from '../meteo/constants';
import { CommuneSelector } from './shared/CommuneSelector';
import { CommuneTooltip } from './shared/CommuneTooltip';
import { CommuneDetailsSkeleton } from './shared/SkeletonLoader';
import { ErrorDisplay } from './shared/ErrorDisplay';
import { DataFreshnessIndicator } from './shared/DataFreshnessIndicator';
import { HelpButton } from './shared/HelpButton';
import { OnboardingTour } from './shared/OnboardingTour';

import { CloudSun, Droplet, DropletOff, Wind, X, ArrowRight, Database } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type TabType = 'meteo' | 'air' | 'water';

const TABS: { id: TabType; label: string; getIcon: (isActive: boolean) => React.ReactNode }[] = [
  {
    id: 'meteo',
    label: 'Météo',
    getIcon: (isActive) => <CloudSun size={16} className={`-ms-0.5 me-1.5 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'opacity-60'}`} aria-hidden="true" />
  },
  {
    id: 'water',
    label: 'Eau',
    getIcon: (isActive) => <Droplet size={16} className={`-ms-0.5 me-1.5 ${isActive ? 'text-cyan-500 dark:text-cyan-400' : 'opacity-60'}`} aria-hidden="true" />
  },
  {
    id: 'air',
    label: 'Air',
    getIcon: (isActive) => <Wind size={16} className={`-ms-0.5 me-1.5 ${isActive ? 'text-emerald-500 dark:text-emerald-400' : 'opacity-60'}`} aria-hidden="true" />
  },
];

export default function HomeDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('meteo');
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Chargement des données
  const { data: waterData, loading: waterLoading, error: waterError, lastUpdate: waterLastUpdate, retry: retryWater } = useWaterData();
  const { data: airData, loading: airLoading, error: airError, lastUpdate: airLastUpdate, retry: retryAir } = useAirData();
  const { weatherData, vigilanceData, loading: meteoLoading, mounted: meteoMounted } = useMeteoData();

  // Detect prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // --- Logique de couleur de la carte ---
  const getFillColor = (communeId: string): string => {
    const code = communeId.split(' ')[0];

    if (activeTab === 'air') {
      // Couleur ATMO
      return airData[code]?.coul_qual || '#e5e7eb';
    }

    if (activeTab === 'water') {
      // Rouge si coupure aujourd'hui
      const commune = waterData[code];
      if (commune && hasCutsOnDay(commune, new Date())) {
        const colors = getCommuneColors(commune.commune);
        return colors.primary; // Ou une couleur d'alerte standard comme #EF4444
      }
      return '#e5e7eb'; // Gris clair par défaut
    }

    if (activeTab === 'meteo') {
      // Couleur de vigilance
      if (vigilanceData && vigilanceData.level !== undefined) {
        // On colore toute la carte avec la couleur de vigilance
        // Idéalement, on pourrait avoir des vigilances par zone
        return VIGILANCE_LEVEL_DETAILS[vigilanceData.level]?.color || '#28d761';
      }
      return '#28d761'; // Vert par défaut
    }

    return '#e5e7eb';
  };

  // --- Gestionnaires d'événements ---
  const handleCommuneHover = (info: HoverInfo) => {
    setHoveredInfo(info);
  };

  const handleCommuneLeave = () => {
    setHoveredInfo(null);
  };

  const infoPanelRef = React.useRef<HTMLDivElement>(null);

  const handleCommuneClick = (codeZone: string) => {
    const newSelection = selectedCommune === codeZone ? null : codeZone;
    setSelectedCommune(newSelection);

    // Sur mobile, scroller vers le panneau d'info si une commune est sélectionnée
    if (newSelection && window.innerWidth < 1024) {
      setTimeout(() => {
        infoPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleCommuneSelect = (code: string) => {
    if (code === '') {
      setSelectedCommune(null);
    } else {
      setSelectedCommune(code);
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          infoPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  };

  // --- Contenu du Panneau d'Information ---
  const renderInfoPanelContent = () => {
    // Cas 1 : Aucune commune sélectionnée (Vue Globale)
    if (!selectedCommune) {
      return (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full" aria-hidden="true"></span>
                Vue d&apos;ensemble
              </h2>
              <HelpButton
                title="À propos de ce dashboard"
                content="Cette vue vous donne un aperçu rapide de la situation en Guadeloupe : vigilance météo, coupures d'eau et qualité de l'air. Cliquez sur un widget pour explorer les détails."
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Météo Widget */}
              <div
                onClick={() => setActiveTab('meteo')}
                className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
                  prefersReducedMotion ? '' : 'hover:scale-[1.02] transition-all duration-300'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab('meteo'); }}}
                aria-label="Voir les détails de la vigilance météo"
              >
                <div className={`absolute top-2 right-2 opacity-5 ${prefersReducedMotion ? '' : 'group-hover:opacity-10 transition-opacity'}`} aria-hidden="true">
                  <CloudSun className="w-10 h-10" />
                </div>
                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-blue-500 dark:text-blue-400" aria-hidden="true" />
                  Vigilance Météo
                </h3>
                {!meteoMounted || meteoLoading ? (
                  <div className="space-y-3">
                    <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-3 py-1.5 rounded-full text-sm font-bold border transition-colors"
                        style={{
                          backgroundColor: (vigilanceData?.level !== undefined ? VIGILANCE_LEVEL_DETAILS[vigilanceData.level]?.highlight : undefined) || 'rgba(59, 130, 246, 0.1)',
                          color: vigilanceData?.color || '#3b82f6',
                          borderColor: vigilanceData?.color || '#3b82f6'
                        }}
                        role="status"
                        aria-label={`Niveau de vigilance: ${vigilanceData?.label || 'Normal'}`}
                      >
                        {vigilanceData?.label || 'Normal'}
                      </span>
                      {vigilanceData?.level !== undefined && VIGILANCE_LEVEL_DETAILS[vigilanceData.level]?.description && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {VIGILANCE_LEVEL_DETAILS[vigilanceData.level].description}
                        </span>
                      )}
                    </div>

                    {vigilanceData?.risks && vigilanceData.risks.filter(risk => risk.level > 1).length > 0 ? (
                      <div className="space-y-2 mb-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Types de risques
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {vigilanceData.risks.filter(risk => risk.level > 1).map((risk, i) => {
                            const riskLevelInfo = VIGILANCE_LEVEL_DETAILS[risk.level];
                            const riskColor = riskLevelInfo?.color || '#3b82f6';
                            const riskLabel = riskLevelInfo?.label || 'Normal';
                            return (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors"
                                style={{
                                  backgroundColor: riskLevelInfo?.highlight || 'rgba(59, 130, 246, 0.1)',
                                  color: riskColor,
                                  borderColor: riskColor
                                }}
                                title={`${risk.type} : ${riskLabel}`}
                              >
                                {risk.type}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {vigilanceData?.phenomenes_phrases && vigilanceData?.phenomenes_phrases.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Phénomènes en cours
                        </p>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
                          {vigilanceData.phenomenes_phrases.slice(0, 2).map((p, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span
                                className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                style={{
                                  backgroundColor: vigilanceData?.color || '#3b82f6'
                                }}
                              ></span>
                              <span className="leading-relaxed">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Aucune vigilance particulière.
                      </p>
                    )}
                  </div>
                )}

                {/* Indicateur de cliquabilité */}
                <div className={`mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-blue-600 dark:text-blue-400 font-medium text-sm opacity-0 ${prefersReducedMotion ? 'group-hover:opacity-100' : 'group-hover:opacity-100 transition-opacity duration-300'}`} aria-hidden="true">
                  <span>Voir détails</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Eau Widget */}
                {waterError ? (
                  <div className="col-span-2">
                    <ErrorDisplay
                      variant="inline"
                      title="Erreur tours d'eau"
                      message={waterError.message}
                      onRetry={retryWater}
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => setActiveTab('water')}
                    className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-xl hover:border-cyan-300 dark:hover:border-cyan-600 cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 ${
                      prefersReducedMotion ? '' : 'hover:scale-[1.02] transition-all duration-300'
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTab('water'); }}}
                    aria-label="Voir les détails des tours d'eau"
                  >
                  <div className={`absolute top-2 right-2 opacity-5 ${prefersReducedMotion ? '' : 'group-hover:opacity-10 transition-opacity'}`} aria-hidden="true">
                    <DropletOff className="w-10 h-10" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <DropletOff className="w-4 h-4 text-cyan-500 dark:text-cyan-400" aria-hidden="true" />
                    <div className="flex flex-col">
                      <span>Tours d&apos;eau</span>
                      <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500 normal-case tracking-normal">
                        Coupures d&apos;eau planifiées
                      </span>
                    </div>
                  </h3>
                  {waterLoading ? (
                    <div className="space-y-2">
                      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ) : Object.keys(waterData).length === 0 ? (
                    <div className="text-center py-2">
                      <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Aucune donnée</p>
                    </div>
                  ) : (
                    <div>
                      {(() => {
                        const affectedCommunes = Object.keys(waterData).filter(code =>
                          hasCutsOnDay(waterData[code], new Date())
                        );
                        const count = affectedCommunes.length;
                        const displayNames = affectedCommunes
                          .map(code => formatCommuneName(waterData[code].commune))
                          .sort();

                        return (
                          <>
                            <div className={`text-2xl font-bold mb-1 ${count > 0 ? 'text-red-500' : 'text-emerald-500'}`} role="status" aria-label={`${count} communes avec coupures d'eau`}>
                              {count > 0 ? count : 'OK'}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mb-2">
                              {count > 0 ? 'communes touchées' : 'Réseau stable'}
                            </p>
                            {waterLastUpdate && (
                              <DataFreshnessIndicator lastUpdated={waterLastUpdate} className="mb-2" />
                            )}
                            {count > 0 && (
                              <div>
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                  {displayNames.map((name, i) => (
                                    <li key={i} className="truncate">• {name}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Indicateur de cliquabilité */}
                  <div className={`mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-cyan-600 dark:text-cyan-400 font-medium text-xs opacity-0 ${prefersReducedMotion ? 'group-hover:opacity-100' : 'group-hover:opacity-100 transition-opacity duration-300'}`} aria-hidden="true">
                    <span>Voir le planning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Air Widget */}
              {airError ? (
                <div className="col-span-2">
                  <ErrorDisplay
                    variant="inline"
                    title="Erreur qualité de l'air"
                    message={airError.message}
                    onRetry={retryAir}
                  />
                </div>
              ) : (
                <div
                  onClick={() => router.push('/qualite-air#polluants')}
                  className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 ${
                    prefersReducedMotion ? '' : 'hover:scale-[1.02] transition-all duration-300'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/qualite-air#polluants'); }}}
                  aria-label="Voir les détails de la qualité de l'air et les polluants"
                >
                  <div className={`absolute top-2 right-2 opacity-5 ${prefersReducedMotion ? '' : 'group-hover:opacity-10 transition-opacity'}`} aria-hidden="true">
                    <Wind className="w-10 h-10" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
                    Qualité de l&apos;Air
                  </h3>
                  {airLoading ? (
                    <div className="space-y-2">
                      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ) : Object.keys(airData).length === 0 ? (
                    <div className="text-center py-2">
                      <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Aucune donnée</p>
                    </div>
                  ) : (
                    <div>
                      {(() => {
                        // Calcul de l'état global : qualité majoritaire sur l'archipel
                        const qualities = Object.values(airData)
                          .map(d => d.lib_qual)
                          .filter(q => q && q.toLowerCase() !== 'indisponible');

                        const counts: Record<string, number> = {};
                        let maxCount = 0;
                        let globalQuality = 'Bon';

                        qualities.forEach(q => {
                          if (!q) return;
                          counts[q] = (counts[q] || 0) + 1;
                          if (counts[q] > maxCount) {
                            maxCount = counts[q];
                            globalQuality = q;
                          }
                        });

                        // Trouver la couleur correspondante dans les données
                        const globalQualityData = Object.values(airData).find(d => d.lib_qual === globalQuality);
                        const globalColor = globalQualityData?.coul_qual || '#50F0E6'; // Par défaut Bon

                        // Créer une couleur highlight similaire au système de vigilance
                        const hexToRgba = (hex: string, alpha: number) => {
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                        };
                        const highlightColor = hexToRgba(globalColor, 0.15);

                        // Filter out 'Bon', 'Indisponible' and null/undefined pour les alertes
                        const alertCommunes = Object.values(airData).filter(d => {
                          const qual = d.lib_qual?.toLowerCase();
                          return qual && qual !== 'bon' && qual !== 'indisponible';
                        });

                        const count = alertCommunes.length;
                        const displayNames = alertCommunes
                          .map(d => ({ name: d.lib_zone, qual: d.lib_qual, color: d.coul_qual }))
                          .sort((a, b) => a.name.localeCompare(b.name));

                        return (
                          <>
                            <div className="flex flex-col gap-1.5 mb-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className="px-3 py-1.5 rounded-full text-sm font-bold border transition-colors"
                                  style={{
                                    backgroundColor: highlightColor,
                                    color: globalColor,
                                    borderColor: globalColor
                                  }}
                                  title="Indice ATMO"
                                  role="status"
                                  aria-label={`Qualité de l'air: ${globalQuality}`}
                                >
                                  {globalQuality}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                Échelle ATMO : 1=Bon → 6=Critique
                              </p>
                              {airLastUpdate && (
                                <DataFreshnessIndicator lastUpdated={airLastUpdate} />
                              )}
                            </div>

                            {count > 0 ? (
                              <div className="space-y-2 mb-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Zones à surveiller
                                </p>
                                <div>
                                  <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                    {displayNames.slice(0, 5).map((item, i) => (
                                      <li key={i} className="truncate">• {item.name}</li>
                                    ))}
                                    {count > 5 && (
                                      <li className="truncate text-gray-500 dark:text-gray-400">
                                        • +{count - 5} autres
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Qualité de l&apos;air satisfaisante sur l&apos;archipel.
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Indicateur de cliquabilité */}
                  <div className={`mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium text-xs opacity-0 ${prefersReducedMotion ? 'group-hover:opacity-100' : 'group-hover:opacity-100 transition-opacity duration-300'}`} aria-hidden="true">
                    <span>Voir les polluants</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      );
    }

    // Cas 2 : Commune sélectionnée
    const communeCode = selectedCommune;
    // On essaie de trouver le nom de la commune via les différentes sources de données
    const communeName =
      waterData[communeCode]?.commune ||
      airData[communeCode]?.lib_zone ||
      weatherData[communeCode]?.lib_zone ||
      communeCode; // Fallback

    // Si toutes les données sont en chargement
    if (waterLoading && airLoading && meteoLoading) {
      return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full overflow-y-auto">
          <CommuneDetailsSkeleton />
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{communeName}</h2>
          <button
            onClick={() => setSelectedCommune(null)}
            className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
              prefersReducedMotion ? '' : 'transition-all duration-200 hover:scale-110'
            }`}
            aria-label={`Fermer les détails de ${communeName}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Section Météo Locale */}
          <div className={`p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center text-lg font-semibold text-blue-900 dark:text-blue-300 gap-2">
                <CloudSun className="w-6 h-6" aria-hidden="true" /> Météo
                {!meteoLoading && weatherData[communeCode] && (
                  <span className="text-4xl font-bold ml-4" aria-label={`Température: ${weatherData[communeCode].temperature} degrés`}>{weatherData[communeCode].temperature}°</span>
                )}
              </h3>
              <HelpButton
                title="Données météo"
                content="Température actuelle, conditions météorologiques, humidité et vitesse du vent pour cette commune."
              />
            </div>
            {meteoLoading ? (
              <div className="space-y-3">
                <div className="h-4 w-full bg-blue-200 dark:bg-blue-800 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-blue-200 dark:bg-blue-800 rounded animate-pulse"></div>
              </div>
            ) : weatherData[communeCode] ? (
              <div className="text-gray-700 dark:text-gray-300">
                <p className="capitalize mb-2">{weatherData[communeCode].weather_description}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Droplet className="w-4 h-4" /> Humidité: {weatherData[communeCode].humidity}%
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-4 h-4" /> Vent: {weatherData[communeCode].wind_speed} km/h
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Pas de données météo spécifiques pour cette commune.</p>
            )}
          </div>

          {/* Section Eau Locale */}
          <div className={`p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border border-cyan-100 dark:border-cyan-800`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center text-lg font-semibold text-cyan-900 dark:text-cyan-300 gap-2">
                <DropletOff className="w-6 h-6" aria-hidden="true" />
                <div className="flex flex-col">
                  <span>Tours d&apos;eau</span>
                  <span className="text-xs font-normal text-cyan-700 dark:text-cyan-400 normal-case">
                    Coupures d&apos;eau planifiées
                  </span>
                </div>
              </h3>
              <HelpButton
                title="Tours d'eau"
                content="Les tours d'eau sont des coupures d'eau planifiées pour permettre la maintenance du réseau de distribution."
              />
            </div>
            {waterLoading ? (
              <div className="space-y-3">
                <div className="h-12 w-full bg-cyan-200 dark:bg-cyan-800 rounded-lg animate-pulse"></div>
                <div className="h-4 w-full bg-cyan-200 dark:bg-cyan-800 rounded animate-pulse"></div>
              </div>
            ) : waterError ? (
              <ErrorDisplay
                variant="inline"
                message={waterError.message}
                onRetry={retryWater}
              />
            ) : waterData[communeCode] ? (
              <div>
                {hasCutsOnDay(waterData[communeCode], new Date()) ? (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg mb-2 border border-red-200 dark:border-red-800">
                    <strong>⚠️ Coupure prévue aujourd&apos;hui</strong>
                  </div>
                ) : (
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg mb-2 border border-green-200 dark:border-green-800">
                    ✅ Pas de coupure prévue aujourd&apos;hui
                  </div>
                )}

                {hasCutsOnDay(waterData[communeCode], new Date()) && waterData[communeCode].details.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Planning général :</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                      {waterData[communeCode].details.map((d, i) => (
                        <li key={i}>{d.secteur} : {d.horaires}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Aucune information de tour d&apos;eau connue.</p>
            )}
          </div>

          {/* Section Air Locale */}
          <div className={`p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-100 dark:border-green-800`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center text-lg font-semibold text-green-900 dark:text-green-300 gap-2">
                <Wind className="w-6 h-6" aria-hidden="true" /> Qualité de l&apos;Air
              </h3>
              <HelpButton
                title="Qualité de l'air"
                content="L'indice ATMO mesure la qualité de l'air sur une échelle de 1 (Bon) à 6 (Extrêmement mauvais). Il prend en compte plusieurs polluants."
              />
            </div>
            {airLoading ? (
              <div className="space-y-2">
                <div className="h-8 w-24 bg-green-200 dark:bg-green-800 rounded-full animate-pulse"></div>
                <div className="h-3 w-full bg-green-200 dark:bg-green-800 rounded animate-pulse"></div>
              </div>
            ) : airError ? (
              <ErrorDisplay
                variant="inline"
                message={airError.message}
                onRetry={retryAir}
              />
            ) : airData[communeCode] ? (
              <div>
                {(() => {
                  const communeAirData = airData[communeCode];
                  const airColor = communeAirData.coul_qual || '#50F0E6';
                  const airQuality = communeAirData.lib_qual || 'Bon';

                  // Créer une couleur highlight similaire au système de vigilance
                  const hexToRgba = (hex: string, alpha: number) => {
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                  };
                  const highlightColor = hexToRgba(airColor, 0.15);

                  return (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-3 py-1.5 rounded-full text-sm font-bold border transition-colors"
                          style={{
                            backgroundColor: highlightColor,
                            color: airColor,
                            borderColor: airColor
                          }}
                          title="Indice ATMO"
                        >
                          {airQuality}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">
                        Échelle ATMO : 1=Bon → 6=Critique
                      </p>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Données non disponibles.</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Onboarding Tour */}
      <OnboardingTour />

      <div className="flex flex-col lg:flex-row min-h-[600px] gap-4 sm:gap-6 p-2 xs:p-3 sm:p-4 max-w-7xl mx-auto">

        {/* Colonne Gauche : Carte + Tabs Navigation */}
        <div className="lg:w-2/3 flex flex-col gap-4">

        {/* Selecteur de commune */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <CommuneSelector
            selectedCommune={selectedCommune || ''}
            onSelectCommune={handleCommuneSelect}
            communes={ALL_COMMUNES}
          />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabType)} className="w-full gap-0">
          <TabsList className="relative flex h-auto w-full gap-0 bg-transparent p-0" role="tablist" aria-label="Catégories de données">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`flex-1 overflow-hidden rounded-b-none border border-gray-200 dark:border-gray-700 bg-muted py-3 -ml-px first:ml-0 data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:data-[state=active]:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  prefersReducedMotion ? '' : 'transition-colors'
                }`}
                title={tab.label}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
              >
                {tab.getIcon(activeTab === tab.id)}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Carte Container */}
          <div
            className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-[65vh] max-h-[80vh] bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden"
            role="tabpanel"
            id={`${activeTab}-panel`}
            aria-labelledby={`${activeTab}-tab`}
          >

            {/* Légende flottante dynamique */}
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur p-2 sm:p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 max-w-[240px] sm:max-w-[280px]" role="complementary" aria-label="Légende de la carte">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {activeTab === 'meteo' ? 'Vigilance Météo' :
                  activeTab === 'water' ? 'Coupures d\'eau' : 'Qualité de l\'air'}
              </h4>

              {/* État actuel */}
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                {activeTab === 'meteo'
                  ? (!meteoMounted || meteoLoading ? 'Chargement...' : (vigilanceData?.label ?? 'Chargement...'))
                  : activeTab === 'water'
                    ? 'Zones touchées'
                    : 'Indice ATMO'}
              </p>

              {/* Mini légende avec couleurs (uniquement pour l'onglet Eau) */}
              {activeTab === 'water' && (
                <div className="space-y-1.5 mb-2">

                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600"></div>
                    <span className="text-gray-600 dark:text-gray-400">Gris = Pas de coupure</span>
                  </div>
                </div>
              )}

              {/* Message d'aide contextuel (commune sélectionnée uniquement) */}
              {selectedCommune && (
                <div className={`text-xs leading-relaxed pt-2 ${activeTab === 'water' ? 'border-t border-blue-200 dark:border-blue-600' : ''}`}>
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
                onCommuneHover={handleCommuneHover}
                onCommuneLeave={handleCommuneLeave}
                onCommuneClick={handleCommuneClick}
                selectedCommune={selectedCommune}
              />
            </div>
          </div>
        </Tabs>



        {/* Tooltip Flottant simple (toujours visible au survol) */}
        <CommuneTooltip hoveredInfo={hoveredInfo} />
      </div>

        {/* Colonne Droite : Info Panel (Sticky sur Desktop) */}
        <div ref={infoPanelRef} className="lg:w-1/3 lg:h-[800px] lg:sticky lg:top-4" role="region" aria-label="Informations détaillées">
          {renderInfoPanelContent()}
        </div>

      </div>
    </>
  );
}
