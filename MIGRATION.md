# Migration FastAPI → Next.js API Routes

Ce document décrit la migration du backend FastAPI vers les API Routes Next.js serverless pour le projet Gwad'Alerte.

## 📋 Résumé des changements

### Ce qui a été migré

| Endpoint FastAPI | API Route Next.js | Cache TTL | Runtime |
|------------------|-------------------|-----------|---------|
| `/api/air-quality` | `/api/air-quality` | 3 min | Node.js |
| `/api/weather` | `/api/weather` | 1 heure | Node.js |
| `/api/forecast/{code_zone}` | `/api/forecast/[code_zone]` | 3 heures | Node.js |
| `/api/vigilance` | `/api/vigilance` | 10 min | Node.js |
| `/api/water-cuts` | `/api/water-cuts` | 24 heures | Edge |

### Structure des fichiers créés

```
GwadaSVG/
├── app/
│   └── api/
│       ├── air-quality/
│       │   └── route.ts
│       ├── weather/
│       │   └── route.ts
│       ├── forecast/
│       │   └── [code_zone]/
│       │       └── route.ts
│       ├── vigilance/
│       │   └── route.ts
│       └── water-cuts/
│           └── route.ts
├── lib/
│   ├── cache.ts          # Système de cache (Vercel KV + fallback mémoire)
│   ├── api-clients.ts    # Types et utilitaires partagés
│   └── data/
│       └── tours-deau.json
├── vercel.json           # Configuration Vercel
└── MIGRATION.md          # Ce fichier
```

## 🚀 Déploiement sur Vercel

### 1. Configurer les variables d'environnement

Dans le dashboard Vercel → Settings → Environment Variables :

```env
OPENWEATHER_API_KEY=votre_cle_api
METEOFRANCE_CLIENT_ID=votre_client_id
METEOFRANCE_CLIENT_SECRET=votre_client_secret
```

### 2. Ajouter Vercel KV (recommandé pour la production)

1. Dashboard Vercel → Storage → Create Database
2. Choisir "KV"
3. Lier au projet

Les variables `KV_REST_API_URL` et `KV_REST_API_TOKEN` seront automatiquement ajoutées.

### 3. Déployer

```bash
vercel --prod
```

## 🧪 Tester localement

### Prérequis

```bash
npm install
```

### Configurer les variables d'environnement

```bash
cp .env.example .env.local
# Éditer .env.local avec vos vraies clés API
```

### Lancer le serveur de développement

```bash
npm run dev
```

### Tester les endpoints

```bash
# Qualité de l'air
curl http://localhost:3000/api/air-quality

# Météo (toutes les communes)
curl http://localhost:3000/api/weather

# Prévisions pour une commune
curl http://localhost:3000/api/forecast/97105

# Vigilance météo
curl http://localhost:3000/api/vigilance

# Tours d'eau
curl http://localhost:3000/api/water-cuts
```

## 🔧 Système de cache

### En production (Vercel KV)

Le cache utilise Vercel KV (Redis managé) avec les TTL suivants :
- `air_quality`: 3 minutes
- `weather`: 1 heure
- `forecast_{code_zone}`: 3 heures
- `vigilance`: 10 minutes
- `water_cuts`: 24 heures

### En développement local

Si Vercel KV n'est pas configuré, un cache mémoire est utilisé automatiquement.

### Pattern de cache

Le système utilise le pattern "Cache-Aside" avec stale-while-revalidate :

```typescript
const data = await CacheManager.getOrFetch(
  'cache-key',
  fetchFunction,
  { ttl: 3600, staleWhileRevalidate: true }
);
```

## 📊 Différences avec le backend Python

### Ce qui est identique

- ✅ Structure des données JSON en sortie
- ✅ Logique métier (transformation des données)
- ✅ TTL de cache
- ✅ Gestion des erreurs avec fallback

### Ce qui a changé

| Aspect | FastAPI (Python) | Next.js API Routes |
|--------|------------------|-------------------|
| Cache | Fichier local | Vercel KV (Redis) |
| Runtime | Serveur persistant | Serverless (à la demande) |
| Région | Variable | cdg1 (Paris) |
| Décompression ZIP | `zipfile` (Python) | `jszip` (Node.js) |
| Appels parallèles | `asyncio.gather()` | `Promise.all()` |

## 🐛 Dépannage

### Erreur "OPENWEATHER_API_KEY non configurée"

Vérifier que la variable d'environnement est bien configurée dans Vercel ou `.env.local`.

### Erreur "Credentials Météo-France non configurés"

Vérifier `METEOFRANCE_CLIENT_ID` et `METEOFRANCE_CLIENT_SECRET`.

### Cache ne fonctionne pas en local

Normal ! Le cache mémoire local est réinitialisé à chaque redémarrage du serveur.
Pour tester le vrai cache, déployez sur Vercel avec KV configuré.

### Erreur de timeout sur /api/weather

L'endpoint weather fait 33 appels API en parallèle. En cas de lenteur réseau :
- Vérifier les logs Vercel
- Augmenter `maxDuration` dans `vercel.json` si nécessaire

## 📝 Hooks frontend modifiés

Les hooks ont été simplifiés pour utiliser les API Routes locales :

```typescript
// Avant
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const res = await fetch(`${apiUrl}/api/air-quality`);

// Après
const res = await fetch('/api/air-quality');
```

Fichiers modifiés :
- `app/hooks/useAirData.ts`
- `app/hooks/useWaterData.ts`
- `app/meteo/hooks/useMeteoData.ts`

## ✅ Migration terminée

Le backend Python a été supprimé. Le projet utilise maintenant exclusivement les API Routes Next.js pour un déploiement simplifié sur Vercel.

**Note** : Si vous avez encore `NEXT_PUBLIC_API_URL` dans vos variables d'environnement, vous pouvez la retirer car elle n'est plus utilisée.

## 📚 Ressources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
