'use client';

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { HoverInfo, AirData, CommuneData } from '../components/GuadeloupeMap';

// Lazy loading du composant GuadeloupeMap pour améliorer le temps de chargement initial
const GuadeloupeMap = lazy(() => import('../components/GuadeloupeMap').then(module => ({ default: module.default })));

// Type pour les données météo enrichies
type WeatherData = {
  lib_zone: string;
  code_zone: string;
  temperature: number | null;
  feels_like: number | null;
  temp_min: number | null;
  temp_max: number | null;
  humidity: number | null;
  pressure: number | null;
  wind_speed: number | null;
  wind_deg: number | null;
  wind_gust?: number | null;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  clouds: number | null;
  visibility?: number | null;
  dew_point?: number | null;
  sunrise?: string | null;
  sunset?: string | null;
  timezone?: number | null;
  rain_1h?: number;
  rain_3h?: number;
  uv_index?: number | null;
};

type WeatherDataMap = {
  [code_zone: string]: WeatherData;
};

// Type pour les données de vigilance
type VigilanceData = {
  department: string;
  department_name: string;
  level: number;
  color: string;
  label: string;
  risks: Array<{ type: string; level: number }>;
  last_update: number;
};

type VigilanceLevelInfo = {
  level: number;
  label: string;
  color: string;
  description: string;
  advice: string;
  icon: string;
  highlight: string;
};

const VIGILANCE_LEVEL_DETAILS: Record<number, VigilanceLevelInfo> = {
  [-1]: {
    level: -1,
    label: 'Indisponible',
    color: '#CCCCCC',
    description: 'Information momentanément indisponible',
    advice: 'Les détails de vigilance ne sont pas fournis. Consultez les bulletins officiels pour confirmation.',
    icon: '⚪️',
    highlight: 'rgba(204, 204, 204, 0.25)',
  },
  0: {
    level: 0,
    label: 'Vert',
    color: '#28d761',
    description: 'Pas de vigilance particulière',
    advice: 'Restez informé des bulletins réguliers et poursuivez vos activités normalement.',
    icon: '🟢',
    highlight: 'rgba(40, 215, 97, 0.15)',
  },
  1: {
    level: 1,
    label: 'Vert',
    color: '#28d761',
    description: 'Pas de vigilance particulière',
    advice: 'Restez informé des bulletins réguliers et poursuivez vos activités normalement.',
    icon: '🟢',
    highlight: 'rgba(40, 215, 97, 0.15)',
  },
  2: {
    level: 2,
    label: 'Jaune',
    color: '#FFFF00',
    description: 'Soyez attentifs',
    advice: 'Restez attentif aux évolutions et préparez-vous à adapter vos activités si nécessaire.',
    icon: '🟡',
    highlight: 'rgba(255, 255, 0, 0.18)',
  },
  3: {
    level: 3,
    label: 'Orange',
    color: '#FF9900',
    description: 'Soyez très vigilants',
    advice: 'Limitez vos déplacements au strict nécessaire et suivez les consignes des autorités.',
    icon: '🟠',
    highlight: 'rgba(255, 153, 0, 0.18)',
  },
  4: {
    level: 4,
    label: 'Rouge',
    color: '#FF0000',
    description: 'Vigilance absolue',
    advice: 'Restez en sécurité, tenez-vous informé en permanence et appliquez les consignes officielles.',
    icon: '🔴',
    highlight: 'rgba(255, 0, 0, 0.18)',
  },
};

const DEFAULT_VIGILANCE_INFO = VIGILANCE_LEVEL_DETAILS[1];

function getVigilanceLevelInfo(level?: number): VigilanceLevelInfo {
  if (typeof level !== 'number') {
    return DEFAULT_VIGILANCE_INFO;
  }
  return VIGILANCE_LEVEL_DETAILS[level] || DEFAULT_VIGILANCE_INFO;
}

const PHENOMENON_DETAILS: Record<
  string,
  { icon: string; description: string; advice: string }
> = {
  Vent: {
    icon: '💨',
    description: 'Rafales fortes ou vent turbulent.',
    advice: 'Sécurisez les objets sensibles au vent et limitez les activités en hauteur.',
  },
  'Pluie-inondation': {
    icon: '🌧️',
    description: 'Précipitations soutenues pouvant provoquer des ruissellements ou inondations.',
    advice: 'Éloignez-vous des zones inondables et ne vous engagez pas sur une route submergée.',
  },
  Orages: {
    icon: '⛈️',
    description: "Activité orageuse marquée avec risque d'éclairs et de rafales.",
    advice: "Abritez-vous et évitez l'utilisation d'appareils électriques durant l'orage.",
  },
  Crues: {
    icon: '🌊',
    description: 'Montée rapide des niveaux des rivières et ravines.',
    advice: "Surveillez les cours d'eau et préparez un itinéraire de repli si nécessaire.",
  },
  'Neige-verglas': {
    icon: '❄️',
    description: 'Risque de neige ou de verglas sur les routes.',
    advice: 'Anticipez des routes glissantes et équipez-vous en conséquence.',
  },
  Canicule: {
    icon: '🥵',
    description: 'Températures élevées persistantes.',
    advice: 'Hydratez-vous fréquemment et rafraîchissez-vous dans les lieux climatisés.',
  },
  'Grand froid': {
    icon: '🥶',
    description: 'Froid marqué et durable.',
    advice: 'Protégez-vous du froid et veillez aux personnes vulnérables.',
  },
  Avalanches: {
    icon: '🏔️',
    description: "Risque d'avalanches accru.",
    advice: 'Évitez les pentes raides et renseignez-vous avant toute sortie en montagne.',
  },
  'Vagues-submersion': {
    icon: '🌊',
    description: 'Vagues puissantes pouvant submerger le littoral.',
    advice: "Éloignez-vous du bord de mer et respectez les interdictions d'accès.",
  },
  'Mer-houle': {
    icon: '🌊',
    description: 'Houle importante en mer et sur le littoral.',
    advice: 'Limitez les sorties en mer et surveillez le littoral.',
  },
};

function getPhenomenonInfo(type: string) {
  return (
    PHENOMENON_DETAILS[type] || {
      icon: 'ℹ️',
      description: 'Phénomène surveillé par Météo-France.',
      advice: 'Suivez les consignes des autorités locales.',
    }
  );
}

// Fonction pour obtenir l'icône météo en emoji
function getWeatherEmoji(weatherMain: string, icon: string): string {
  const isDay = icon.includes('d');

  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return isDay ? '☀️' : '🌙';
    case 'clouds':
      return '☁️';
    case 'rain':
    case 'drizzle':
      return '🌧️';
    case 'thunderstorm':
      return '⛈️';
    case 'snow':
      return '❄️';
    case 'mist':
    case 'fog':
    case 'haze':
      return '🌫️';
    default:
      return '🌤️';
  }
}

// Fonction pour obtenir la couleur basée sur la température
function getTemperatureColor(temp: number): string {
  if (temp <= 20) return '#3B82F6'; // Bleu
  if (temp <= 24) return '#10B981'; // Vert
  if (temp <= 28) return '#F59E0B'; // Orange
  if (temp <= 32) return '#EF4444'; // Rouge
  return '#DC2626'; // Rouge foncé
}

// Fonction pour obtenir la direction du vent
function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

// Formater un écart temporel relatif en français
function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();

  if (Math.abs(diffMs) < 60 * 1000) {
    return diffMs >= 0 ? "à l'instant" : "dans moins d'une minute";
  }

  const diffMinutes = Math.round(Math.abs(diffMs) / (60 * 1000));

  if (diffMinutes < 60) {
    return diffMs >= 0 ? `il y a ${diffMinutes} min` : `dans ${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return diffMs >= 0 ? `il y a ${diffHours} h` : `dans ${diffHours} h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return diffMs >= 0 ? `il y a ${diffDays} j` : `dans ${diffDays} j`;
}

// Liste de toutes les communes de Guadeloupe avec leurs noms (synchronisé avec le backend)
const ALL_COMMUNES: { [code: string]: string } = {
  '97101': 'Les Abymes',
  '97102': 'Anse-Bertrand',
  '97103': 'Baie-Mahault',
  '97104': 'Baillif',
  '97105': 'Basse-Terre',
  '97106': 'Bouillante',
  '97107': 'Capesterre-Belle-Eau',
  '97108': 'Capesterre-de-Marie-Galante',
  '97109': 'Gourbeyre',
  '97110': 'La Désirade',
  '97111': 'Deshaies',
  '97112': 'Grand-Bourg',
  '97113': 'Le Gosier',
  '97114': 'Goyave',
  '97115': 'Lamentin',
  '97116': 'Morne-à-l\'Eau',
  '97117': 'Le Moule',
  '97118': 'Petit-Bourg',
  '97119': 'Petit-Canal',
  '97120': 'Pointe-à-Pitre',
  '97121': 'Pointe-Noire',
  '97122': 'Port-Louis',
  '97124': 'Saint-Claude',
  '97125': 'Saint-François',
  '97126': 'Saint-Louis',
  '97128': 'Sainte-Anne',
  '97129': 'Sainte-Rose',
  '97130': 'Terre-de-Bas',
  '97131': 'Terre-de-Haut',
  '97132': 'Trois-Rivières',
  '97133': 'Vieux-Fort',
  '97134': 'Vieux-Habitants',
  '97801': 'Saint-Martin',
};

export default function MeteoPage() {
  // Fonction pour charger depuis le cache
  const loadFromCache = (): { weatherData: WeatherDataMap; vigilanceData: VigilanceData; timestamp: number } | null => {
    if (typeof window === 'undefined') return null; // SSR
    try {
      const WEATHER_CACHE_KEY = 'gwada_weather_cache';
      const VIGILANCE_CACHE_KEY = 'gwada_vigilance_cache';
      const CACHE_TIMESTAMP_KEY = 'gwada_meteo_cache_timestamp';

      const cachedWeather = localStorage.getItem(WEATHER_CACHE_KEY);
      const cachedVigilance = localStorage.getItem(VIGILANCE_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedWeather && cachedVigilance && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        return {
          weatherData: JSON.parse(cachedWeather),
          vigilanceData: JSON.parse(cachedVigilance),
          timestamp,
        };
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du cache:', error);
    }
    return null;
  };

  // État pour savoir si le composant est monté côté client (pour éviter l'hydratation mismatch)
  const [mounted, setMounted] = useState(false);

  // Initialisation lazy depuis le cache
  const [weatherData, setWeatherData] = useState<WeatherDataMap>(() => {
    const cached = loadFromCache();
    return cached?.weatherData || {};
  });
  const [vigilanceData, setVigilanceData] = useState<VigilanceData | null>(() => {
    const cached = loadFromCache();
    return cached?.vigilanceData || null;
  });
  const [tooltip, setTooltip] = useState<HoverInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(() => {
    const cached = loadFromCache();
    return cached ? new Date(cached.timestamp) : null;
  });
  const currentVigilanceInfo = useMemo(
    () => getVigilanceLevelInfo(vigilanceData?.level),
    [vigilanceData?.level]
  );
  const sortedRisks = useMemo(() => {
    if (!vigilanceData?.risks || vigilanceData.risks.length === 0) {
      return [];
    }
    return [...vigilanceData.risks].sort((a, b) => b.level - a.level);
  }, [vigilanceData?.risks]);
  const hasSignificantRisk = useMemo(
    () => sortedRisks.some((risk) => risk.level >= 2),
    [sortedRisks]
  );
  const vigilanceUpdateDate = useMemo(() => {
    if (!vigilanceData?.last_update) {
      return null;
    }
    return new Date(vigilanceData.last_update * 1000);
  }, [vigilanceData?.last_update]);
  const relativeLastUpdate = useMemo(() => {
    // Ne pas calculer côté serveur pour éviter l'erreur d'hydratation
    if (!mounted || !vigilanceUpdateDate) {
      return null;
    }
    return formatRelativeTime(vigilanceUpdateDate);
  }, [mounted, vigilanceUpdateDate]);

  // Marquer le composant comme monté après l'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fonction pour vérifier si le cache est encore valide (moins de 15 minutes)
  const isCacheValid = (timestamp: number): boolean => {
    const CACHE_VALIDITY_MS = 15 * 60 * 1000; // 15 minutes en millisecondes
    const now = Date.now();
    return (now - timestamp) < CACHE_VALIDITY_MS;
  };

  // Récupérer les données météo et de vigilance (seulement si nécessaire - toutes les 15 minutes)
  useEffect(() => {
    // Ne rien faire côté serveur
    if (typeof window === 'undefined') return;

    const WEATHER_CACHE_KEY = 'gwada_weather_cache';
    const VIGILANCE_CACHE_KEY = 'gwada_vigilance_cache';
    const CACHE_TIMESTAMP_KEY = 'gwada_meteo_cache_timestamp';

    // Fonction pour sauvegarder dans le cache
    const saveToCache = (weather: WeatherDataMap, vigilance: VigilanceData) => {
      try {
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(weather));
        localStorage.setItem(VIGILANCE_CACHE_KEY, JSON.stringify(vigilance));
        const timestamp = Date.now();
        localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
        setLastUpdate(new Date(timestamp));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du cache:', error);
      }
    };

    // Vérifier si un appel API est nécessaire
    const shouldFetch = (): boolean => {
      try {
        const cachedWeather = localStorage.getItem(WEATHER_CACHE_KEY);
        const cachedVigilance = localStorage.getItem(VIGILANCE_CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

        // Si pas de cache du tout, on doit faire un appel
        if (!cachedWeather || !cachedVigilance || !cachedTimestamp) {
          console.log('[Cache] Pas de cache trouvé, chargement des données...');
          return true;
        }

        // Vérifier si les données du cache sont valides (non vides)
        try {
          const weatherData = JSON.parse(cachedWeather);
          const vigilanceData = JSON.parse(cachedVigilance);

          // Si les données sont vides ou invalides, forcer un appel
          if (!weatherData || Object.keys(weatherData).length === 0) {
            console.log('[Cache] Données météo vides, chargement...');
            return true;
          }

          if (!vigilanceData || !vigilanceData.department) {
            console.log('[Cache] Données vigilance vides, chargement...');
            return true;
          }
        } catch (parseError) {
          console.error('[Cache] Erreur lors du parsing du cache:', parseError);
          return true; // Cache corrompu, on recharge
        }

        const timestamp = parseInt(cachedTimestamp, 10);

        // Faire un appel si le cache a plus de 15 minutes
        const needsRefresh = !isCacheValid(timestamp);
        if (needsRefresh) {
          console.log('[Cache] Cache expiré, rafraîchissement...');
        }
        return needsRefresh;
      } catch (error) {
        console.error('Erreur lors de la vérification du cache:', error);
        return true; // En cas d'erreur, on fait un appel
      }
    };

    // Faire un appel API seulement si nécessaire (toutes les 15 minutes)
    if (shouldFetch()) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Récupérer les données météo et de vigilance en parallèle
          const [weatherResponse, vigilanceResponse] = await Promise.all([
            fetch('http://127.0.0.1:8000/api/weather'),
            fetch('http://127.0.0.1:8000/api/vigilance'),
          ]);

          const [weatherData, vigilanceData] = await Promise.all([
            weatherResponse.json(),
            vigilanceResponse.json(),
          ]);

          // Vérifier que les données sont valides avant de les utiliser
          if (weatherData && Object.keys(weatherData).length > 0) {
            setWeatherData(weatherData);
            console.log(`[Weather] ${Object.keys(weatherData).length} communes chargées`);
          } else {
            console.warn('[Weather] Données météo vides ou invalides');
          }

          if (vigilanceData && vigilanceData.department) {
            setVigilanceData(vigilanceData);
            console.log('[Vigilance] Données chargées:', vigilanceData.label);
          } else {
            console.warn('[Vigilance] Données vigilance vides ou invalides');
          }

          // Sauvegarder dans le cache seulement si les données sont valides
          if (weatherData && vigilanceData && Object.keys(weatherData).length > 0) {
            saveToCache(weatherData, vigilanceData);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données:', error);
          // Si l'appel API échoue, on garde les données du cache si elles existent
          // Mais on essaie de charger depuis le cache
          const cached = loadFromCache();
          if (cached && cached.weatherData && Object.keys(cached.weatherData).length > 0) {
            console.log('[Fallback] Utilisation du cache en cas d\'erreur API');
            setWeatherData(cached.weatherData);
            setVigilanceData(cached.vigilanceData);
          }
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      // Même si le cache est valide, vérifier que les données sont bien chargées
      // Si les données sont vides, forcer un chargement
      const cached = loadFromCache();
      if (cached && cached.weatherData && Object.keys(cached.weatherData).length > 0) {
        console.log('[Cache] Utilisation du cache valide');
        // Les données sont déjà chargées depuis l'initialisation du state
      } else {
        console.log('[Cache] Cache valide mais données vides, chargement forcé...');
        // Forcer un chargement même si le cache est "valide"
        const fetchData = async () => {
          setLoading(true);
          try {
            const [weatherResponse, vigilanceResponse] = await Promise.all([
              fetch('http://127.0.0.1:8000/api/weather'),
              fetch('http://127.0.0.1:8000/api/vigilance'),
            ]);

            const [weatherData, vigilanceData] = await Promise.all([
              weatherResponse.json(),
              vigilanceResponse.json(),
            ]);

            if (weatherData && Object.keys(weatherData).length > 0) {
              setWeatherData(weatherData);
              console.log(`[Weather] ${Object.keys(weatherData).length} communes chargées`);
            }

            if (vigilanceData && vigilanceData.department) {
              setVigilanceData(vigilanceData);
            }

            if (weatherData && vigilanceData && Object.keys(weatherData).length > 0) {
              saveToCache(weatherData, vigilanceData);
            }
          } catch (error) {
            console.error('Erreur lors du chargement forcé:', error);
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      }
    }
  }, []); // Se lance une seule fois après le montage

  // Logique d'infobulle personnalisée pour la météo
  const handleCommuneHover = (info: HoverInfo) => {
    const code_zone = info.data.code_zone;
    if (!code_zone) return;

    const communeWeather = weatherData[code_zone];

    if (communeWeather) {
      // Si on a des données météo, les afficher
      setTooltip({
        x: info.x,
        y: info.y,
        data: {
          ...communeWeather,
          lib_zone: communeWeather.lib_zone,
          lib_qual: currentVigilanceInfo.label,
          coul_qual: currentVigilanceInfo.color,
        } as CommuneData,
      });
    } else {
      // Sinon, afficher au moins les informations de base (commune + vigilance)
      setTooltip({
        x: info.x,
        y: info.y,
        data: {
          lib_zone: info.data.lib_zone || ALL_COMMUNES[code_zone] || code_zone,
          code_zone: code_zone,
          lib_qual: currentVigilanceInfo.label,
          coul_qual: currentVigilanceInfo.color,
        } as CommuneData,
      });
    }
  };

  // Transformer les données météo pour la carte (avec couleur de vigilance)
  const mapDataForComponent = useMemo(() => {
    const vigilanceColor = currentVigilanceInfo.color;
    const vigilanceLabel = currentVigilanceInfo.label;
    const result: AirData = {};

    // S'assurer que toutes les communes sont colorées avec la couleur de vigilance
    Object.keys(ALL_COMMUNES).forEach((code) => {
      const weather = weatherData[code];
      if (weather) {
        // Si on a des données météo, les utiliser
        result[code] = {
          ...weather,
          coul_qual: vigilanceColor,
          lib_zone: weather.lib_zone,
          lib_qual: vigilanceLabel,
        } as CommuneData;
      } else {
        // Sinon, créer une entrée minimale avec juste la couleur de vigilance
        result[code] = {
          lib_zone: ALL_COMMUNES[code] || code,
          coul_qual: vigilanceColor,
          lib_qual: vigilanceLabel,
          code_zone: code,
        } as CommuneData;
      }
    });

    return result;
  }, [weatherData, currentVigilanceInfo]);

  // Formater la date et l'heure
  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-6 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="w-full max-w-7xl">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
              Météo et Vigilance en Guadeloupe
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
          </div>
          <p className="text-base sm:text-lg text-gray-700 mb-4 font-medium">
            Conditions météorologiques actuelles par commune avec vigilance Météo France
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50">
              <span className="text-xs text-gray-600 font-medium">Sources:</span>
              <span className="text-xs text-blue-600 font-semibold">OpenWeatherMap</span>
              <span className="text-gray-400">•</span>
              <span className="text-xs text-cyan-600 font-semibold">Météo France</span>
            </div>
            <button
              onClick={() => {
                // Forcer le rechargement des données
                localStorage.removeItem('gwada_weather_cache');
                localStorage.removeItem('gwada_vigilance_cache');
                localStorage.removeItem('gwada_meteo_cache_timestamp');
                window.location.reload();
              }}
              className="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 font-medium text-sm flex items-center gap-2"
              title="Rafraîchir les données météo"
            >
              <span className="group-hover:rotate-180 transition-transform duration-500 text-base">🔄</span>
              <span>Rafraîchir</span>
            </button>
          </div>
          {Object.keys(weatherData).length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <span className="text-green-600 text-sm font-semibold">✓</span>
              <p className="text-xs text-green-700 font-medium">
                {Object.keys(weatherData).length} communes chargées
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          {/* Carte */}
          <div className="flex-1 w-full shadow-2xl rounded-2xl overflow-hidden flex items-center justify-center relative bg-white border border-gray-200/50" style={{ height: '700px' }}>
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 mb-4"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700 animate-pulse">Chargement de la carte...</p>
                </div>
              }
            >
              <GuadeloupeMap
                data={mapDataForComponent}
                onCommuneHover={handleCommuneHover}
                onCommuneLeave={() => setTooltip(null)}
              />
            </Suspense>
            {loading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 mb-4"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                </div>
                <p className="text-sm font-medium text-gray-700 animate-pulse">Mise à jour des données...</p>
              </div>
            )}
          </div>

          {/* Carte unique - Vigilance Météo France */}
          <div className="w-full lg:w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:sticky lg:top-6 border border-gray-200/50">
            {/* En-tête */}
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold mb-1.5 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Vigilance Météo France
              </h2>
              <p className="text-xs text-gray-500 font-medium">Situation actuelle en Guadeloupe</p>
              <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2"></div>
            </div>

            {/* Carte principale de vigilance */}
            <div
              className="mb-5 rounded-2xl border-2 p-5 transition-all duration-300"
              style={{
                borderColor: `${currentVigilanceInfo.color}80`,
                backgroundColor: currentVigilanceInfo.highlight,
                boxShadow: `0 4px 12px ${currentVigilanceInfo.color}20`,
              }}
            >
              {/* Niveau de vigilance actuel */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{currentVigilanceInfo.icon}</span>
                <div className="flex-1">
                  <p className="text-xl font-bold text-gray-900">
                    {currentVigilanceInfo.label}
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">{currentVigilanceInfo.description}</p>
                </div>
              </div>

              {/* Conseils */}
              <p className="text-sm text-gray-800 leading-relaxed mb-4 font-medium">
                {currentVigilanceInfo.advice}
              </p>

              {/* Phénomènes actifs (si présents) */}
              {sortedRisks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300/50">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                    Phénomènes à surveiller
                  </p>
                  <div className="space-y-2.5">
                    {sortedRisks.map((risk, index) => {
                      const levelInfo = getVigilanceLevelInfo(risk.level);
                      const phenomenon = getPhenomenonInfo(risk.type);
                      return (
                        <div
                          key={`${risk.type}-${index}`}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60"
                        >
                          <span className="text-lg">{phenomenon.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-xs font-semibold text-gray-900">{risk.type}</p>
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                                style={{
                                  color: levelInfo.color === '#FFFF00' ? '#B8860B' : levelInfo.color,
                                  backgroundColor: `${levelInfo.color}20`,
                                }}
                              >
                                {levelInfo.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600 leading-relaxed">{phenomenon.advice}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message si aucun phénomène */}
              {sortedRisks.length === 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300/50">
                  <p className="text-xs text-gray-600 text-center italic">
                    Aucun phénomène dangereux signalé
                  </p>
                </div>
              )}

              {/* Date de mise à jour */}
              {relativeLastUpdate && (
                <div className="mt-4 pt-4 border-t border-gray-300/50">
                  <p className="text-xs text-gray-600 text-center">
                    Mis à jour {relativeLastUpdate}
                  </p>
                </div>
              )}
            </div>

            {/* Échelle de vigilance (référence rapide) */}
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                Signification des niveaux
              </p>
              <div className="space-y-2">
                {[VIGILANCE_LEVEL_DETAILS[1], VIGILANCE_LEVEL_DETAILS[2], VIGILANCE_LEVEL_DETAILS[3], VIGILANCE_LEVEL_DETAILS[4]].map(
                  (level) => {
                    const isActive = mounted && currentVigilanceInfo.level === level.level;
                    return (
                      <div
                        key={level.level}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                          isActive ? 'border-2 shadow-md' : 'border border-gray-200'
                        }`}
                        style={{
                          borderColor: isActive ? level.color : undefined,
                          backgroundColor: isActive ? `${level.color}10` : 'white',
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: level.color }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs font-bold"
                              style={{ color: level.color === '#FFFF00' ? '#B8860B' : level.color }}
                            >
                              {level.label}
                            </span>
                            {isActive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500 text-white font-bold">
                                Actuel
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5">{level.description}</p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Informations techniques */}
            <div className="pt-5 border-t-2 border-gray-200/50 space-y-3">
              {vigilanceUpdateDate && (
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Bulletin Météo-France</p>
                  <p className="text-xs text-gray-700 font-medium">
                    {formatDateTime(vigilanceUpdateDate)}
                  </p>
                </div>
              )}
              <div className="text-center">
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  <span className="text-cyan-600 font-semibold">Source:</span> Météo France • Les communes sont colorées selon le niveau de vigilance départemental
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Infobulle (Tooltip) - Détails météo par commune */}
        {tooltip && (() => {
          const weatherInfo = tooltip.data as unknown as WeatherData;
          const hasWeatherData = weatherInfo && typeof weatherInfo.temperature === 'number';
          const tempColor = hasWeatherData && weatherInfo.temperature !== null ? getTemperatureColor(weatherInfo.temperature) : '#666';
          const vigilanceColor = currentVigilanceInfo.color;

          return (
            <div
              className="absolute bg-white border-2 rounded-2xl shadow-2xl pointer-events-none transition-all duration-300 z-50 min-w-[300px] max-w-[350px] backdrop-blur-sm"
              style={{
                left: tooltip.x + 20,
                top: tooltip.y + 20,
                borderColor: vigilanceColor,
                boxShadow: `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px ${vigilanceColor}30, 0 0 20px ${vigilanceColor}15`,
              }}
            >
              {/* En-tête avec couleur de vigilance */}
              <div
                className="px-5 py-4 rounded-t-2xl text-white font-extrabold text-lg flex items-center justify-between bg-gradient-to-r"
                style={{
                  background: `linear-gradient(135deg, ${vigilanceColor} 0%, ${vigilanceColor}dd 100%)`,
                }}
              >
                <span className="drop-shadow-sm">{weatherInfo.lib_zone || 'Commune'}</span>
                <span className="text-3xl drop-shadow-md animate-pulse">
                  {hasWeatherData && weatherInfo.weather_main && weatherInfo.weather_icon
                    ? getWeatherEmoji(weatherInfo.weather_main, weatherInfo.weather_icon)
                    : '🌤️'}
                </span>
              </div>

              {/* Indicateur de vigilance */}
              {vigilanceData && (
                <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50 flex items-center justify-between backdrop-blur-sm">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full shadow-md border-2 border-white"
                      style={{ backgroundColor: vigilanceColor }}
                    ></div>
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Vigilance:</span>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm" style={{
                    color: vigilanceColor === '#FFFF00' ? '#B8860B' : vigilanceColor,
                    backgroundColor: `${vigilanceColor}15`,
                  }}>
                    {vigilanceData.label}
                  </span>
                </div>
              )}

              {/* Corps du tooltip */}
              <div className="px-5 py-5 space-y-3 bg-gradient-to-b from-white to-gray-50/30">
                {hasWeatherData ? (
                  <>
                    {/* Température principale */}
                    <div className="text-center py-4 border-b-2 border-gray-200/50">
                      <div className="text-5xl font-extrabold mb-1 drop-shadow-sm" style={{ color: tempColor }}>
                        {weatherInfo.temperature}°C
                      </div>
                      <div className="text-sm font-semibold text-gray-700 mt-2 capitalize">
                        {weatherInfo.weather_description}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 font-medium">
                        Ressenti: <span className="font-bold">{weatherInfo.feels_like}°C</span>
                      </div>
                    </div>

                    {/* Informations détaillées */}
                    <div className="space-y-2.5">
                      {/* Températures min/max */}
                      <div className="flex gap-2.5">
                        <div className="flex-1 p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl text-center border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Min</div>
                          <div className="text-base font-extrabold text-blue-700">
                            {weatherInfo.temp_min}°C
                          </div>
                        </div>
                        <div className="flex-1 p-3 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl text-center border border-red-200/50 shadow-sm hover:shadow-md transition-shadow">
                          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Max</div>
                          <div className="text-base font-extrabold text-red-700">
                            {weatherInfo.temp_max}°C
                          </div>
                        </div>
                      </div>

                      {/* Vent */}
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="text-2xl drop-shadow-sm">💨</div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-0.5">Vent</div>
                          <div className="text-sm font-bold text-gray-800">
                            {weatherInfo.wind_speed} km/h {getWindDirection(weatherInfo.wind_deg || 0)}
                            {weatherInfo.wind_gust && weatherInfo.wind_gust > 0 && (
                              <span className="text-xs text-orange-600 ml-1.5 font-semibold">(rafales: {weatherInfo.wind_gust} km/h)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Humidité et Point de rosée */}
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="text-2xl drop-shadow-sm">💧</div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-0.5">Humidité</div>
                          <div className="text-sm font-bold text-gray-800">
                            {weatherInfo.humidity}%
                            {weatherInfo.dew_point && (
                              <span className="text-xs text-gray-600 ml-1.5 font-medium">(rosée: {weatherInfo.dew_point}°C)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nuages et Visibilité */}
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="text-2xl drop-shadow-sm">☁️</div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-0.5">Nébulosité</div>
                          <div className="text-sm font-bold text-gray-800">
                            {weatherInfo.clouds}%
                            {weatherInfo.visibility && (
                              <span className="text-xs text-gray-600 ml-1.5 font-medium">(visibilité: {(weatherInfo.visibility / 1000).toFixed(1)} km)</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Indice UV (si disponible) */}
                      {weatherInfo.uv_index !== null && weatherInfo.uv_index !== undefined && (
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200/50 shadow-sm hover:shadow-md transition-all">
                          <div className="text-2xl drop-shadow-sm">☀️</div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-0.5">Indice UV</div>
                            <div className="text-sm font-bold text-gray-800">
                              {weatherInfo.uv_index}
                              <span className="text-xs text-gray-600 ml-1.5 font-medium">
                                {weatherInfo.uv_index <= 2 ? '(faible)' :
                                 weatherInfo.uv_index <= 5 ? '(modéré)' :
                                 weatherInfo.uv_index <= 7 ? '(élevé)' :
                                 weatherInfo.uv_index <= 10 ? '(très élevé)' : '(extrême)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Précipitations (si > 0) */}
                      {((weatherInfo.rain_1h && weatherInfo.rain_1h > 0) || (weatherInfo.rain_3h && weatherInfo.rain_3h > 0)) && (
                        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl border border-blue-300/50 shadow-sm hover:shadow-md transition-all">
                          <div className="text-2xl drop-shadow-sm">🌧️</div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-0.5">Précipitations</div>
                            <div className="text-sm font-bold text-gray-800">
                              {weatherInfo.rain_1h && weatherInfo.rain_1h > 0
                                ? `${weatherInfo.rain_1h} mm (1h)`
                                : weatherInfo.rain_3h && weatherInfo.rain_3h > 0
                                ? `${weatherInfo.rain_3h} mm (3h)`
                                : ''}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lever/Coucher du soleil */}
                      {(weatherInfo.sunrise || weatherInfo.sunset) && (
                        <div className="flex gap-2.5 mt-2">
                          {weatherInfo.sunrise && (
                            <div className="flex-1 p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl text-center border border-orange-200/50 shadow-sm hover:shadow-md transition-shadow">
                              <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">🌅 Lever</div>
                              <div className="text-sm font-extrabold text-orange-700">
                                {weatherInfo.sunrise}
                              </div>
                            </div>
                          )}
                          {weatherInfo.sunset && (
                            <div className="flex-1 p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center border border-purple-200/50 shadow-sm hover:shadow-md transition-shadow">
                              <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">🌇 Coucher</div>
                              <div className="text-sm font-extrabold text-purple-700">
                                {weatherInfo.sunset}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3 opacity-50">🌤️</div>
                    <div className="text-base font-bold text-gray-600 mb-2">Données météo non disponibles</div>
                    <div className="text-xs text-gray-500 font-medium">
                      Les données OpenWeatherMap pour cette commune sont en cours de chargement.
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-b-2xl border-t border-gray-200/50 text-xs text-gray-600 text-center font-medium backdrop-blur-sm">
                {hasWeatherData ? (
                  <>
                    <span className="text-blue-600 font-semibold">Météo:</span> OpenWeatherMap
                    <span className="mx-2 text-gray-400">•</span>
                  </>
                ) : null}
                <span className="text-cyan-600 font-semibold">Vigilance:</span> Météo France
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
