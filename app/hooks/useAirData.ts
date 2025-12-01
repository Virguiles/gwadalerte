import { useState, useEffect } from 'react';
import { AirData } from '../components/GuadeloupeMap';

const CACHE_KEY = 'gwada_air_quality_cache';
const CACHE_TIMESTAMP_KEY = 'gwada_air_quality_cache_timestamp';

export function useAirData() {
  const [data, setData] = useState<AirData>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadFromCache = (): { data: AirData; timestamp: number } | null => {
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

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  useEffect(() => {
    const checkAndFetch = async () => {
      // 1. Tenter de charger le cache
      const cached = loadFromCache();
      if (cached) {
        setData(cached.data);
        setLastUpdate(new Date(cached.timestamp));
        setLoading(false); // On affiche immédiatement les données du cache
      }

      // 2. Vérifier si on doit refresh
      let shouldFetch = true;
      if (cached) {
        const lastUpdateDate = new Date(cached.timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60);

        if (isSameDay(lastUpdateDate, now) && diffMinutes < 30) { // Cache valide 30 min ici pour l'exemple
          shouldFetch = false;
        }
      }

      if (shouldFetch) {
        try {
          // Utiliser les API Routes Next.js locales (plus besoin de NEXT_PUBLIC_API_URL)
          const res = await fetch('/api/air-quality');
          if (!res.ok) throw new Error('Erreur fetch air quality');
          const newData = await res.json();
          setData(newData);
          saveToCache(newData);
        } catch (error) {
          console.error('Erreur lors du refresh air data:', error);
          // Si on avait un cache, on garde les vieilles données, sinon tant pis
        } finally {
          setLoading(false);
        }
      }
    };

    checkAndFetch();
  }, []);

  return { data, loading, lastUpdate };
}
