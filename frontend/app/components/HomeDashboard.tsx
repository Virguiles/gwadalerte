'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import GuadeloupeMap, { HoverInfo } from './GuadeloupeMap';
import { useWaterData } from '../hooks/useWaterData';
import { useAirData } from '../hooks/useAirData';
import { useMeteoData } from '../meteo/hooks/useMeteoData';
import { getCommuneColors, hasCutsOnDay } from '../tours-deau/utils';
import { VIGILANCE_LEVEL_DETAILS, ALL_COMMUNES } from '../meteo/constants';
import { CommuneSelector } from './shared/CommuneSelector';

type TabType = 'meteo' | 'air' | 'water';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'meteo', label: 'Météo', icon: '🌤️' },
  { id: 'water', label: 'Eau', icon: '💧' },
  { id: 'air', label: 'Air', icon: '🍃' },
];

export default function HomeDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('meteo');
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);

  // Chargement des données
  const { data: waterData, loading: waterLoading } = useWaterData();
  const { data: airData, loading: airLoading } = useAirData();
  const { weatherData, vigilanceData, loading: meteoLoading } = useMeteoData();

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
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              Vue d'ensemble
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {/* Météo Widget */}
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-1 shadow-md transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="text-6xl">🌤️</span>
                </div>
                <div className="relative h-full bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-blue-50">Météo</h3>
                    {meteoLoading ? (
                      <span className="text-xs opacity-75">...</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
                        {vigilanceData?.label || 'Normal'}
                      </span>
                    )}
                  </div>

                  {!meteoLoading && vigilanceData?.phenomenes_phrases && vigilanceData?.phenomenes_phrases.length > 0 ? (
                    <ul className="mt-2 text-sm text-blue-50 space-y-1">
                      {vigilanceData?.phenomenes_phrases.slice(0, 2).map((p, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-white rounded-full"></span>
                          <span className="truncate">{p}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-blue-100 mt-1">Aucune vigilance particulière.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Eau Widget */}
                {/* Eau Widget */}
                <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:border-cyan-200 dark:hover:border-cyan-700 transition-all">
                  <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-4xl">💧</span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Eau Potable</h3>
                  {waterLoading ? (
                    <div className="h-8 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    <div>
                      {(() => {
                        const affectedCommunes = Object.keys(waterData).filter(code =>
                          hasCutsOnDay(waterData[code], new Date())
                        );
                        const count = affectedCommunes.length;
                        const displayNames = affectedCommunes
                          .map(code => waterData[code].commune)
                          .sort();

                        return (
                          <>
                            <div className={`text-2xl font-bold mb-1 ${count > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                              {count > 0 ? count : 'OK'}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mb-2">
                              {count > 0 ? 'communes touchées' : 'Réseau stable'}
                            </p>
                            {count > 0 && (
                              <div className="max-h-32 overflow-y-auto pr-1 custom-scrollbar">
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
                </div>

                {/* Air Widget */}
                <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-700 transition-all">
                  <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-4xl">🍃</span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Qualité Air</h3>
                  {airLoading ? (
                    <div className="h-8 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    <div>
                      {(() => {
                        // Filter out 'Bon', 'Indisponible' and null/undefined
                        const alertCommunes = Object.values(airData).filter(d => {
                          const qual = d.lib_qual?.toLowerCase();
                          return qual && qual !== 'bon' && qual !== 'indisponible';
                        });

                        const count = alertCommunes.length;
                        const displayNames = alertCommunes
                          .map(d => ({ name: d.lib_zone, qual: d.lib_qual, color: d.coul_qual }))
                          .sort((a, b) => a.name.localeCompare(b.name));

                        // Fallback logic for majority index if no alerts (meaning everything is Bon or Indisponible)
                        const qualities = Object.values(airData).map(d => d.lib_qual);
                        const counts: Record<string, number> = {};
                        let maxCount = 0;
                        let majority = 'Moyen';
                        qualities.forEach(q => {
                          if (!q) return;
                          counts[q] = (counts[q] || 0) + 1;
                          if (counts[q] > maxCount) {
                            maxCount = counts[q];
                            majority = q;
                          }
                        });

                        const getColor = (m: string) => {
                          if (['bon', 'moyen'].includes(m.toLowerCase())) return 'text-emerald-500';
                          if (['dégradé'].includes(m.toLowerCase())) return 'text-yellow-500';
                          return 'text-orange-500';
                        }

                        if (count > 0) {
                          return (
                            <>
                              <div className="text-2xl font-bold mb-1 text-orange-500">
                                {count}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mb-2">
                                communes à surveiller
                              </p>
                              <div className="max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                  {displayNames.map((item, i) => (
                                    <li key={i} className="flex items-center gap-1 truncate">
                                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                      <span>{item.name}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          );
                        }

                        return (
                          <>
                            <div className={`text-lg font-bold mb-1 truncate ${getColor(majority)}`}>
                              {majority}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                              Indice majoritaire
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions / Legend Hint */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-center text-gray-400">
                Cliquez sur une commune sur la carte pour voir le détail.
              </p>
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

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{communeName}</h2>
          <button
            onClick={() => setSelectedCommune(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Section Météo Locale */}
          <div className={`p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800`}>
            <h3 className="flex items-center text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
              🌤️ Météo
            </h3>
            {meteoLoading ? (
              <p className="text-gray-700 dark:text-gray-300">Chargement...</p>
            ) : weatherData[communeCode] ? (
              <div className="text-gray-700 dark:text-gray-300">
                <p className="text-3xl font-bold mb-1">{weatherData[communeCode].temperature}°C</p>
                <p className="capitalize">{weatherData[communeCode].weather_description}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>💧 Humidité: {weatherData[communeCode].humidity}%</div>
                  <div>💨 Vent: {weatherData[communeCode].wind_speed} km/h</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Pas de données météo spécifiques pour cette commune.</p>
            )}
          </div>

          {/* Section Eau Locale */}
          <div className={`p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border border-cyan-100 dark:border-cyan-800`}>
            <h3 className="flex items-center text-lg font-semibold text-cyan-900 dark:text-cyan-300 mb-3">
              💧 Tours d'eau
            </h3>
            {waterLoading ? (
              <p className="text-gray-700 dark:text-gray-300">Chargement...</p>
            ) : waterData[communeCode] ? (
              <div>
                {hasCutsOnDay(waterData[communeCode], new Date()) ? (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg mb-2 border border-red-200 dark:border-red-800">
                    <strong>⚠️ Coupure prévue aujourd'hui</strong>
                  </div>
                ) : (
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg mb-2 border border-green-200 dark:border-green-800">
                    ✅ Pas de coupure prévue aujourd'hui
                  </div>
                )}

                {waterData[communeCode].details.length > 0 && (
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Aucune information de tour d'eau connue.</p>
            )}
          </div>

          {/* Section Air Locale */}
          <div className={`p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-100 dark:border-green-800`}>
            <h3 className="flex items-center text-lg font-semibold text-green-900 dark:text-green-300 mb-3">
              🍃 Qualité de l'Air
            </h3>
            {airLoading ? (
              <p className="text-gray-700 dark:text-gray-300">Chargement...</p>
            ) : airData[communeCode] ? (
              <div>
                <div
                  className="inline-block px-4 py-2 rounded-full font-bold text-white mb-2"
                  style={{ backgroundColor: airData[communeCode].coul_qual }}
                >
                  {airData[communeCode].lib_qual}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Dernière mesure : {new Date().toLocaleDateString()}
                </p>
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
    <div className="flex flex-col lg:flex-row min-h-[600px] gap-6 p-4 max-w-7xl mx-auto">

      {/* Colonne Gauche : Carte + Tabs Navigation */}
      <div className="lg:w-2/3 flex flex-col gap-4">

        {/* Selecteur de commune */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
          <CommuneSelector
            selectedCommune={selectedCommune || ''}
            onSelectCommune={handleCommuneSelect}
            communes={ALL_COMMUNES}
            title="Rechercher une commune"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 border border-gray-100 dark:border-gray-700 flex justify-around sm:justify-start sm:gap-4 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-gray-900 dark:bg-blue-600 text-white shadow-md transform scale-105'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Carte Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative min-h-[500px]">

          {/* Légende flottante en fonction du tab */}
          <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 max-w-[200px]">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {activeTab === 'meteo' ? 'Vigilance Météo' :
                activeTab === 'water' ? 'Tours d\'eau' : 'Qualité de l\'air'}
            </h4>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {activeTab === 'meteo' ? (vigilanceData?.label || 'Chargement...') :
                activeTab === 'water' ? 'Zones coupées en rouge' :
                  'Indice ATMO'}
            </p>
          </div>

          <GuadeloupeMap
            getFillColor={getFillColor}
            onCommuneHover={handleCommuneHover}
            onCommuneLeave={handleCommuneLeave}
            onCommuneClick={handleCommuneClick}
            selectedCommune={selectedCommune}
          />
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

      {/* Colonne Droite : Info Panel (Sticky sur Desktop) */}
      <div ref={infoPanelRef} className="lg:w-1/3 lg:h-[800px] lg:sticky lg:top-4">
        {renderInfoPanelContent()}
      </div>

    </div>
  );
}
