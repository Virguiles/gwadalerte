/**
 * API Route: /api/air-quality
 *
 * Récupère les données de qualité de l'air depuis l'API Gwad'Air (ArcGIS)
 * pour toutes les communes de Guadeloupe.
 *
 * Cache: 3 minutes (aligné sur le backend Python original)
 */

import { NextResponse } from 'next/server';
import { CacheManager, CACHE_TTL, CACHE_KEYS } from '@/lib/cache';
import {
  API_CONFIG,
  AirQualityDataMap,
  createErrorResponse
} from '@/lib/api-clients';

// Configuration ISR (Incremental Static Regeneration)
// 5 minutes - aligné sur le cache backend optimisé
export const revalidate = 300;
// Note: Edge Runtime non utilisé car CacheManager utilise @vercel/kv qui nécessite Node.js runtime

// ============================================================================
// TYPES INTERNES
// ============================================================================

interface ArcGISFeature {
  attributes: {
    code_zone?: string;
    lib_zone?: string;
    code_qual?: number;
    lib_qual?: string;
    date_ech?: number; // Timestamp UNIX en millisecondes
    date_dif?: number;
    source?: string;
    coul_qual?: string;
    code_no2?: number;
    code_so2?: number;
    code_o3?: number;
    code_pm10?: number;
    code_pm25?: number;
    [key: string]: unknown;
  };
}

interface ArcGISResponse {
  features?: ArcGISFeature[];
}

// ============================================================================
// FONCTION DE RÉCUPÉRATION DES DONNÉES
// ============================================================================

/**
 * Récupère les données de qualité de l'air depuis l'API Gwad'Air
 */
async function fetchAirQualityData(): Promise<AirQualityDataMap> {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Paramètres de requête pour l'API ArcGIS
  const params = new URLSearchParams({
    where: `date_ech >= '${todayStr}' AND date_ech <= '${tomorrowStr}'`,
    outFields: '*',
    returnGeometry: 'false',
    outSR: '4326',
    f: 'json',
    orderByFields: 'date_ech DESC',
  });

  console.log('[Gwad\'Air] Appel API pour les données d\'aujourd\'hui...');

  let response = await fetch(`${API_CONFIG.GWADAIR.BASE_URL}?${params}`, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: CACHE_TTL.AIR_QUALITY },
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} depuis Gwad'Air`);
  }

  let data: ArcGISResponse = await response.json();

  // Vérifier si on a des données pour la Guadeloupe (codes 971xx)
  const features = data.features || [];
  const guadeloupeFeatures = features.filter(f =>
    f.attributes.code_zone && f.attributes.code_zone.startsWith('971')
  );

  // Si pas assez de données pour la Guadeloupe aujourd'hui (moins de 5 communes), essayer hier
  // Gwad'Air publie parfois les données en retard ou partiellement
  if (guadeloupeFeatures.length < 5) {
    console.log(`[Gwad'Air] Seulement ${guadeloupeFeatures.length} communes trouvées pour aujourd'hui, récupération des données d'hier...`);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const paramsYesterday = new URLSearchParams({
      where: `date_ech >= '${yesterdayStr}' AND date_ech < '${todayStr}'`,
      outFields: '*',
      returnGeometry: 'false',
      outSR: '4326',
      f: 'json',
      orderByFields: 'date_ech DESC',
    });

    response = await fetch(`${API_CONFIG.GWADAIR.BASE_URL}?${paramsYesterday}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status} depuis Gwad'Air (hier)`);
    }

    data = await response.json();
  }

  // Transformer les données ArcGIS en format attendu par le frontend
  const formattedData: AirQualityDataMap = {};
  let communesCount = 0;
  let maxDate: Date | null = null;

  for (const feature of data.features || []) {
    const attrs = feature.attributes;
    const codeZone = attrs.code_zone;

    if (!codeZone) continue;

    // Convertir les timestamps UNIX en dates formatées
    let dateEchStr: string | undefined;
    if (attrs.date_ech) {
      const dateEch = new Date(attrs.date_ech);
      dateEchStr = dateEch.toUTCString();

      if (!maxDate || dateEch > maxDate) {
        maxDate = dateEch;
      }
    }

    let dateDifStr: string | undefined;
    if (attrs.date_dif) {
      dateDifStr = new Date(attrs.date_dif).toUTCString();
    }

    // Ne garder que la donnée la plus récente pour chaque commune
    if (!formattedData[codeZone]) {
      formattedData[codeZone] = {
        ...attrs,
        code_zone: codeZone,
        date_ech: dateEchStr,
        date_dif: dateDifStr,
      };
      communesCount++;
    } else {
      // Comparer les dates pour garder la plus récente
      const existingDateStr = formattedData[codeZone].date_ech;
      if (existingDateStr && dateEchStr) {
        const existingDate = new Date(existingDateStr);
        const currentDate = new Date(dateEchStr);
        if (currentDate > existingDate) {
          formattedData[codeZone] = {
            ...attrs,
            code_zone: codeZone,
            date_ech: dateEchStr,
            date_dif: dateDifStr,
          };
        }
      }
    }
  }

  console.log(`[Gwad'Air] Données récupérées: ${communesCount} communes`);
  if (maxDate) {
    console.log(`[Gwad'Air] Date la plus récente: ${maxDate.toISOString()}`);
  }

  return formattedData;
}

// ============================================================================
// HANDLER GET
// ============================================================================

export async function GET() {
  try {
    // Utiliser le système de cache avec fallback
    const data = await CacheManager.getOrFetch<AirQualityDataMap>(
      CACHE_KEYS.AIR_QUALITY,
      fetchAirQualityData,
      { ttl: CACHE_TTL.AIR_QUALITY, staleWhileRevalidate: true }
    );

    return NextResponse.json(data, {
      headers: {
        // Cache agressif : CDN garde 5min, stale pendant 15min, navigateur garde 2min
        'Cache-Control': `public, s-maxage=${CACHE_TTL.AIR_QUALITY}, stale-while-revalidate=${CACHE_TTL.AIR_QUALITY * 3}, max-age=120`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[API air-quality] Erreur:', message);

    return createErrorResponse(
      `Impossible de récupérer les données de qualité de l'air: ${message}`,
      500
    );
  }
}
