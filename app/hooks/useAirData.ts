import { useState, useEffect, useCallback } from 'react';
import { AirData } from '../components/GuadeloupeMap';

const CACHE_KEY = 'gwada_air_quality_cache';
const CACHE_TIMESTAMP_KEY = 'gwada_air_quality_cache_timestamp';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function useAirData() {
  const [data, setData] = useState<AirData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadFromCache = (): { data: AirData; timestamp: number } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedData.trim() !== '' && cachedTimestamp) {
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/air-quality');
      if (!res.ok) throw new Error('Impossible de récupérer les données de qualité de l\'air');
      const newData = await res.json();
      setData(newData);
      saveToCache(newData);
    } catch (err) {
      setError(err as Error);
      console.error('Erreur lors du refresh air data:', err);
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
