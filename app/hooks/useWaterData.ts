import { useState, useEffect } from 'react';
import { WaterDataMap } from '../tours-deau/types';

export function useWaterData() {
  const [data, setData] = useState<WaterDataMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Utiliser les API Routes Next.js locales (plus besoin de NEXT_PUBLIC_API_URL)
        const res = await fetch('/api/water-cuts');
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        setError(err as Error);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
