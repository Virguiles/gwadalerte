import { useMemo } from 'react';
import { WaterDataMap } from '@/app/data/water-types';
import { useCachedResource } from './useCachedResource';

const CACHE_KEY = 'gwada_water_cuts';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
/** En-tête portant la date de génération du planning Orisk */
const SOURCE_DATE_HEADER = 'X-Data-Collected-At';

const EMPTY_WATER_DATA: WaterDataMap = {};

/**
 * Convertit une date calendaire « AAAA-MM-JJ » en Date locale.
 * `new Date('2025-11-30')` serait interprété à minuit UTC, ce qui affiche
 * la veille dans les fuseaux négatifs — dont celui de la Guadeloupe.
 */
export function parseCalendarDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * Source de vérité pour les tours d'eau.
 * À n'instancier que dans le DataProvider — les composants passent par
 * `useWaterData()` (contexte).
 */
export function useWaterDataSource(enabled: boolean) {
  const { data, loading, error, lastUpdate, meta, retry } = useCachedResource<WaterDataMap>({
    url: '/api/water-cuts',
    cacheKey: CACHE_KEY,
    cacheDurationMs: CACHE_DURATION_MS,
    initialData: EMPTY_WATER_DATA,
    errorMessage: "Impossible de récupérer les données des tours d'eau",
    enabled,
    metaHeader: SOURCE_DATE_HEADER,
  });

  // Date de GÉNÉRATION du planning côté Orisk — à ne pas confondre avec
  // `lastUpdate`, qui n'est que l'heure du dernier appel réseau.
  const sourceDate = useMemo(() => (meta ? parseCalendarDate(meta) : null), [meta]);

  return { data, loading, error, lastUpdate, sourceDate, retry };
}

export type WaterDataValue = ReturnType<typeof useWaterDataSource>;
