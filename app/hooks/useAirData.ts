import { AirData } from '../components/GuadeloupeMap';
import { useCachedResource } from './useCachedResource';

const CACHE_KEY = 'gwada_air_quality';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const EMPTY_AIR_DATA: AirData = {};

/**
 * Source de vérité pour la qualité de l'air.
 * À n'instancier que dans le DataProvider — les composants passent par
 * `useAirData()` (contexte), pour éviter les appels réseau dupliqués.
 */
export function useAirDataSource(enabled: boolean) {
  const { data, loading, error, lastUpdate, retry } = useCachedResource<AirData>({
    url: '/api/air-quality',
    cacheKey: CACHE_KEY,
    cacheDurationMs: CACHE_DURATION_MS,
    initialData: EMPTY_AIR_DATA,
    errorMessage: "Impossible de récupérer les données de qualité de l'air",
    enabled,
  });

  return { data, loading, error, lastUpdate, retry };
}

export type AirDataValue = ReturnType<typeof useAirDataSource>;
