/**
 * API Route: /api/vigilance
 *
 * Récupère les données de vigilance météo pour la Guadeloupe
 * depuis l'API Météo-France avec authentification OAuth2.
 *
 * Cache: 10 minutes (aligné sur le backend Python original)
 *
 * Note: Cette route ne peut pas utiliser runtime='edge' car elle
 * nécessite la décompression de fichiers ZIP (non supporté en edge).
 */

import { NextResponse } from 'next/server';
import { CacheManager, CACHE_TTL, CACHE_KEYS } from '@/lib/cache';
import {
  API_CONFIG,
  VigilanceData,
  VigilanceRisk,
  VIGILANCE_LEVELS,
  PHENOMENON_NAMES,
} from '@/lib/api-clients';
import JSZip from 'jszip';

// Configuration ISR - 5 minutes
export const revalidate = 300;

// Note: On ne peut pas utiliser runtime='edge' car JSZip n'est pas compatible

// ============================================================================
// TYPES INTERNES (réponse Météo-France)
// ============================================================================

interface MeteoFrancePhenomenon {
  phenomenon_id: number;
  phenomenon_max_color_id: number;
}

interface MeteoFranceDomain {
  domain_id: string;
  max_color_id?: number;
  phenomenon_items?: MeteoFrancePhenomenon[];
}

interface MeteoFranceVigilanceData {
  timelaps?: {
    domain_ids?: MeteoFranceDomain[];
  };
}

// ============================================================================
// GESTION DU TOKEN OAUTH
// ============================================================================

// Cache en mémoire pour le token (car il a une durée de vie de ~1h)
let cachedToken: { token: string; expiry: number } | null = null;

/**
 * Obtient ou rafraîchit le token OAuth2 Météo-France
 */
async function getMeteoFranceToken(): Promise<string> {
  const currentTime = Date.now();

  // Si le token existe et n'est pas expiré (avec marge de 5 minutes)
  if (cachedToken && currentTime < (cachedToken.expiry - 5 * 60 * 1000)) {
    console.log('[Météo-France] Utilisation du token en cache');
    return cachedToken.token;
  }

  const clientId = process.env.METEOFRANCE_CLIENT_ID;
  const clientSecret = process.env.METEOFRANCE_CLIENT_SECRET;
  const tokenUrl = API_CONFIG.METEOFRANCE.TOKEN_URL;

  if (!clientId || !clientSecret) {
    throw new Error('Credentials Météo-France non configurés');
  }

  if (!tokenUrl) {
    throw new Error('URL du token Météo-France non configurée (METEOFRANCE_TOKEN_URL)');
  }

  console.log('[Météo-France] Génération d\'un nouveau token...');

  // Encodage Base64 des credentials
  const credentials = `${clientId}:${clientSecret}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Erreur d'authentification Météo-France: HTTP ${response.status}`);
  }

  const tokenData = await response.json();

  // Mettre en cache le token
  const expiresIn = tokenData.expires_in || 3600;
  cachedToken = {
    token: tokenData.access_token,
    expiry: currentTime + expiresIn * 1000,
  };

  console.log(`[Météo-France] Nouveau token généré, expire dans ${expiresIn}s`);

  return cachedToken.token;
}

// ============================================================================
// FONCTION DE RÉCUPÉRATION DES DONNÉES DE VIGILANCE
// ============================================================================

/**
 * Récupère et parse les données de vigilance depuis l'API Météo-France
 */
async function fetchVigilanceData(): Promise<VigilanceData> {
  const currentTime = Date.now();

  console.log('[Vigilance] Appel à l\'API Météo-France...');

  // Obtenir le token
  const token = await getMeteoFranceToken();

  // Télécharger le fichier ZIP de vigilance outre-mer
  const response = await fetch(API_CONFIG.METEOFRANCE.VIGILANCE_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur API Météo-France: HTTP ${response.status}`);
  }

  // Lire le contenu du ZIP
  const zipBuffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(zipBuffer);

  // Chercher le fichier de la Guadeloupe
  const vigilanceFile = zip.file(API_CONFIG.METEOFRANCE.GUADELOUPE_FILE);

  if (!vigilanceFile) {
    throw new Error(`Fichier ${API_CONFIG.METEOFRANCE.GUADELOUPE_FILE} non trouvé dans le ZIP`);
  }

  // Lire et parser le JSON
  const vigilanceContent = await vigilanceFile.async('text');
  const vigilanceJson: MeteoFranceVigilanceData = JSON.parse(vigilanceContent);

  // Extraire les données pour la Guadeloupe (VIGI971)
  let vigilanceLevel = 1; // Par défaut: vert
  const vigilanceRisks: VigilanceRisk[] = [];

  if (vigilanceJson.timelaps?.domain_ids) {
    for (const domain of vigilanceJson.timelaps.domain_ids) {
      if (domain.domain_id === API_CONFIG.METEOFRANCE.DOMAIN_ID) {
        vigilanceLevel = domain.max_color_id ?? 1;

        // Extraire les risques
        if (domain.phenomenon_items) {
          for (const phenomenon of domain.phenomenon_items) {
            const phenoId = phenomenon.phenomenon_id;
            const phenoLevel = phenomenon.phenomenon_max_color_id;

            // Ne pas inclure les phénomènes avec level < 1
            if (phenoLevel >= 1) {
              vigilanceRisks.push({
                type: PHENOMENON_NAMES[phenoId] ?? `Phénomène ${phenoId}`,
                level: phenoLevel,
              });
            }
          }
        }
        break;
      }
    }
  }

  // Récupérer la couleur et le label
  const levelInfo = VIGILANCE_LEVELS[vigilanceLevel] ?? VIGILANCE_LEVELS[1];

  const result: VigilanceData = {
    department: '971',
    department_name: 'Guadeloupe',
    level: vigilanceLevel,
    color: levelInfo.color,
    label: levelInfo.label,
    risks: vigilanceRisks,
    last_update: currentTime,
  };

  console.log(`[Vigilance] Niveau: ${levelInfo.label} (${vigilanceLevel}), Risques: ${vigilanceRisks.length}`);

  return result;
}

// ============================================================================
// HANDLER GET
// ============================================================================

export async function GET() {
  try {
    // Vérifier les credentials
    if (!process.env.METEOFRANCE_CLIENT_ID || !process.env.METEOFRANCE_CLIENT_SECRET) {
      console.warn('[Vigilance] ⚠️ Credentials Météo-France non configurés');
      console.warn('[Vigilance] Pour obtenir les vraies données de vigilance, configurez METEOFRANCE_CLIENT_ID et METEOFRANCE_CLIENT_SECRET dans .env.local');
      console.warn('[Vigilance] Retour de valeurs par défaut (niveau 1 - Vert)');

      // Retourner des valeurs par défaut si pas de credentials
      return NextResponse.json({
        department: '971',
        department_name: 'Guadeloupe',
        level: 1,
        color: '#28d761',
        label: 'Vert',
        risks: [],
        last_update: Date.now(),
        error: 'Credentials Météo-France non configurés. Les données affichées sont des valeurs par défaut.',
      });
    }

    // Utiliser le système de cache
    const data = await CacheManager.getOrFetch<VigilanceData>(
      CACHE_KEYS.VIGILANCE,
      fetchVigilanceData,
      { ttl: CACHE_TTL.VIGILANCE, staleWhileRevalidate: true }
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL.VIGILANCE}, stale-while-revalidate=${CACHE_TTL.VIGILANCE * 2}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[API vigilance] Erreur:', message);

    // En cas d'erreur, retourner des valeurs par défaut (niveau vert)
    // pour ne pas bloquer le frontend
    return NextResponse.json({
      department: '971',
      department_name: 'Guadeloupe',
      level: 1,
      color: '#28d761',
      label: 'Vert',
      risks: [],
      last_update: Date.now(),
      error: message,
    });
  }
}
