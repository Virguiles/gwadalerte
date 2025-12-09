import { useState, useEffect, useRef } from 'react';
import { WeatherDataMap, VigilanceData } from '../types';

const WEATHER_CACHE_KEY = 'gwada_weather_cache_v4'; // v4 pour cache ultra-optimisé
const VIGILANCE_CACHE_KEY = 'gwada_vigilance_cache_v3'; // v3 pour synchronisation
const WEATHER_CACHE_TIMESTAMP_KEY = 'gwada_meteo_cache_timestamp_v4';
const VIGILANCE_CACHE_TIMESTAMP_KEY = 'gwada_vigilance_cache_timestamp_v3';
const WEATHER_CACHE_VALIDITY_MS = 45 * 60 * 1000; // 45 minutes (synchronisé avec le cache backend optimisé)
const VIGILANCE_CACHE_VALIDITY_MS = 10 * 60 * 1000; // 10 minutes (vigilance Météo-France optimisé)
const VIGILANCE_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (vigilance Météo-France, réduit pour éviter surcharge)

export function useMeteoData() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour charger depuis le cache
  const loadFromCache = (): { weatherData: WeatherDataMap; vigilanceData: VigilanceData; weatherTimestamp: number; vigilanceTimestamp: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cachedWeather = localStorage.getItem(WEATHER_CACHE_KEY);
      const cachedVigilance = localStorage.getItem(VIGILANCE_CACHE_KEY);
      const cachedWeatherTimestamp = localStorage.getItem(WEATHER_CACHE_TIMESTAMP_KEY);
      const cachedVigilanceTimestamp = localStorage.getItem(VIGILANCE_CACHE_TIMESTAMP_KEY);

      if (cachedWeather && cachedVigilance && cachedWeatherTimestamp && cachedVigilanceTimestamp) {
        return {
          weatherData: JSON.parse(cachedWeather),
          vigilanceData: JSON.parse(cachedVigilance),
          weatherTimestamp: parseInt(cachedWeatherTimestamp, 10),
          vigilanceTimestamp: parseInt(cachedVigilanceTimestamp, 10),
        };
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du cache:', error);
    }
    return null;
  };

  // Initialiser avec les données du cache si disponibles
  const cached = typeof window !== 'undefined' ? loadFromCache() : null;
  const [weatherData, setWeatherData] = useState<WeatherDataMap>(cached?.weatherData || {});

  const [vigilanceData, setVigilanceData] = useState<VigilanceData | null>(cached?.vigilanceData || null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWeatherCacheValid = (timestamp: number): boolean => {
    const now = Date.now();
    return (now - timestamp) < WEATHER_CACHE_VALIDITY_MS;
  };

  const isVigilanceCacheValid = (timestamp: number): boolean => {
    const now = Date.now();
    return (now - timestamp) < VIGILANCE_CACHE_VALIDITY_MS;
  };

  const saveWeatherToCache = (weather: WeatherDataMap) => {
    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(weather));
      localStorage.setItem(WEATHER_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache météo:', error);
    }
  };

  const saveVigilanceToCache = (vigilance: VigilanceData) => {
    try {
      localStorage.setItem(VIGILANCE_CACHE_KEY, JSON.stringify(vigilance));
      localStorage.setItem(VIGILANCE_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache vigilance:', error);
    }
  };

  const saveToCache = (weather: WeatherDataMap, vigilance: VigilanceData) => {
    saveWeatherToCache(weather);
    saveVigilanceToCache(vigilance);
  };

  // Fonction pour rafraîchir uniquement la vigilance
  const fetchVigilanceOnly = async (forceRefresh = false) => {
    if (typeof window === 'undefined') return;

    const shouldFetchVigilance = (): boolean => {
      if (forceRefresh) return true;

      try {
        const cachedVigilance = localStorage.getItem(VIGILANCE_CACHE_KEY);
        const cachedVigilanceTimestamp = localStorage.getItem(VIGILANCE_CACHE_TIMESTAMP_KEY);

        if (!cachedVigilance || !cachedVigilanceTimestamp) {
          console.log('[Vigilance Cache] Pas de cache trouvé, chargement...');
          return true;
        }

        try {
          const parsedVigilance = JSON.parse(cachedVigilance);
          if (!parsedVigilance || !parsedVigilance.department) {
            console.log('[Vigilance Cache] Données vigilance vides, chargement...');
            return true;
          }
        } catch (parseError) {
          console.error('[Vigilance Cache] Erreur lors du parsing:', parseError);
          return true;
        }

        const timestamp = parseInt(cachedVigilanceTimestamp, 10);
        const needsRefresh = !isVigilanceCacheValid(timestamp);
        if (needsRefresh) {
          console.log('[Vigilance Cache] Cache expiré, rafraîchissement...');
        }
        return needsRefresh;
      } catch (error) {
        console.error('Erreur lors de la vérification du cache vigilance:', error);
        return true;
      }
    };

    if (shouldFetchVigilance()) {
      try {
        const vigilanceResponse = await fetch('/api/vigilance');
        const newVigilanceData = await vigilanceResponse.json();

        if (newVigilanceData && newVigilanceData.department) {
          // Si l'API retourne une erreur, ne pas mettre à jour le cache avec des données par défaut
          if (newVigilanceData.error) {
            console.warn('[Vigilance] Erreur API détectée:', newVigilanceData.error);
            console.warn('[Vigilance] Les données par défaut ne seront pas mises en cache');
            // Ne pas sauvegarder les données par défaut en cache pour éviter de masquer le problème
            // On garde les anciennes données si disponibles
            if (!vigilanceData) {
              // Si on n'a pas de données du tout, on utilise quand même les données par défaut pour l'affichage
              setVigilanceData(newVigilanceData);
            }
          } else {
            // Vérifier si le niveau de vigilance a changé
            const previousLevel = vigilanceData?.level;
            const newLevel = newVigilanceData.level;

            setVigilanceData(newVigilanceData);
            saveVigilanceToCache(newVigilanceData);
            console.log('[Vigilance] Données mises à jour:', newVigilanceData.label, `(Niveau: ${newLevel})`);

            if (previousLevel !== undefined && previousLevel !== newLevel) {
              console.log(`[Vigilance] Niveau changé: ${previousLevel} → ${newLevel}`);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la vigilance:', error);
        const cached = loadFromCache();
        if (cached && cached.vigilanceData) {
          console.log('[Vigilance Fallback] Utilisation du cache en cas d\'erreur API');
          setVigilanceData(cached.vigilanceData);
        }
      }
    }
  };

  const fetchData = async (forceRefresh = false, fetchVigilance = true) => {
    if (typeof window === 'undefined') return;

    const shouldFetchWeather = (): boolean => {
      if (forceRefresh) return true;

      try {
        const cachedWeather = localStorage.getItem(WEATHER_CACHE_KEY);
        const cachedWeatherTimestamp = localStorage.getItem(WEATHER_CACHE_TIMESTAMP_KEY);

        if (!cachedWeather || !cachedWeatherTimestamp) {
          console.log('[Weather Cache] Pas de cache trouvé, chargement...');
          return true;
        }

        try {
          const parsedWeather = JSON.parse(cachedWeather);
          if (!parsedWeather || Object.keys(parsedWeather).length === 0) {
            console.log('[Weather Cache] Données météo vides, chargement...');
            return true;
          }
        } catch (parseError) {
          console.error('[Weather Cache] Erreur lors du parsing:', parseError);
          return true;
        }

        const timestamp = parseInt(cachedWeatherTimestamp, 10);
        const needsRefresh = !isWeatherCacheValid(timestamp);
        if (needsRefresh) {
          console.log('[Weather Cache] Cache expiré, rafraîchissement...');
        }
        return needsRefresh;
      } catch (error) {
        console.error('Erreur lors de la vérification du cache météo:', error);
        return true;
      }
    };

    const shouldFetchVigilanceData = (): boolean => {
      if (!fetchVigilance) return false;
      if (forceRefresh) return true;

      try {
        const cachedVigilance = localStorage.getItem(VIGILANCE_CACHE_KEY);
        const cachedVigilanceTimestamp = localStorage.getItem(VIGILANCE_CACHE_TIMESTAMP_KEY);

        if (!cachedVigilance || !cachedVigilanceTimestamp) {
          return true;
        }

        try {
          const parsedVigilance = JSON.parse(cachedVigilance);
          if (!parsedVigilance || !parsedVigilance.department) {
            return true;
          }
        } catch {
          return true;
        }

        const timestamp = parseInt(cachedVigilanceTimestamp, 10);
        return !isVigilanceCacheValid(timestamp);
      } catch {
        return true;
      }
    };

    const needsWeather = shouldFetchWeather();
    const needsVigilance = shouldFetchVigilanceData();

    if (needsWeather || needsVigilance) {
      setLoading(true);
      try {
        // Utiliser les API Routes Next.js locales
        // /api/meteo/current utilise Open-Meteo (gratuit, sans clé API)
        // /api/vigilance utilise Météo-France (vigilance officielle)
        const promises: Promise<any>[] = [];

        if (needsWeather) {
          promises.push(fetch('/api/meteo/current').then(r => r.json()));
        } else {
          promises.push(Promise.resolve(null));
        }

        if (needsVigilance) {
          promises.push(fetch('/api/vigilance').then(r => r.json()));
        } else {
          promises.push(Promise.resolve(null));
        }

        const [newWeatherData, newVigilanceData] = await Promise.all(promises);

        if (needsWeather && newWeatherData && Object.keys(newWeatherData).length > 0) {
          setWeatherData(newWeatherData);
          saveWeatherToCache(newWeatherData);
          console.log(`[Weather] ${Object.keys(newWeatherData).length} communes chargées`);
        }

        if (needsVigilance && newVigilanceData && newVigilanceData.department) {
          // Si l'API retourne une erreur, ne pas mettre à jour le cache avec des données par défaut
          if (newVigilanceData.error) {
            console.warn('[Vigilance] Erreur API détectée:', newVigilanceData.error);
            console.warn('[Vigilance] Les données par défaut ne seront pas mises en cache');
            // Ne pas sauvegarder les données par défaut en cache pour éviter de masquer le problème
            // On garde les anciennes données si disponibles
            if (!vigilanceData) {
              // Si on n'a pas de données du tout, on utilise quand même les données par défaut pour l'affichage
              setVigilanceData(newVigilanceData);
            }
          } else {
            // Vérifier si le niveau de vigilance a changé
            const previousLevel = vigilanceData?.level;
            const newLevel = newVigilanceData.level;

            setVigilanceData(newVigilanceData);
            saveVigilanceToCache(newVigilanceData);
            console.log('[Vigilance] Données chargées:', newVigilanceData.label, `(Niveau: ${newLevel})`);

            if (previousLevel !== undefined && previousLevel !== newLevel) {
              console.log(`[Vigilance] Niveau changé: ${previousLevel} → ${newLevel}`);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        const cached = loadFromCache();
        if (cached) {
          console.log('[Fallback] Utilisation du cache en cas d\'erreur API');
          if (cached.weatherData && Object.keys(cached.weatherData).length > 0) {
            setWeatherData(cached.weatherData);
          }
          if (cached.vigilanceData) {
            setVigilanceData(cached.vigilanceData);
          }
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Force reload if data is empty in state but cache is valid
      const cached = loadFromCache();
      if (cached) {
        // Check if state is empty
        if (Object.keys(weatherData).length === 0 && cached.weatherData && Object.keys(cached.weatherData).length > 0) {
          setWeatherData(cached.weatherData);
        }
        if (!vigilanceData && cached.vigilanceData) {
          setVigilanceData(cached.vigilanceData);
        }
      }
    }
  };

  // Chargement initial et rafraîchissement périodique
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Vérifier si le cache est valide avant de charger
    const cached = loadFromCache();
    const now = Date.now();

    const weatherValid = cached?.weatherTimestamp && isWeatherCacheValid(cached.weatherTimestamp);
    const vigilanceValid = cached?.vigilanceTimestamp && isVigilanceCacheValid(cached.vigilanceTimestamp);

    // Chargement initial seulement si nécessaire
    if (!weatherValid || !vigilanceValid) {
      console.log('[Init] Chargement des données manquantes...');
      fetchData();
    } else {
      console.log('[Init] Cache valide, pas de chargement initial');
    }

    // Rafraîchissement périodique de la vigilance (toutes les 10 minutes)
    // On rafraîchit uniquement la vigilance pour éviter de surcharger l'API météo
    intervalRef.current = setInterval(() => {
      console.log('[Vigilance] Rafraîchissement périodique...');
      fetchVigilanceOnly(false); // Utiliser la logique de cache normale, pas de force
    }, VIGILANCE_REFRESH_INTERVAL_MS);

    // Nettoyage de l'intervalle au démontage
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - on veut que ça s'exécute une seule fois au montage

  return {
    weatherData,
    vigilanceData,
    loading,
    mounted,
  };
}
