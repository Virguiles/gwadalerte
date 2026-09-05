import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Récupération d'une ressource JSON avec cache localStorage.
 *
 * Mutualise la logique qui était dupliquée entre les tours d'eau et la qualité
 * de l'air. Ce hook n'est censé être instancié qu'une fois par ressource, dans
 * le DataProvider : les composants consomment le contexte, pas ce hook.
 */

export type CachedResource<T> = {
  data: T;
  loading: boolean;
  error: Error | null;
  /** Horodatage du dernier appel réseau réussi */
  lastUpdate: Date | null;
  /** Valeur de l'en-tête `metaHeader`, si demandé */
  meta: string | null;
  retry: () => void;
};

type Options<T> = {
  /** Route interne à appeler */
  url: string;
  /** Préfixe des clés localStorage */
  cacheKey: string;
  /** Durée de validité du cache navigateur */
  cacheDurationMs: number;
  /** Valeur affichée tant que rien n'est chargé */
  initialData: T;
  /** Message d'erreur destiné à l'utilisateur */
  errorMessage: string;
  /**
   * Tant que `false`, aucun appel réseau : évite de charger des données
   * sur les pages qui ne les affichent pas.
   */
  enabled?: boolean;
  /** En-tête de réponse à conserver (ex. date de relevé de la source) */
  metaHeader?: string;
};

const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Stockage indisponible (navigation privée, quota) : sans gravité
  }
};

export function useCachedResource<T>({
  url,
  cacheKey,
  cacheDurationMs,
  initialData,
  errorMessage,
  enabled = true,
  metaHeader,
}: Options<T>): CachedResource<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [meta, setMeta] = useState<string | null>(null);

  const dataKey = `${cacheKey}_cache`;
  const timestampKey = `${cacheKey}_cache_timestamp`;
  const metaKey = `${cacheKey}_meta`;

  // Le premier chargement ne doit se déclencher qu'une fois par activation
  const hasLoadedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(url);
      if (!res.ok) throw new Error(errorMessage);

      const json = (await res.json()) as T;
      setData(json);

      const timestamp = Date.now();
      safeSetItem(dataKey, JSON.stringify(json));
      safeSetItem(timestampKey, timestamp.toString());
      setLastUpdate(new Date(timestamp));

      if (metaHeader) {
        const headerValue = res.headers.get(metaHeader);
        if (headerValue) {
          setMeta(headerValue);
          safeSetItem(metaKey, headerValue);
        }
      }
    } catch (err) {
      setError(err as Error);
      console.error(`[${cacheKey}]`, err);
    } finally {
      setLoading(false);
    }
  }, [url, errorMessage, dataKey, timestampKey, metaKey, metaHeader, cacheKey]);

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enabled || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    // On affiche d'abord le cache local, puis on rafraîchit s'il a expiré
    const cachedData = safeGetItem(dataKey);
    const cachedTimestamp = safeGetItem(timestampKey);

    if (cachedData && cachedData.trim() !== '' && cachedTimestamp) {
      try {
        /*
         * Dette assumée : peindre le cache avant le réseau est tout l'intérêt
         * de ce hook — c'est ce qui rend le site consultable hors ligne. Le
         * faire sans `setState` en effet demanderait de lire `localStorage`
         * pendant le rendu, donc de traiter l'écart d'hydratation qui va avec.
         * À reprendre avec la lecture d'URL du tableau de bord, même sujet.
         */
        // eslint-disable-next-line react-hooks/set-state-in-effect -- voir ci-dessus
        setData(JSON.parse(cachedData) as T);
        const timestamp = parseInt(cachedTimestamp, 10);
        setLastUpdate(new Date(timestamp));

        const cachedMeta = metaHeader ? safeGetItem(metaKey) : null;
        if (cachedMeta) setMeta(cachedMeta);

        setLoading(false);

        if (Date.now() - timestamp < cacheDurationMs) return; // Cache encore valide
      } catch (err) {
        console.error(`[${cacheKey}] Cache illisible, rechargement`, err);
      }
    }

    fetchData();
  }, [enabled, fetchData, dataKey, timestampKey, metaKey, metaHeader, cacheDurationMs, cacheKey]);

  return { data, loading, error, lastUpdate, meta, retry };
}
