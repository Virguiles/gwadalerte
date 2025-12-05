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
