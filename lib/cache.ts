/**
 * Système de cache avec Vercel KV pour les API Routes serverless
 *
 * Ce module fournit une abstraction pour la gestion du cache :
 * - En production : utilise Vercel KV (Redis)
 * - En développement : utilise un cache mémoire local
 */

import { kv } from '@vercel/kv';

// TTL (Time To Live) en secondes
// Optimisé pour Open-Meteo (API gratuite avec limites)
export const CACHE_TTL = {
  AIR_QUALITY: 180,        // 3 minutes - données qualité de l'air
  CURRENT_WEATHER: 900,    // 15 minutes - météo actuelle Open-Meteo (fréquentes)
  WEATHER: 900,            // 15 minutes - alias pour compatibilité
  FORECAST: 10800,         // 3 heures - prévisions météo (stables)
  VIGILANCE: 300,          // 5 minutes - vigilance Météo-France (rafraîchie plus souvent)
  WATER_CUTS: 86400,       // 24 heures - planning tours d'eau (données statiques)
} as const;

// Clés de cache
export const CACHE_KEYS = {
  AIR_QUALITY: 'air_quality',
  WEATHER: 'weather',
  FORECAST: (codeZone: string) => `forecast_${codeZone}`,
  VIGILANCE: 'vigilance',
  WATER_CUTS: 'water_cuts',
} as const;

// Cache mémoire pour le développement local (fallback si Vercel KV non configuré)
const memoryCache = new Map<string, { data: unknown; expiry: number }>();

/**
 * Vérifie si Vercel KV est disponible (en production ou si configuré localement)
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Récupère une valeur depuis le cache
 */
async function get<T>(key: string): Promise<T | null> {
  try {
    if (isKVAvailable()) {
      return await kv.get<T>(key);
    }

    // Fallback: cache mémoire local
    const cached = memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      console.log(`[Cache Local] Hit pour "${key}"`);
      return cached.data as T;
    }

    if (cached) {
      memoryCache.delete(key);
    }

    return null;
  } catch (error) {
    console.error(`[Cache] Erreur lecture "${key}":`, error);
    return null;
  }
}

/**
 * Stocke une valeur dans le cache avec un TTL
 */
async function set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    if (isKVAvailable()) {
      await kv.set(key, value, { ex: ttlSeconds });
      console.log(`[Cache KV] Set "${key}" (TTL: ${ttlSeconds}s)`);
    } else {
      // Fallback: cache mémoire local
      memoryCache.set(key, {
        data: value,
        expiry: Date.now() + ttlSeconds * 1000,
      });
      console.log(`[Cache Local] Set "${key}" (TTL: ${ttlSeconds}s)`);
    }
  } catch (error) {
    console.error(`[Cache] Erreur écriture "${key}":`, error);
  }
}

/**
 * Récupère ou calcule une valeur avec gestion du cache
 * Pattern "Cache-Aside" avec stale-while-revalidate
 */
async function getOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { ttl: number; staleWhileRevalidate?: boolean }
): Promise<T> {
  const { ttl, staleWhileRevalidate = true } = options;

  // 1. Tenter de récupérer depuis le cache
  const cached = await get<T>(key);

  if (cached !== null) {
    console.log(`[Cache] Hit pour "${key}"`);
    return cached;
  }

  console.log(`[Cache] Miss pour "${key}", appel API...`);

  // 2. Récupérer les données fraîches
  try {
    const freshData = await fetchFn();

    // 3. Stocker dans le cache
    await set(key, freshData, ttl);

    return freshData;
  } catch (error) {
    // En cas d'erreur, tenter de récupérer des données stale si disponibles
    if (staleWhileRevalidate) {
      const staleData = await getStale<T>(key);
      if (staleData !== null) {
        console.warn(`[Cache] Utilisation de données stale pour "${key}" après erreur API`);
        return staleData;
      }
    }
    throw error;
  }
}

/**
 * Récupère des données même si elles sont expirées (pour fallback)
 * Uniquement pour le cache mémoire local
 */
async function getStale<T>(key: string): Promise<T | null> {
  if (isKVAvailable()) {
    // Avec KV, les données expirées sont automatiquement supprimées
    return await kv.get<T>(key);
  }

  const cached = memoryCache.get(key);
  return cached ? (cached.data as T) : null;
}

/**
 * Invalide une entrée du cache
 */
async function invalidate(key: string): Promise<void> {
  try {
    if (isKVAvailable()) {
      await kv.del(key);
    } else {
      memoryCache.delete(key);
    }
    console.log(`[Cache] Invalidé "${key}"`);
  } catch (error) {
    console.error(`[Cache] Erreur invalidation "${key}":`, error);
  }
}

/**
 * Vide tout le cache (utile pour le développement)
 */
async function clear(): Promise<void> {
  if (!isKVAvailable()) {
    memoryCache.clear();
    console.log('[Cache Local] Cache vidé');
  }
}

// Export du gestionnaire de cache
export const CacheManager = {
  get,
  set,
  getOrFetch,
  invalidate,
  clear,
  isKVAvailable,
};
