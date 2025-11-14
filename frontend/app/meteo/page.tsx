'use client';

import { useState, useEffect, useMemo, lazy, Suspense, useRef, useCallback } from 'react';
import { HoverInfo, AirData, CommuneData } from '../components/GuadeloupeMap';
import { Thermometer, Sunrise, Sunset, AlertTriangle, Info, Cloud, CloudRain, Wind, Waves, Snowflake, Sun, Shield } from 'lucide-react';

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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
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

  // Fonction pour calculer la position optimale du tooltip
  const calculateTooltipPosition = useCallback((mouseX: number, mouseY: number) => {
    if (typeof window === 'undefined') return { left: mouseX, top: mouseY };

    // Obtenir les dimensions réelles du tooltip si disponible
    const tooltipElement = tooltipRef.current;
    let tooltipWidth = 350; // Par défaut (md et plus)
    let tooltipHeight = 600; // Estimation par défaut

    if (tooltipElement) {
      const rect = tooltipElement.getBoundingClientRect();
      tooltipWidth = rect.width || tooltipWidth;
      tooltipHeight = rect.height || tooltipHeight;
    } else {
      // Calculer la largeur du tooltip en fonction de la taille de l'écran (responsive)
      if (window.innerWidth < 640) {
        tooltipWidth = 300; // Petit écran
      } else if (window.innerWidth < 768) {
        tooltipWidth = 320; // Écran moyen
      }
    }

    const margin = 12; // Marge de sécurité par rapport aux bords
    const offset = 12; // Décalage par rapport au curseur

    let left = mouseX + offset;
    let top = mouseY + offset;

    // Vérifier si le tooltip dépasse à droite
    if (left + tooltipWidth + margin > window.innerWidth) {
      left = mouseX - tooltipWidth - offset; // Placer à gauche du curseur
    }

    // Vérifier si le tooltip dépasse toujours (cas extrême gauche)
    if (left < margin) {
      left = margin;
    }

    // Vérifier si le tooltip dépasse en bas
    if (top + tooltipHeight + margin > window.innerHeight) {
      top = mouseY - tooltipHeight - offset; // Placer au-dessus du curseur
    }

    // Vérifier si le tooltip dépasse toujours (cas extrême haut)
    if (top < margin) {
      top = margin;
    }

    // S'assurer que le tooltip ne dépasse pas à droite même après ajustement
    if (left + tooltipWidth > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - tooltipWidth - margin);
    }

    // S'assurer que le tooltip ne dépasse pas en bas même après ajustement
    if (top + tooltipHeight > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - tooltipHeight - margin);
    }

    return { left, top };
  }, []);

  // Effet pour mettre à jour la position du tooltip quand il change
  useEffect(() => {
    if (tooltip) {
      // Position initiale basée sur les coordonnées de la souris
      const initialPosition = calculateTooltipPosition(tooltip.x, tooltip.y);
      setTooltipPosition(initialPosition);

      // Puis recalculer avec les dimensions réelles une fois le DOM rendu
      requestAnimationFrame(() => {
        if (tooltipRef.current) {
          const position = calculateTooltipPosition(tooltip.x, tooltip.y);
          setTooltipPosition(position);
        }
      });
    }
  }, [tooltip, calculateTooltipPosition]);

  // Effet pour recalculer la position après le rendu initial avec les dimensions réelles
  useEffect(() => {
    if (tooltip && tooltipRef.current) {
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est complètement rendu
      const rafId = requestAnimationFrame(() => {
        // Petit délai supplémentaire pour obtenir les dimensions finales
        setTimeout(() => {
          const position = calculateTooltipPosition(tooltip.x, tooltip.y);
          setTooltipPosition(position);
        }, 10);
      });
      return () => {
        cancelAnimationFrame(rafId);
      };
    }
  }, [tooltip, calculateTooltipPosition]);

  // Effet pour recalculer la position lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (tooltip) {
        const position = calculateTooltipPosition(tooltip.x, tooltip.y);
        setTooltipPosition(position);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tooltip, calculateTooltipPosition]);

  // Logique d'infobulle personnalisée pour la météo
  const handleCommuneHover = (info: HoverInfo) => {
    const code_zone = info.data.code_zone;
    if (!code_zone) return;

    // Toujours utiliser le nom depuis ALL_COMMUNES pour garantir le bon format
    const communeName = ALL_COMMUNES[code_zone] || info.data.lib_zone || code_zone;
    const communeWeather = weatherData[code_zone];

    if (communeWeather) {
      // Si on a des données météo, les afficher avec le nom correct
      setTooltip({
        x: info.x,
        y: info.y,
        data: {
          ...communeWeather,
          lib_zone: communeName, // Utiliser le nom formaté depuis ALL_COMMUNES
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
          lib_zone: communeName, // Utiliser le nom formaté depuis ALL_COMMUNES
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

  // Calculer les informations communes de l'archipel
  const archipelInfo = useMemo(() => {
    const temperatures: number[] = [];
    let sunrise: string | null = null;
    let sunset: string | null = null;

    // Parcourir toutes les données météo pour calculer la moyenne et extraire lever/coucher
    Object.values(weatherData).forEach((weather) => {
      if (weather.temperature !== null && typeof weather.temperature === 'number') {
        temperatures.push(weather.temperature);
      }
      // Prendre les premières valeurs de lever/coucher trouvées (elles sont similaires pour toute la Guadeloupe)
      if (!sunrise && weather.sunrise) {
        sunrise = weather.sunrise;
      }
      if (!sunset && weather.sunset) {
        sunset = weather.sunset;
      }
    });

    const avgTemperature = temperatures.length > 0
      ? Math.round((temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length) * 10) / 10
      : null;

    return {
      avgTemperature,
      sunrise,
      sunset,
      communeCount: temperatures.length,
    };
  }, [weatherData]);

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

          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          {/* Carte */}
          <div className="flex-1 w-full bg-white shadow-xl rounded-xl overflow-hidden border-2 border-gray-200 flex flex-col relative" style={{ height: '700px' }}>
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex-shrink-0">
              <p className="text-sm text-gray-700 font-medium">
                🌤️ <span className="font-semibold">Les couleurs indiquent le niveau de vigilance météo par commune</span> - Survolez une commune pour voir les détails météorologiques
              </p>
            </div>
            <div className="w-full flex justify-center items-center p-6 bg-white flex-1 min-h-0">
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
            </div>
            {loading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 mb-4"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                </div>
                <p className="text-sm font-medium text-gray-700 animate-pulse">Mise à jour des données...</p>
              </div>
            )}
          </div>

          {/* Carte latérale unique - Informations Archipel et Vigilance */}
          <div className="w-full lg:w-80 flex flex-col gap-6 lg:sticky lg:top-6">
            <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-200/50">
              {/* En-tête */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Info className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
                    Informations Météo
                  </h2>
                </div>
                <p className="text-xs text-gray-500 font-medium ml-9">Archipel et Vigilance Météo France</p>
                <div className="h-0.5 w-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-2 ml-9"></div>
              </div>

              {/* Section Informations Archipel */}
              <div className="mb-6 pb-6 border-b-2 border-gray-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-bold text-gray-800">Informations Archipel</h3>
                </div>

                {/* Température moyenne */}
                {archipelInfo.avgTemperature !== null ? (
                  <div className="mb-4 rounded-xl border-2 p-4 transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                        <Thermometer className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Température moyenne</p>
                        <p className="text-xl font-bold text-gray-900 mt-0.5">
                          {archipelInfo.avgTemperature}°C
                        </p>

                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 rounded-xl border-2 p-4 border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Thermometer className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Température moyenne</p>
                        <p className="text-xs text-gray-500 mt-1">Données en cours de chargement...</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lever/Coucher du soleil */}
                {(archipelInfo.sunrise || archipelInfo.sunset) ? (
                  <div className="rounded-xl border-2 p-4 transition-all duration-300 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                    <div className="grid grid-cols-2 gap-3">
                      {archipelInfo.sunrise && (
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/60 backdrop-blur-sm">
                          <Sunrise className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="text-xs text-gray-600 font-medium">Lever</p>
                            <p className="text-sm font-bold text-gray-900">{archipelInfo.sunrise}</p>
                          </div>
                        </div>
                      )}
                      {archipelInfo.sunset && (
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/60 backdrop-blur-sm">
                          <Sunset className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-xs text-gray-600 font-medium">Coucher</p>
                            <p className="text-sm font-bold text-gray-900">{archipelInfo.sunset}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border-2 p-4 border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Sun className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Lever & Coucher</p>
                        <p className="text-xs text-gray-500 mt-1">Données en cours de chargement...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section Vigilance Météo France */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-800">Vigilance Météo France</h3>
                </div>

                {/* Carte principale de vigilance */}
                <div
                  className="mb-4 rounded-xl border-2 p-4 transition-all duration-300"
                  style={{
                    borderColor: `${currentVigilanceInfo.color}80`,
                    backgroundColor: currentVigilanceInfo.highlight,
                    boxShadow: `0 4px 12px ${currentVigilanceInfo.color}20`,
                  }}
                >
                  {/* Niveau de vigilance actuel */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: currentVigilanceInfo.color }}
                    >
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900">
                        {currentVigilanceInfo.label}
                      </p>
                      <p className="text-xs text-gray-700 mt-0.5">{currentVigilanceInfo.description}</p>
                    </div>
                  </div>

                  {/* Conseils */}
                  <p className="text-xs text-gray-800 leading-relaxed mb-3 font-medium">
                    {currentVigilanceInfo.advice}
                  </p>

                  {/* Phénomènes actifs (si présents) */}
                  {sortedRisks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300/50">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                        Phénomènes à surveiller
                      </p>
                      <div className="space-y-2">
                        {sortedRisks.map((risk, index) => {
                          const levelInfo = getVigilanceLevelInfo(risk.level);
                          const phenomenon = getPhenomenonInfo(risk.type);
                          // Mapper les types de phénomènes aux icônes Lucide
                          const getPhenomenonIcon = (type: string) => {
                            const typeLower = type.toLowerCase();
                            if (typeLower.includes('vent')) return <Wind className="h-4 w-4" />;
                            if (typeLower.includes('pluie') || typeLower.includes('inondation')) return <CloudRain className="h-4 w-4" />;
                            if (typeLower.includes('vagues') || typeLower.includes('submersion') || typeLower.includes('mer')) return <Waves className="h-4 w-4" />;
                            if (typeLower.includes('neige') || typeLower.includes('verglas')) return <Snowflake className="h-4 w-4" />;
                            if (typeLower.includes('orages')) return <Cloud className="h-4 w-4" />;
                            return <AlertTriangle className="h-4 w-4" />;
                          };
                          return (
                            <div
                              key={`${risk.type}-${index}`}
                              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60"
                            >
                              <div className="mt-0.5 text-gray-600">
                                {getPhenomenonIcon(risk.type)}
                              </div>
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
                    <div className="mt-3 pt-3 border-t border-gray-300/50">
                      <p className="text-xs text-gray-600 text-center italic">
                        Aucun phénomène dangereux signalé
                      </p>
                    </div>
                  )}

                  {/* Date de mise à jour */}
                  {relativeLastUpdate && (
                    <div className="mt-3 pt-3 border-t border-gray-300/50">
                      <p className="text-xs text-gray-600 text-center">
                        Mis à jour {relativeLastUpdate}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations techniques et sources */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200/50 space-y-3">
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
                    <span className="text-orange-600 font-semibold">Source Archipel:</span> OpenWeatherMap
                    <span className="mx-1">•</span>
                    <span className="text-cyan-600 font-semibold">Source Vigilance:</span> Météo France
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section détaillée des niveaux de vigilance sous la carte */}
        <div className="w-full mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Niveaux de Vigilance - Détails</h2>
          <p className="text-sm text-gray-600 mb-6">Informations détaillées sur chaque niveau de vigilance météorologique</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[VIGILANCE_LEVEL_DETAILS[1], VIGILANCE_LEVEL_DETAILS[2], VIGILANCE_LEVEL_DETAILS[3], VIGILANCE_LEVEL_DETAILS[4]].map((level) => {
              const isActive = mounted && currentVigilanceInfo.level === level.level;
              return (
                <div
                  key={level.level}
                  className="border rounded-lg p-4 hover:shadow-md transition-all"
                  style={{
                    borderColor: isActive ? level.color : level.color + '40',
                    boxShadow: isActive ? `0 4px 12px ${level.color}30` : undefined,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {/* Indicateur de couleur */}
                    <div
                      className="w-12 h-12 rounded-lg border-2 flex-shrink-0"
                      style={{
                        backgroundColor: level.color,
                        borderColor: level.color + '80'
                      }}
                    ></div>
                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-bold text-base"
                          style={{ color: level.color === '#FFFF00' ? '#B8860B' : level.color }}
                        >
                          {level.label}
                        </span>
                        {isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-bold">
                            Actuel
                          </span>
                        )}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        Niveau {level.level}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {level.description}
                  </p>

                  {/* Conseils */}
                  {level.advice && (
                    <div className="bg-blue-50 rounded-lg p-2.5 mt-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        💡 Conseils
                      </p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        {level.advice}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section sur les phénomènes météorologiques */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Phénomènes Météorologiques Surveillés</h3>
            <p className="text-sm text-gray-600 mb-4">Types de phénomènes pouvant déclencher une vigilance</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(PHENOMENON_DETAILS).map(([type, info]) => (
                <div
                  key={type}
                  className="border rounded-lg p-4 hover:shadow-md transition-all border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-base text-gray-800">
                        {type}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {info.description}
                  </p>

                  {/* Conseils */}
                  {info.advice && (
                    <div className="bg-cyan-50 rounded-lg p-2.5 mt-3">
                      <p className="text-xs font-semibold text-cyan-900 mb-1">
                        💡 Recommandations
                      </p>
                      <p className="text-xs text-cyan-800 leading-relaxed">
                        {info.advice}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Infobulle (Tooltip) - Détails météo par commune */}
        {tooltip && (() => {
          const weatherInfo = tooltip.data as unknown as WeatherData;
          // Vérifier si on a des données météo valides (température non null et dans une plage raisonnable pour la Guadeloupe)
          const hasWeatherData = weatherInfo &&
            typeof weatherInfo.temperature === 'number' &&
            weatherInfo.temperature !== null &&
            !isNaN(weatherInfo.temperature) &&
            weatherInfo.temperature > -50 &&
            weatherInfo.temperature < 60;

          // Déterminer le gradient de fond basé sur la température ou la vigilance
          const getGradientColors = () => {
            if (hasWeatherData && weatherInfo.temperature !== null) {
              if (weatherInfo.temperature <= 20) return 'from-blue-500 to-indigo-600';
              if (weatherInfo.temperature <= 24) return 'from-cyan-500 to-blue-500';
              if (weatherInfo.temperature <= 28) return 'from-sky-500 to-indigo-500';
              if (weatherInfo.temperature <= 32) return 'from-orange-500 to-red-500';
              return 'from-red-500 to-orange-600';
            }
            return 'from-sky-500 to-indigo-500';
          };

          // S'assurer que le nom de la commune est correctement formaté
          const communeName = weatherInfo.lib_zone || ALL_COMMUNES[weatherInfo.code_zone] || weatherInfo.code_zone || 'Commune';

          return (
            <div className="group relative w-[300px] sm:w-[320px] md:w-[350px]">
              <div
                ref={tooltipRef}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${getGradientColors()} shadow-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sky-500/30 pointer-events-auto z-50 border border-white/20 tooltip-scrollbar`}
                style={{
                  left: `${tooltipPosition.left}px`,
                  top: `${tooltipPosition.top}px`,
                  position: 'fixed',
                  minHeight: '600px',
                  maxHeight: 'calc(100vh - 24px)',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.3) transparent',
                }}
              >
                {/* Pattern de fond SVG */}
                <div
                  className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%221%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M20%2016.2A4.5%204.5%200%200017.5%208h-1.8A7%207%200%104%2014.9%22%2F%3E%3Cpath%20d%3D%22M12%2012v9%22%2F%3E%3Cpath%20d%3D%22M8%2017l4%204%22%2F%3E%3Cpath%20d%3D%22M16%2017l-4%204%22%2F%3E%3C%2Fsvg%3E')] bg-center opacity-5"
                ></div>

                <div className="relative p-6">
                  {/* En-tête avec nom de commune et heure */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-lg font-semibold text-white truncate" title={communeName}>
                        {communeName}
                      </h3>
                      <p className="text-sm text-white/80">Guadeloupe, France</p>
                    </div>
                    <span className="text-sm text-white/80 flex-shrink-0">
                      {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {hasWeatherData ? (
                    <>
                      {/* Température principale avec icône */}
                      <div className="mt-8 flex items-center justify-between mb-8">
                        <div className="flex items-start">
                          <span className="text-6xl font-bold text-white">{weatherInfo.temperature}°</span>
                          <span className="mt-1 text-2xl text-white/80">C</span>
                        </div>
                        <div className="relative">
                          <div className="absolute -inset-4 rounded-full bg-white/20 blur-xl transition-opacity duration-300 group-hover:opacity-75"></div>
                          <span className="relative text-6xl drop-shadow-md">
                            {weatherInfo.weather_main && weatherInfo.weather_icon
                              ? getWeatherEmoji(weatherInfo.weather_main, weatherInfo.weather_icon)
                              : '🌤️'}
                          </span>
                        </div>
                      </div>

                      {/* Description météo */}
                      <div className="mb-6 text-center">
                        <p className="text-sm font-medium text-white/90 capitalize">
                          {weatherInfo.weather_description || 'Conditions météorologiques'}
                        </p>
                      </div>

                      {/* Grille de 3 colonnes pour les principales infos */}
                      <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm mb-6">
                        {/* Humidité */}
                        <div className="flex flex-col items-center gap-1">
                          <svg
                            className="h-6 w-6 text-white/80"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
                          </svg>
                          <span className="text-sm font-medium text-white">Humidité</span>
                          <span className="text-lg font-semibold text-white">
                            {weatherInfo.humidity != null && weatherInfo.humidity !== undefined
                              ? `${weatherInfo.humidity}%`
                              : <span className="text-white/60">—</span>}
                          </span>
                        </div>

                        {/* Vent */}
                        <div className="flex flex-col items-center gap-1">
                          <svg
                            className="h-6 w-6 text-white/80"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12.8 19.6A2 2 0 1 0 14 16H2"/>
                            <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/>
                            <path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>
                          </svg>
                          <span className="text-sm font-medium text-white">Vent</span>
                          <span className="text-lg font-semibold text-white">
                            {weatherInfo.wind_speed != null && weatherInfo.wind_speed !== undefined
                              ? `${Math.round(weatherInfo.wind_speed)} km/h`
                              : <span className="text-white/60">—</span>}
                          </span>
                        </div>

                        {/* Indice UV ou Nébulosité */}
                        {weatherInfo.uv_index !== null && weatherInfo.uv_index !== undefined ? (
                          <div className="flex flex-col items-center gap-1">
                            <svg
                              className="h-6 w-6 text-white/80"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                              ></path>
                            </svg>
                            <span className="text-sm font-medium text-white">UV Index</span>
                            <span className="text-lg font-semibold text-white">{weatherInfo.uv_index}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <svg
                              className="h-6 w-6 text-white/80"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
                              ></path>
                            </svg>
                            <span className="text-sm font-medium text-white">Nuages</span>
                            <span className="text-lg font-semibold text-white">
                              {weatherInfo.clouds != null && weatherInfo.clouds !== undefined
                                ? `${weatherInfo.clouds}%`
                                : <span className="text-white/60">—</span>}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Informations supplémentaires - Toujours affichées pour maintenir une taille uniforme */}
                      <div className="space-y-3">
                        {/* Rafales de vent - Toujours affichée */}
                        <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                          <span className="text-sm font-medium text-white">Rafales</span>
                          <span className="text-sm font-semibold text-white">
                            {weatherInfo.wind_gust != null && weatherInfo.wind_gust !== undefined && weatherInfo.wind_gust > 0
                              ? `${Math.round(weatherInfo.wind_gust)} km/h`
                              : <span className="text-white/60">—</span>}
                          </span>
                        </div>

                        {/* Précipitations - Toujours affichée */}
                        <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                          <span className="text-sm font-medium text-white">Précipitations</span>
                          <span className="text-sm font-semibold text-white">
                            {weatherInfo.rain_1h != null && weatherInfo.rain_1h !== undefined && weatherInfo.rain_1h > 0
                              ? `${weatherInfo.rain_1h.toFixed(1)} mm (1h)`
                              : weatherInfo.rain_3h != null && weatherInfo.rain_3h !== undefined && weatherInfo.rain_3h > 0
                              ? `${weatherInfo.rain_3h.toFixed(1)} mm (3h)`
                              : <span className="text-white/60">—</span>}
                          </span>
                        </div>

                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4 opacity-50">🌤️</div>
                      <div className="text-base font-bold text-white mb-2">Données météo non disponibles</div>
                      <div className="text-sm text-white/80 font-medium">
                        Les données OpenWeatherMap pour cette commune sont en cours de chargement.
                      </div>
                    </div>
                  )}

                  {/* Footer avec sources */}
                  <div className="mt-8 pt-4 border-t border-white/20">
                    <div className="text-center">
                      <p className="text-xs text-white/70">
                        {hasWeatherData && (
                          <>
                            <span className="font-semibold text-white/90">Météo:</span> OpenWeatherMap
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
