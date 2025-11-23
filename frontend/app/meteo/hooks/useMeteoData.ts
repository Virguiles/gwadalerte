import { useState, useEffect } from 'react';
import { WeatherDataMap, VigilanceData } from '../types';

const WEATHER_CACHE_KEY = 'gwada_weather_cache';
const VIGILANCE_CACHE_KEY = 'gwada_vigilance_cache';
const CACHE_TIMESTAMP_KEY = 'gwada_meteo_cache_timestamp';
const CACHE_VALIDITY_MS = 15 * 60 * 1000; // 15 minutes

export function useMeteoData() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fonction pour charger depuis le cache
  const loadFromCache = (): { weatherData: WeatherDataMap; vigilanceData: VigilanceData; timestamp: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
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

  const [weatherData, setWeatherData] = useState<WeatherDataMap>(() => {
    if (typeof window === 'undefined') return {};
    const cached = loadFromCache();
    return cached?.weatherData || {};
  });

  const [vigilanceData, setVigilanceData] = useState<VigilanceData | null>(() => {
    if (typeof window === 'undefined') return null;
    const cached = loadFromCache();
    return cached?.vigilanceData || null;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const isCacheValid = (timestamp: number): boolean => {
    const now = Date.now();
    return (now - timestamp) < CACHE_VALIDITY_MS;
  };

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const shouldFetch = (): boolean => {
      try {
        const cachedWeather = localStorage.getItem(WEATHER_CACHE_KEY);
        const cachedVigilance = localStorage.getItem(VIGILANCE_CACHE_KEY);
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

        if (!cachedWeather || !cachedVigilance || !cachedTimestamp) {
          console.log('[Cache] Pas de cache trouvé, chargement des données...');
          return true;
        }

        try {
          const weatherData = JSON.parse(cachedWeather);
          const vigilanceData = JSON.parse(cachedVigilance);

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
          return true;
        }

        const timestamp = parseInt(cachedTimestamp, 10);
        const needsRefresh = !isCacheValid(timestamp);
        if (needsRefresh) {
          console.log('[Cache] Cache expiré, rafraîchissement...');
        }
        return needsRefresh;
      } catch (error) {
        console.error('Erreur lors de la vérification du cache:', error);
        return true;
      }
    };

    if (shouldFetch()) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [weatherResponse, vigilanceResponse] = await Promise.all([
            fetch('http://127.0.0.1:8000/api/weather'),
            fetch('http://127.0.0.1:8000/api/vigilance'),
          ]);

          const [newWeatherData, newVigilanceData] = await Promise.all([
            weatherResponse.json(),
            vigilanceResponse.json(),
          ]);

          if (newWeatherData && Object.keys(newWeatherData).length > 0) {
            setWeatherData(newWeatherData);
            console.log(`[Weather] ${Object.keys(newWeatherData).length} communes chargées`);
          }

          if (newVigilanceData && newVigilanceData.department) {
            setVigilanceData(newVigilanceData);
            console.log('[Vigilance] Données chargées:', newVigilanceData.label);
          }

          if (newWeatherData && newVigilanceData && Object.keys(newWeatherData).length > 0) {
            saveToCache(newWeatherData, newVigilanceData);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données:', error);
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
       // Force reload if data is empty in state but cache is valid
       // This handles the case where initial state was empty because localStorage wasn't available during SSR/hydration mismatch prevention
       // but actually we have data. However, we already loaded from cache in state initializer if window was defined.
       // But the state initializer runs once.
       // If we are here, it means shouldFetch returned false, so cache is valid.
       // We should ensure state is consistent with cache if it was not already loaded.
       const cached = loadFromCache();
       if (cached && cached.weatherData && Object.keys(cached.weatherData).length > 0) {
           // Check if state is empty
           if (Object.keys(weatherData).length === 0) {
               setWeatherData(cached.weatherData);
               setVigilanceData(cached.vigilanceData);
           }
       }
    }
  }, []); // Empty dependency array to run once on mount

  return {
    weatherData,
    vigilanceData,
    loading,
    mounted,
  };
}
