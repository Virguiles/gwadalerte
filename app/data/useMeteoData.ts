import { useState, useEffect, useEffectEvent, useRef } from 'react';
import { useMounted } from '@/app/hooks/useClientFlag';
import { WeatherDataMap, VigilanceData } from './weather-types';

const WEATHER_CACHE_KEY = 'gwada_weather_cache_v4'; // v4 pour cache ultra-optimisé
const VIGILANCE_CACHE_KEY = 'gwada_vigilance_cache_v3'; // v3 pour synchronisation
const WEATHER_CACHE_TIMESTAMP_KEY = 'gwada_meteo_cache_timestamp_v4';
const VIGILANCE_CACHE_TIMESTAMP_KEY = 'gwada_vigilance_cache_timestamp_v3';
const WEATHER_CACHE_VALIDITY_MS = 45 * 60 * 1000; // 45 minutes (synchronisé avec le cache backend optimisé)
const VIGILANCE_CACHE_VALIDITY_MS = 10 * 60 * 1000; // 10 minutes (vigilance Météo-France optimisé)
const VIGILANCE_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (vigilance Météo-France, réduit pour éviter surcharge)

/**
 * Source de vérité pour la météo et la vigilance.
 *
 * À n'instancier QU'UNE FOIS, dans le DataProvider : ce hook porte un
 * intervalle de rafraîchissement et un cache localStorage, que plusieurs
 * instances dupliqueraient (la Navbar, la carte et les guides le consommaient
 * chacun de leur côté, provoquant autant d'appels réseau et de minuteurs).
 * Les composants passent par `useMeteoData()` (contexte).
 */
export function useMeteoDataSource() {
  const mounted = useMounted();
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

      if (cachedWeather && cachedWeather.trim() !== '' &&
          cachedVigilance && cachedVigilance.trim() !== '' &&
          cachedWeatherTimestamp && cachedVigilanceTimestamp) {
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

  /*
   * État initial toujours vide, y compris côté client : le lire depuis le
   * cache ici provoquait un mismatch d'hydratation (le serveur rend
   * toujours vide, `window` existe déjà au premier rendu client). Le cache
   * est appliqué après le montage, dans `loadInitialData`.
   */
  const [weatherData, setWeatherData] = useState<WeatherDataMap>({});
  const [vigilanceData, setVigilanceData] = useState<VigilanceData | null>(null);

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

  // Fonction pour rafraîchir uniquement la vigilance
  const fetchVigilanceOnly = async (forceRefresh = false) => {
    if (typeof window === 'undefined') return;

    const shouldFetchVigilance = (): boolean => {
      if (forceRefresh) return true;

      try {
        const cachedVigilance = localStorage.getItem(VIGILANCE_CACHE_KEY);
        const cachedVigilanceTimestamp = localStorage.getItem(VIGILANCE_CACHE_TIMESTAMP_KEY);

        if (!cachedVigilance || !cachedVigilanceTimestamp) {
          return true;
        }

        try {
          if (!cachedVigilance || cachedVigilance.trim() === '') {
            return true;
          }
          const parsedVigilance = JSON.parse(cachedVigilance);
          if (!parsedVigilance || !parsedVigilance.department) {
            return true;
          }
        } catch (parseError) {
          console.error('[Vigilance Cache] Erreur lors du parsing:', parseError);
          return true;
        }

        const timestamp = parseInt(cachedVigilanceTimestamp, 10);
        return !isVigilanceCacheValid(timestamp);
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
            setVigilanceData(newVigilanceData);
            saveVigilanceToCache(newVigilanceData);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la vigilance:', error);
        const cached = loadFromCache();
        if (cached && cached.vigilanceData) {
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
          return true;
        }

        try {
          if (!cachedWeather || cachedWeather.trim() === '') {
            return true;
          }
          const parsedWeather = JSON.parse(cachedWeather);
          if (!parsedWeather || Object.keys(parsedWeather).length === 0) {
            return true;
          }
        } catch (parseError) {
          console.error('[Weather Cache] Erreur lors du parsing:', parseError);
          return true;
        }

        const timestamp = parseInt(cachedWeatherTimestamp, 10);
        return !isWeatherCacheValid(timestamp);
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
          if (!cachedVigilance || cachedVigilance.trim() === '') {
            return true;
          }
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
        /*
         * Les deux appels ne renvoient pas la même chose : un tableau
         * `Promise<any>[]` faisait retomber les deux résultats sur `any`, donc
         * plus aucun contrôle sur les champs lus plus bas. Un tuple garde les
         * deux types distincts.
         *
         * `error` ne figure pas dans `VigilanceData` mais la route le renvoie
         * quand Météo-France échoue — c'est précisément ce que teste le code
         * ci-dessous, autant que le type le dise.
         */
        const weatherPromise: Promise<WeatherDataMap | null> = needsWeather
          ? fetch('/api/meteo/current').then((r) => r.json() as Promise<WeatherDataMap>)
          : Promise.resolve(null);
        const vigilancePromise: Promise<(VigilanceData & { error?: string }) | null> =
          needsVigilance
            ? fetch('/api/vigilance').then(
                (r) => r.json() as Promise<VigilanceData & { error?: string }>,
              )
            : Promise.resolve(null);

        const [newWeatherData, newVigilanceData] = await Promise.all([
          weatherPromise,
          vigilancePromise,
        ]);

        if (needsWeather && newWeatherData && Object.keys(newWeatherData).length > 0) {
          setWeatherData(newWeatherData);
          saveWeatherToCache(newWeatherData);
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
            setVigilanceData(newVigilanceData);
            saveVigilanceToCache(newVigilanceData);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        const cached = loadFromCache();
        if (cached) {
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
    }
  };

  /*
   * Les deux déclencheurs du montage passent par `useEffectEvent` : ils lisent
   * toujours les dernières closures (`fetchData`, `fetchVigilanceOnly`) sans
   * devenir des dépendances de l'effet, qui ne doit tourner qu'une seule fois.
   */
  const loadInitialData = useEffectEvent(() => {
    const cachedOnMount = loadFromCache();
    const cacheIsFresh =
      !!cachedOnMount &&
      isWeatherCacheValid(cachedOnMount.weatherTimestamp) &&
      isVigilanceCacheValid(cachedOnMount.vigilanceTimestamp);

    if (cacheIsFresh) {
      setWeatherData(cachedOnMount.weatherData);
      setVigilanceData(cachedOnMount.vigilanceData);
      return;
    }

    fetchData();
  });

  // On rafraîchit uniquement la vigilance pour éviter de surcharger l'API météo
  const refreshVigilance = useEffectEvent(() => {
    fetchVigilanceOnly(false); // Logique de cache normale, pas de force
  });

  // Chargement initial et rafraîchissement périodique (toutes les 10 minutes)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    /*
     * Dette assumée, la même que dans `useCachedResource` : la règle refuse
     * tout `setState` atteignable depuis un effet, y compris — comme ici —
     * après l'attente du réseau. S'en passer voudrait dire sortir le
     * chargement de React (store externe) ou le remonter côté serveur, deux
     * chantiers qui débordent de ce hook.
     */
    // eslint-disable-next-line react-hooks/set-state-in-effect -- voir ci-dessus
    loadInitialData();

    intervalRef.current = setInterval(() => {
      refreshVigilance();
    }, VIGILANCE_REFRESH_INTERVAL_MS);

    // Nettoyage de l'intervalle au démontage
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    weatherData,
    vigilanceData,
    loading,
    mounted,
  };
}

export type MeteoDataValue = ReturnType<typeof useMeteoDataSource>;
