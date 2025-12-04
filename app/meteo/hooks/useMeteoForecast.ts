import { useState, useEffect, useCallback } from 'react';
import { ForecastData } from '../types';

const FORECAST_CACHE_KEY = 'gwada_forecast_cache_v2';
const FORECAST_TIMESTAMP_KEY = 'gwada_forecast_timestamp_v2';
const CACHE_VALIDITY_MS = 3 * 60 * 60 * 1000; // 3 heures (aligné avec le cache backend)

interface UseForecastOptions {
  codeZone?: string | null;
  autoFetch?: boolean;
}

interface UseForecastReturn {
  forecast: ForecastData | null;
  allForecasts: Record<string, ForecastData> | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook pour récupérer les prévisions météo sur 3 jours
 *
 * @param options.codeZone - Code INSEE de la commune (optionnel)
 * @param options.autoFetch - Si true, charge les données automatiquement (défaut: true)
 */
export function useMeteoForecast(options: UseForecastOptions = {}): UseForecastReturn {
  const { codeZone, autoFetch = true } = options;

  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [allForecasts, setAllForecasts] = useState<Record<string, ForecastData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clé de cache dynamique selon le code_zone
  const getCacheKey = useCallback(() => {
    return codeZone ? `${FORECAST_CACHE_KEY}_${codeZone}` : FORECAST_CACHE_KEY;
  }, [codeZone]);

  const getTimestampKey = useCallback(() => {
    return codeZone ? `${FORECAST_TIMESTAMP_KEY}_${codeZone}` : FORECAST_TIMESTAMP_KEY;
  }, [codeZone]);

  // Charger depuis le cache localStorage
  const loadFromCache = useCallback((): { data: ForecastData | Record<string, ForecastData>; timestamp: number } | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cachedData = localStorage.getItem(getCacheKey());
      const cachedTimestamp = localStorage.getItem(getTimestampKey());

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const age = Date.now() - timestamp;

        if (age < CACHE_VALIDITY_MS) {
          return {
            data: JSON.parse(cachedData),
            timestamp,
          };
        }
      }
    } catch (err) {
      console.error('[Forecast Cache] Erreur lecture:', err);
    }
    return null;
  }, [getCacheKey, getTimestampKey]);

  // Sauvegarder dans le cache
  const saveToCache = useCallback((data: ForecastData | Record<string, ForecastData>) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(getCacheKey(), JSON.stringify(data));
      localStorage.setItem(getTimestampKey(), Date.now().toString());
    } catch (err) {
      console.error('[Forecast Cache] Erreur sauvegarde:', err);
    }
  }, [getCacheKey, getTimestampKey]);

  // Récupérer les prévisions depuis l'API
  const fetchForecast = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Vérifier le cache d'abord
    const cached = loadFromCache();
    if (cached) {
      console.log('[Forecast] Utilisation du cache');
      if (codeZone) {
        setForecast(cached.data as ForecastData);
      } else {
        setAllForecasts(cached.data as Record<string, ForecastData>);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = codeZone
        ? `/api/meteo/forecast?code_zone=${codeZone}`
        : '/api/meteo/forecast';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();

      if (codeZone) {
        setForecast(data as ForecastData);
      } else {
        setAllForecasts(data as Record<string, ForecastData>);
      }

      saveToCache(data);
      console.log('[Forecast] Données récupérées depuis l\'API');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('[Forecast] Erreur:', message);
      setError(message);

      // Fallback sur le cache même expiré
      const cached = loadFromCache();
      if (cached) {
        console.log('[Forecast] Fallback sur cache expiré');
        if (codeZone) {
          setForecast(cached.data as ForecastData);
        } else {
          setAllForecasts(cached.data as Record<string, ForecastData>);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [codeZone, loadFromCache, saveToCache]);

  // Chargement initial
  useEffect(() => {
    if (autoFetch) {
      fetchForecast();
    }
  }, [autoFetch, fetchForecast]);

  return {
    forecast,
    allForecasts,
    loading,
    error,
    refetch: fetchForecast,
  };
}

/**
 * Hook simplifié pour récupérer les prévisions d'une commune spécifique
 */
export function useCommuneForecast(codeZone: string | null) {
  return useMeteoForecast({
    codeZone: codeZone || undefined,
    autoFetch: !!codeZone
  });
}

/**
 * Hook pour précharger les prévisions de plusieurs communes
 * Utile pour éviter le rate limiting lors de la navigation rapide
 */
export function usePreloadForecasts(codeZones: string[]) {
  const [preloaded, setPreloaded] = useState<Set<string>>(new Set());

  const preload = useCallback(async (zones: string[]) => {
    for (const zone of zones) {
      if (!preloaded.has(zone)) {
        try {
          // Précharger en arrière-plan sans bloquer l'UI
          fetch(`/api/meteo/forecast?code_zone=${zone}`, {
            method: 'HEAD' // Juste pour déclencher le cache
          }).catch(() => {
            // Ignorer les erreurs de préchargement
          });
          setPreloaded(prev => new Set(prev).add(zone));
        } catch {
          // Ignorer les erreurs
        }

        // Petit délai entre les préchargements
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }, [preloaded]);

  useEffect(() => {
    if (codeZones.length > 0) {
      preload(codeZones);
    }
  }, [codeZones, preload]);

  return { preloaded: Array.from(preloaded) };
}
