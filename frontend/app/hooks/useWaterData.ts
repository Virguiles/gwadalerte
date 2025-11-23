import { useState, useEffect } from 'react';
import { WaterDataMap } from '../tours-deau/types';

export function useWaterData() {
  const [data, setData] = useState<WaterDataMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // En production, il faudrait gérer l'URL de l'API via une variable d'environnement
        const res = await fetch('http://127.0.0.1:8000/api/water-cuts');
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
