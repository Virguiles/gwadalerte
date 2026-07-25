/**
 * API Route: /api/water-cuts
 *
 * Retourne les données de planning des tours d'eau pour les communes de Guadeloupe.
 * Ces données sont statiques et stockées dans un fichier JSON.
 *
 * Cache: 24 heures (données rarement mises à jour)
 */

import { NextResponse } from 'next/server';
import { CACHE_TTL } from '@/lib/cache';
import { WaterCutsDataMap } from '@/lib/api-clients';

// Importer les données statiques directement depuis lib/data
import waterCutsData from '@/lib/data/tours-deau.json';
import waterCutsSource from '@/lib/data/tours-deau-source.json';

/**
 * En-tête portant la date de RELEVÉ du planning (et non la date du fetch).
 * Le client s'en sert pour dater honnêtement la donnée à l'écran : sans ça,
 * un planning vieux de plusieurs mois s'affiche comme « mis à jour à l'instant ».
 */
export const WATER_SOURCE_DATE_HEADER = 'X-Data-Collected-At';

// Configuration ISR - 24 heures (données statiques)
export const revalidate = 86400;
// Peut utiliser Edge Runtime car données statiques, mais ISR est suffisant

// ============================================================================
// HANDLER GET
// ============================================================================

export async function GET() {
  try {
    // Les données sont déjà en mémoire grâce à l'import statique
    const data = waterCutsData as WaterCutsDataMap;

    return NextResponse.json(data, {
      headers: {
        // Cache longue durée car données statiques
        'Cache-Control': `public, s-maxage=${CACHE_TTL.WATER_CUTS}, stale-while-revalidate=${CACHE_TTL.WATER_CUTS * 2}`,
        [WATER_SOURCE_DATE_HEADER]: waterCutsSource.collectedAt,
        'Access-Control-Expose-Headers': WATER_SOURCE_DATE_HEADER,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[API water-cuts] Erreur:', message);

    return NextResponse.json(
      { error: `Impossible de récupérer les données des tours d'eau: ${message}` },
      { status: 500 }
    );
  }
}
