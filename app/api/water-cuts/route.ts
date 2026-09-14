/**
 * API Route: /api/water-cuts
 *
 * Retourne les données de planning des tours d'eau pour les communes de
 * Guadeloupe, depuis l'API publique Orisk (https://orisk.app/api/tours-deau/public).
 *
 * En cas d'échec de l'API Orisk, on retombe sur le planning SMGEAG relevé
 * manuellement (`lib/data/tours-deau.json`) plutôt que de renvoyer une erreur.
 *
 * Cache: 5 minutes (aligné sur le cache CDN d'Orisk et le cache client)
 */

import { NextResponse } from 'next/server';
import { CacheManager, CACHE_TTL, CACHE_KEYS } from '@/lib/cache';
import { API_CONFIG, WaterCutsDataMap } from '@/lib/api-clients';
import { adaptOriskResponse, type OriskToursDeauResponse } from '@/lib/water-cuts-adapter';

// Repli statique en cas d'échec de l'API Orisk
import waterCutsFallback from '@/lib/data/tours-deau.json';
import waterCutsFallbackSource from '@/lib/data/tours-deau-source.json';

/**
 * En-tête portant la date de RELEVÉ du planning (et non la date du fetch).
 * Le client s'en sert pour dater honnêtement la donnée à l'écran : sans ça,
 * un planning vieux de plusieurs mois s'affiche comme « mis à jour à l'instant ».
 */
export const WATER_SOURCE_DATE_HEADER = 'X-Data-Collected-At';

// Configuration ISR - 5 minutes (aligné sur CACHE_TTL.WATER_CUTS)
export const revalidate = 300;

interface WaterCutsResult {
  data: WaterCutsDataMap;
  sourceDate: string;
}

async function fetchOriskWaterCuts(): Promise<WaterCutsResult> {
  const response = await fetch(API_CONFIG.ORISK.TOURS_DEAU_URL, {
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Erreur API Orisk: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as OriskToursDeauResponse;
  const data = adaptOriskResponse(payload);

  if (Object.keys(data).length === 0) {
    throw new Error("Réponse Orisk sans commune reconnue");
  }

  return { data, sourceDate: payload.generated_at };
}

// ============================================================================
// HANDLER GET
// ============================================================================

export async function GET() {
  try {
    const { data, sourceDate } = await CacheManager.getOrFetch<WaterCutsResult>(
      CACHE_KEYS.WATER_CUTS,
      fetchOriskWaterCuts,
      { ttl: CACHE_TTL.WATER_CUTS, staleWhileRevalidate: true }
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL.WATER_CUTS}, stale-while-revalidate=${CACHE_TTL.WATER_CUTS * 2}`,
        [WATER_SOURCE_DATE_HEADER]: sourceDate,
        'Access-Control-Expose-Headers': WATER_SOURCE_DATE_HEADER,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[API water-cuts] Orisk indisponible, repli sur le planning statique:', message);

    return NextResponse.json(waterCutsFallback as WaterCutsDataMap, {
      headers: {
        // Cache court : on retente l'API Orisk rapidement plutôt que de rester
        // bloqué sur le repli statique.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        [WATER_SOURCE_DATE_HEADER]: waterCutsFallbackSource.collectedAt,
        'Access-Control-Expose-Headers': WATER_SOURCE_DATE_HEADER,
      },
    });
  }
}
