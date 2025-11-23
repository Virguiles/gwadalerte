'use client'; // Indispensable pour utiliser les hooks

import { useState, useEffect, useMemo, useCallback } from 'react';
import GuadeloupeMap, { AirData, HoverInfo } from '../components/GuadeloupeMap';
import { CommuneSelector } from '../components/shared/CommuneSelector';
import { AirSidebar } from './components/AirSidebar';
import {
  Wind,
  Info,
  AlertTriangle,
  Activity,
  Car,
  Factory,
  Sun,
  CloudFog,
  ShieldCheck,
  AlertOctagon,
  Leaf,
  HelpCircle,
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';

// --- FONCTIONS UTILITAIRES & CONSTANTES ---

// Descriptions optimisées pour l'utilisateur et le SEO
function getQualityDescription(libQual: string): string {
  const descriptions: Record<string, string> = {
    'Bon': 'Qualité de l\'air idéale. Profitez-en pour aérer et bouger !',
    'Moyen': 'Qualité acceptable. Aucun risque pour la majorité de la population.',
    'Dégradé': 'Qualité moyenne. Les personnes sensibles peuvent ressentir une gêne.',
    'Mauvais': 'Air pollué. Risques accrus pour les personnes fragiles.',
    'Très Mauvais': 'Forte pollution. Effets possibles sur la santé de tous.',
    'Extrêmement Mauvais': 'Situation critique. Risques sanitaires importants pour toute la population.',
    // Compatibilité
    'Très bon': 'Qualité de l\'air excellente.',
    'Médiocre': 'Qualité de l\'air préoccupante.',
    'Très mauvais': 'Forte pollution.',
  };
  return descriptions[libQual] || 'Données indisponibles.';
}

function getRecommendations(libQual: string): string {
  const recommendations: Record<string, string> = {
    'Bon': 'Idéal pour toutes les activités de plein air.',
    'Moyen': 'Activités habituelles. Aérez votre logement.',
    'Dégradé': 'Envisagez de réduire les efforts intenses si vous êtes sensible (asthme, allergies).',
    'Mauvais': 'Limitez les activités physiques intenses en extérieur. Privilégiez les sorties courtes.',
    'Très Mauvais': 'Évitez le sport en extérieur. Consultez un médecin en cas de symptômes.',
    'Extrêmement Mauvais': 'Restez à l\'intérieur, fenêtres fermées. Évitez tout effort physique.',
    // Compatibilité
    'Très bon': 'Profitez de l\'extérieur !',
    'Médiocre': 'Limitez les efforts si vous êtes sensible.',
    'Très mauvais': 'Évitez le sport en extérieur.',
  };
  return recommendations[libQual] || '';
}

// Niveaux de vigilance simplifiés pour l'UI
function getVigilanceLevel(libQual: string) {
  const levels: Record<string, { label: string, icon: any, colorClass: string }> = {
    'Bon': { label: 'Aucun risque', icon: ShieldCheck, colorClass: 'text-emerald-600 bg-emerald-50' },
    'Moyen': { label: 'Faible', icon: Leaf, colorClass: 'text-teal-600 bg-teal-50' },
    'Dégradé': { label: 'Vigilance', icon: Info, colorClass: 'text-yellow-600 bg-yellow-50' },
    'Mauvais': { label: 'Alerte', icon: AlertTriangle, colorClass: 'text-orange-600 bg-orange-50' },
    'Très Mauvais': { label: 'Danger', icon: AlertOctagon, colorClass: 'text-red-600 bg-red-50' },
    'Extrêmement Mauvais': { label: 'Crise', icon: Activity, colorClass: 'text-purple-600 bg-purple-50' },
  };
  return levels[libQual] || { label: 'Inconnu', icon: HelpCircle, colorClass: 'text-gray-600 bg-gray-50' };
}

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

  const [mounted, setMounted] = useState(false);
  const [airData, setAirData] = useState<AirData>({});
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
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

  const airEntries = useMemo(() => Object.values(airData || {}), [airData]);
  const totalCommunes = airEntries.length;
  const favorableLabels = useMemo(() => ['bon', 'moyen', 'très bon'], []);
  const alertLabels = useMemo(
    () => ['dégradé', 'mauvais', 'très mauvais', 'extrêmement mauvais', 'médiocre'],
    []
  );
  const favorableCommunes = useMemo(
    () =>
      airEntries.filter((data) => {
        const label = data?.lib_qual?.toLowerCase() || '';
        return favorableLabels.includes(label);
      }).length,
    [airEntries, favorableLabels]
  );
  const alertCommunes = useMemo(
    () =>
      airEntries.filter((data) => {
        const label = data?.lib_qual?.toLowerCase() || '';
        return alertLabels.includes(label);
      }).length,
    [airEntries, alertLabels]
  );
  const formattedLastUpdate = lastUpdate ? formatDateTime(lastUpdate) : 'Actualisation en cours…';

  useEffect(() => {
    setMounted(true);
    const cached = loadFromCache();
    if (cached) {
      setAirData(cached.data);
      setLastUpdate(new Date(cached.timestamp));
    }
  }, []);

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
      } catch (error) {
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

  const defaultQualityLevels = [
    { label: 'Bon', color: '#50F0E6' },
    { label: 'Moyen', color: '#50CCAA' },
    { label: 'Dégradé', color: '#F0E641' },
    { label: 'Mauvais', color: '#FF5050' },
    { label: 'Très Mauvais', color: '#960032' },
    { label: 'Extrêmement Mauvais', color: '#803399' },
  ];

  const getQualityLevelsFromAPI = () => {
    const colorMap = new Map<string, string>();
    Object.values(airData).forEach((data) => {
      if (data.lib_qual && data.coul_qual) {
        colorMap.set(data.lib_qual.trim(), data.coul_qual);
      }
    });
    return defaultQualityLevels.map((level) => {
      let apiColor: string | undefined;
      for (const [apiLabel, apiColorValue] of colorMap.entries()) {
        if (apiLabel.toLowerCase() === level.label.toLowerCase()) {
          apiColor = apiColorValue;
          break;
        }
      }
      return { label: level.label, color: apiColor || level.color };
    });
  };

  const qualityLevels = getQualityLevelsFromAPI();

  const getLevelColor = (label: string): string => {
    const found = Object.values(airData).find((data) =>
      data.lib_qual && data.lib_qual.toLowerCase() === label.toLowerCase()
    );
    return found?.coul_qual || defaultQualityLevels.find((l) => l.label.toLowerCase() === label.toLowerCase())?.color || '#b9b9b9';
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


  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="w-full max-w-7xl">
        {/* En-tête */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800 dark:text-white tracking-tight">
            Qualité de l&apos;Air en <span className="text-teal-600 dark:text-teal-400">Guadeloupe</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
            Consultez en temps réel l&apos;indice ATMO et les prévisions de qualité de l&apos;air pour votre commune. Données certifiées par Gwad&apos;Air.
          </p>
        </div>

        {/* Statistiques clés */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              title: 'Communes suivies',
              value: totalCommunes || '—',
              description: 'Zones couvertes aujourd’hui',
              icon: MapPin,
              accent: 'from-teal-50 to-white',
              text: 'text-teal-700'
            },
            {
              title: 'Air respirable',
              value: favorableCommunes || '—',
              description: 'Indice Bon à Moyen',
              icon: Sparkles,
              accent: 'from-emerald-50 to-white',
              text: 'text-emerald-700'
            },
            {
              title: 'Communes en alerte',
              value: alertCommunes || '—',
              description: formattedLastUpdate,
              icon: AlertTriangle,
              accent: 'from-orange-50 to-white',
              text: 'text-orange-700'
            }
          ].map(({ title, value, description, icon: Icon, accent, text }) => (
            <article
              key={title}
              className={`flex flex-col gap-3 rounded-3xl border border-slate-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-600`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${text}`} />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</span>
              <p className="text-sm text-slate-500 dark:text-gray-400">{description}</p>
            </article>
          ))}
        </section>

        {/* Cartes d'information inspirées de l'accueil */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: 'Carte ATMO en direct',
              description: 'Couverture intégrale de l’archipel avec précision par commune.',
              icon: Wind,
              badge: 'Live',
              accent: 'text-teal-600',
              border: 'hover:border-teal-200',
            },
            {
              title: 'Conseils santé',
              description: 'Recommandations personnalisées selon votre niveau de vigilance.',
              icon: ShieldCheck,
              badge: 'Prévention',
              accent: 'text-emerald-600',
              border: 'hover:border-emerald-200',
            },
            {
              title: 'Comparatif polluants',
              description: 'Comprenez l’impact local des PM10, NO₂, O₃ et SO₂.',
              icon: Activity,
              badge: 'Analyse',
              accent: 'text-blue-600',
              border: 'hover:border-blue-200',
            },
          ].map(({ title, description, icon: Icon, badge, accent, border }) => (
            <article
              key={title}
              className={`group relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 dark:border-gray-700 ${border} overflow-hidden flex flex-col`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
                <Icon className={`w-32 h-32 ${accent} transform rotate-6 translate-x-8 -translate-y-8`} />
              </div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-fit px-3 py-1 text-xs font-semibold rounded-full bg-slate-50 dark:bg-gray-700 text-slate-500 dark:text-gray-400 shadow-sm border border-slate-100 dark:border-gray-600">
                  {badge}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {title}
                  <ArrowRight className={`w-5 h-5 text-slate-300 dark:text-gray-600 group-hover:text-slate-500 dark:group-hover:text-gray-400 transition`} />
                </h3>
                <p className="text-slate-600 dark:text-gray-300 leading-relaxed flex-1">{description}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Sélecteur de commune */}
        <CommuneSelector
          selectedCommune={selectedCommune}
          onSelectCommune={setSelectedCommune}
          communes={communesForSelector}
          title="Sélectionner une commune"
        />

        <div className="flex flex-col lg:flex-row gap-8 w-full items-start mb-12">
          {/* Carte */}
          <div className="flex-1 w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-700 flex flex-col relative group" style={{ height: '700px' }}>
            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 text-xs font-medium text-slate-600 dark:text-gray-300 flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-500 dark:text-teal-400" />
              Carte interactive
            </div>
            <div className="w-full flex justify-center items-center p-6 bg-white dark:bg-gray-800 flex-1 min-h-0 relative">
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

          {/* Sidebar Latérale */}
          <AirSidebar
            data={sidebarData}
            lastUpdate={lastUpdate}
            formatDateTime={formatDateTime}
          />
        </div>

        {/* --- NOUVELLE SECTION: Comprendre l'indice --- */}
        <div className="w-full mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-gray-700 bg-gradient-to-r from-teal-50/50 to-white dark:from-teal-900/20 dark:to-gray-800">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              Comprendre l&apos;indice ATMO
            </h2>
            <p className="text-slate-600 dark:text-gray-300 mt-2">
              L&apos;échelle de qualité de l&apos;air et les recommandations sanitaires associées pour la Guadeloupe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {qualityLevels.map((level) => {
              const actualColor = getLevelColor(level.label);
              const vigilance = getVigilanceLevel(level.label);
              const Icon = vigilance.icon;

              return (
                <div
                  key={level.label}
                  className="flex flex-col h-full bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 group"
                >
                  {/* Header Card */}
                  <div className="p-4 flex items-center gap-4 border-b border-slate-50 dark:border-gray-700" style={{ borderTop: `4px solid ${actualColor}` }}>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ backgroundColor: actualColor }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">{level.label}</h3>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${vigilance.colorClass}`}>
                        {vigilance.label}
                      </span>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {getQualityDescription(level.label)}
                    </p>

                    {getRecommendations(level.label) && (
                      <div className="bg-slate-50 dark:bg-gray-700 rounded-lg p-3 mt-auto">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-slate-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-slate-700 dark:text-gray-300 font-medium italic">
                            &ldquo;{getRecommendations(level.label)}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- NOUVELLE SECTION: Guide des polluants --- */}
        <div className="w-full mt-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-gray-700 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-900/20 dark:to-gray-800">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <CloudFog className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Guide des polluants surveillés
            </h2>
            <p className="text-slate-600 dark:text-gray-300 mt-2">
              Comprendre l&apos;origine et les effets des principaux polluants atmosphériques en Guadeloupe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-gray-700">
            {/* PM10 & PM2.5 */}
            <div className="p-6 group hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Particules Fines <span className="text-sm font-normal text-slate-500 dark:text-gray-400">(PM10, PM2.5)</span></h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide mb-1">Origine</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300">Brumes de sable (Sahara), combustion, trafic routier.</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide mb-1">Impact Santé</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300">Pénètrent profondément dans les poumons. Irritation, asthme, gêne respiratoire.</p>
                </div>
              </div>
            </div>

            {/* NO2 */}
            <div className="p-6 group hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Dioxyde d&apos;azote <span className="text-sm font-normal text-slate-500 dark:text-gray-400">(NO₂)</span></h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide mb-1">Origine</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300">Principalement le trafic routier (moteurs diesel) et centrales électriques.</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide mb-1">Impact Santé</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300">Irrite les bronches. Augmente la sensibilité aux infections microbiennes.</p>
                </div>
              </div>
            </div>

            {/* O3 */}
            <div className="p-6 group hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mb-4 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Ozone <span className="text-sm font-normal text-slate-500 dark:text-gray-400">(O₃)</span></h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide mb-1">Origine</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300">Polluant secondaire formé par réaction chimique sous le soleil intense.</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide mb-1">Impact Santé</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300">Toux, irritations oculaires, diminution de la capacité respiratoire à l&apos;effort.</p>
                </div>
              </div>
            </div>

            {/* SO2 */}
            <div className="p-6 group hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Factory className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Dioxyde de Soufre <span className="text-sm font-normal text-slate-500 dark:text-gray-400">(SO₂)</span></h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide mb-1">Origine</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300">Activités industrielles, raffineries, volcanisme naturel.</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wide mb-1">Impact Santé</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300">Irritation immédiate des muqueuses, de la peau et des voies respiratoires.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
