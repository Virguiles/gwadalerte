'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { useMeteoData } from './hooks/useMeteoData';
// import { useTooltip } from './hooks/useTooltip';
import { getVigilanceLevelInfo, formatRelativeTime } from './utils';
import { VigilanceBanner } from './components/VigilanceBanner';
import { CommuneSelector } from '../components/shared/CommuneSelector';
import { ALL_COMMUNES } from './constants';
import { WeatherMapSection } from './components/WeatherMapSection';
import { MeteoSidebar } from './components/MeteoSidebar';
import { VigilanceDetails } from './components/VigilanceDetails';
// import { MeteoTooltip } from './components/MeteoTooltip';
import { HoverInfo } from '../components/GuadeloupeMap';
import { CloudSun, Radar, Umbrella, Waves, Wind, AlertTriangle, MapPin, ArrowRight } from 'lucide-react';

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
      name: 'Météo France / GwadaSVG'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default function MeteoPage() {
  const { weatherData, vigilanceData, loading, mounted } = useMeteoData();
  const [selectedCommune, setSelectedCommune] = useState<string>('');
  const [hoveredInfo, setHoveredInfo] = useState<HoverInfo | null>(null);
  const vigilanceDetailsRef = useRef<HTMLDivElement>(null);

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

  const weatherEntries = useMemo(() => Object.values(weatherData || {}), [weatherData]);
  const activeStations = useMemo(
    () => weatherEntries.filter((entry) => typeof entry.temperature === 'number').length,
    [weatherEntries]
  );
  const humidityAverage = useMemo(() => {
    const values = weatherEntries
      .map((entry) => entry.humidity)
      .filter((value): value is number => typeof value === 'number');
    if (values.length === 0) return null;
    return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
  }, [weatherEntries]);
  const phenomenaCount = vigilanceData?.phenomenes_phrases?.length || vigilanceData?.risks?.length || 0;


  const scrollToVigilanceDetails = useCallback(() => {
    if (vigilanceDetailsRef.current) {
      vigilanceDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-6 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-950 dark:via-blue-950 dark:to-cyan-950 transition-colors duration-300">
      <MeteoJsonLd />

      <div className="w-full max-w-7xl space-y-8">
        {/* En-tête amélioré */}
        <header className="text-center space-y-4">
          <div className="inline-block">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-600 bg-clip-text text-transparent pb-2">
              Météo & Vigilance
              <span className="block text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-600 dark:text-gray-300 mt-1">Guadeloupe</span>
            </h1>
          </div>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-gray-300 font-medium">
            Suivez en temps réel les conditions météorologiques et les niveaux de vigilance officiels pour votre commune.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full shadow-sm border border-blue-100 dark:border-blue-800">
              <span className="text-slate-500 dark:text-gray-400 font-medium">Données officielles :</span>
              <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors">
                OpenWeather
              </a>
              <span className="text-slate-300 dark:text-gray-600 mx-1">•</span>
              <a href="https://meteofrance.gp/" target="_blank" rel="noopener noreferrer" className="text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-cyan-300 font-semibold transition-colors">
                Météo France
              </a>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Communes suivies',
              value: weatherEntries.length || '—',
              description: 'Prévisions hyperlocales',
              icon: MapPin,
              accent: 'from-blue-50 to-white',
              text: 'text-blue-700'
            },
            {
              title: 'Stations actives',
              value: activeStations || '—',
              description: 'Capteurs météo opérationnels',
              icon: Radar,
              accent: 'from-cyan-50 to-white',
              text: 'text-cyan-700'
            },
            {
              title: 'Humidité moyenne',
              value: typeof humidityAverage === 'number' ? `${humidityAverage}%` : '—',
              description: 'Archipel (dernière mesure)',
              icon: Waves,
              accent: 'from-slate-50 to-white',
              text: 'text-slate-700'
            },
            {
              title: 'Phénomènes surveillés',
              value: phenomenaCount || '—',
              description: currentVigilanceInfo.label,
              icon: AlertTriangle,
              accent: 'from-amber-50 to-white',
              text: 'text-amber-700'
            }
          ].map(({ title, value, description, icon: Icon, accent, text }) => (
            <article
              key={title}
              className="flex flex-col gap-3 rounded-3xl border border-slate-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-600"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${text}`} />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">{title}</p>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</span>
              <p className="text-sm text-slate-500 dark:text-gray-400">{description}</p>
            </article>
          ))}
        </section>

        <VigilanceBanner
          currentVigilanceInfo={currentVigilanceInfo}
          relativeLastUpdate={relativeLastUpdate}
          onScrollToDetails={scrollToVigilanceDetails}
        />

        <section aria-label="Sélection de commune" className="relative z-20">
          <CommuneSelector
            selectedCommune={selectedCommune}
            onSelectCommune={setSelectedCommune}
            communes={ALL_COMMUNES}
            title="Météo par commune"
          />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Prévisions hyperlocales',
              description: 'Chaque commune dispose de sa fiche météo complète, température, vent et pluie.',
              icon: CloudSun,
              badge: 'Focus',
              accent: 'text-blue-600',
              border: 'hover:border-blue-200'
            },
            {
              title: 'Vigilance officielle',
              description: 'Accédez aux conseils Météo-France et recevez les niveaux d’alerte en un clin d’œil.',
              icon: Wind,
              badge: 'Alerte',
              accent: 'text-emerald-600',
              border: 'hover:border-emerald-200'
            },
            {
              title: 'Guides cycloniques',
              description: 'Comprenez les bons réflexes à adopter pendant la saison des pluies et cyclones.',
              icon: Umbrella,
              badge: 'Prévention',
              accent: 'text-amber-600',
              border: 'hover:border-amber-200'
            }
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
                  <ArrowRight className="w-5 h-5 text-slate-300 dark:text-gray-600 group-hover:text-slate-500 dark:group-hover:text-gray-400 transition" />
                </h3>
                <p className="text-slate-600 dark:text-gray-300 leading-relaxed flex-1">{description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="flex flex-col lg:flex-row gap-6 w-full items-start relative z-10" aria-label="Carte et détails météo">
          <div className="w-full lg:flex-1 relative">
            <WeatherMapSection
              weatherData={weatherData}
              currentVigilanceInfo={currentVigilanceInfo}
              selectedCommune={selectedCommune}
              onCommuneHover={handleCommuneHover}
              onCommuneLeave={handleCommuneLeave}
              onCommuneClick={handleCommuneClick}
              loading={loading}
            />
            {/* Tooltip Flottant simple (toujours visible au survol) */}
            {hoveredInfo && (
                <div
                className="fixed pointer-events-none z-50 bg-black/80 text-white text-xs px-2 py-1 rounded shadow-lg transform -translate-x-1/2 -translate-y-full"
                style={{ left: hoveredInfo.x, top: hoveredInfo.y - 10 }}
                >
                {hoveredInfo.data.lib_zone || hoveredInfo.data.code_zone}
                </div>
            )}
             {/* On peut aussi vouloir le tooltip même si sélectionné, pour explorer. Sur HomeDashboard c'est : !selectedCommune.
                 Si on veut exactement comme Home :
                 {hoveredInfo && !selectedCommune && (...)}
              */}
          </div>

          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
            <MeteoSidebar
              weatherData={weatherData}
              currentVigilanceInfo={currentVigilanceInfo}
              relativeLastUpdate={relativeLastUpdate}
              focusedCommuneName={sidebarCommuneName}
              focusedCommuneData={sidebarCommuneData}
            />
          </div>
        </section>

        <div ref={vigilanceDetailsRef} className="scroll-mt-24">
          <VigilanceDetails
            currentLevel={currentVigilanceInfo.level}
            mounted={mounted}
          />
        </div>

        {/* Nouvelle section SEO & Information - Utile pour le référencement naturel */}
        <section className="mt-12 pt-8 border-t border-slate-200 dark:border-gray-700 grid md:grid-cols-2 gap-8 text-slate-700 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 p-6 rounded-2xl backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Comprendre la Vigilance en Guadeloupe</h2>
            <p className="text-sm leading-relaxed mb-4">
              La Guadeloupe est soumise à divers risques météorologiques tropicaux. Le système de vigilance de Météo France permet d&apos;informer la population des dangers potentiels tels que les <strong>fortes pluies et orages</strong>, les <strong>vents violents</strong>, ou la <strong>mer dangereuse à la côte</strong>.
            </p>
            <p className="text-sm leading-relaxed">
              En période cyclonique (de juin à novembre), il est crucial de rester informé. Les niveaux de vigilance (Jaune, Orange, Rouge, Violet, Gris) dictent les comportements à adopter pour votre sécurité.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Pourquoi consulter la météo par commune ?</h2>
            <p className="text-sm leading-relaxed mb-4">
              Le relief de la Guadeloupe (Basse-Terre montagneuse vs Grande-Terre calcaire) crée des micro-climats. Il peut pleuvoir abondamment à <strong>Saint-Claude</strong> ou <strong>Capesterre-Belle-Eau</strong> tout en faisant grand soleil à <strong>Saint-François</strong> ou <strong>Sainte-Anne</strong>.
            </p>
            <p className="text-sm leading-relaxed">
              Utilisez notre carte interactive pour obtenir les prévisions précises localisées pour votre zone géographique.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
