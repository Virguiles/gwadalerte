import { useState, useEffect, useCallback } from 'react';
import { WaterDataMap } from '../tours-deau/types';

const CACHE_KEY = 'gwada_water_cuts_cache';
const CACHE_TIMESTAMP_KEY = 'gwada_water_cuts_cache_timestamp';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function useWaterData() {
  const [data, setData] = useState<WaterDataMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadFromCache = (): { data: WaterDataMap; timestamp: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedTimestamp) {
        return {
          data: JSON.parse(cachedData),
          timestamp: parseInt(cachedTimestamp, 10)
        };
      }
    } catch (error) {
      console.error('Erreur lecture cache:', error);
    }
    return null;
  };

  const saveToCache = (data: WaterDataMap) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      const timestamp = Date.now();
      localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
      setLastUpdate(new Date(timestamp));
    } catch (error) {
      console.error('Erreur sauvegarde cache:', error);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/water-cuts');
      if (!res.ok) {
        throw new Error('Impossible de récupérer les données des tours d\'eau');
      }
      const jsonData = await res.json();
      setData(jsonData);
      saveToCache(jsonData);
    } catch (err) {
      setError(err as Error);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const checkAndFetch = async () => {
      // Load from cache first
      const cached = loadFromCache();
      if (cached) {
        setData(cached.data);
        setLastUpdate(new Date(cached.timestamp));
        setLoading(false);

        // Check if cache is still valid
        const now = Date.now();
        if (now - cached.timestamp < CACHE_DURATION_MS) {
          return; // Cache is fresh, no need to fetch
        }
      }

      // Fetch fresh data
      await fetchData();
    };

    checkAndFetch();
  }, [fetchData]);

  return { data, loading, error, lastUpdate, retry };
}
