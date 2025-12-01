# 🚀 Guide de déploiement Netlify - Gwad'Alerte

Ce guide vous accompagne pour déployer Gwad'Alerte sur Netlify en toute sécurité.

## 📋 Prérequis

- Un compte Netlify (gratuit) : [https://app.netlify.com/signup](https://app.netlify.com/signup)
- Votre code sur GitHub, GitLab ou Bitbucket
- Les clés API nécessaires (voir section Variables d'environnement)

## 🔐 Sécurité - Vérifications avant déploiement

### ✅ Vérifications effectuées

1. **Variables d'environnement sécurisées** ✅
   - Toutes les clés API sont stockées dans des variables d'environnement
   - Aucune clé API n'est hardcodée dans le code
   - Le fichier `.gitignore` exclut tous les fichiers `.env*`

2. **Références au backend corrigées** ✅
   - Toutes les références à `NEXT_PUBLIC_API_URL` ont été remplacées par les routes API Next.js locales (`/api/...`)
   - Plus de dépendance au backend Python local

3. **Cache adapté pour Netlify** ✅
   - Le système de cache utilise un fallback mémoire local si Vercel KV n'est pas disponible
   - Fonctionne parfaitement sur Netlify sans configuration supplémentaire

4. **Headers de sécurité configurés** ✅
   - Headers de sécurité dans `netlify.toml`
   - Protection contre XSS, clickjacking, etc.

## 🛠️ Installation du plugin Next.js

Netlify nécessite le plugin officiel Next.js pour gérer correctement les API Routes :

```bash
npm install --save-dev @netlify/plugin-nextjs
```

## 📝 Configuration des variables d'environnement

### Variables requises

Dans le dashboard Netlify → Site settings → Environment variables, ajoutez :

```env
# OpenWeatherMap (requis)
OPENWEATHER_API_KEY=votre_cle_openweather

# Météo-France (requis)
METEOFRANCE_CLIENT_ID=votre_client_id
METEOFRANCE_CLIENT_SECRET=votre_client_secret
```

### Variables optionnelles

```env
# Google Analytics (optionnel)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### ⚠️ Important : Sécurité

- **NE JAMAIS** commiter les clés API dans Git
- Utiliser uniquement le dashboard Netlify pour les variables d'environnement
- Les variables commençant par `NEXT_PUBLIC_` sont exposées au client (utiliser avec précaution)

## 🚀 Déploiement

### Méthode 1 : Via l'interface Netlify (recommandé)

1. **Connecter votre dépôt Git**
   - Allez sur [app.netlify.com](https://app.netlify.com)
   - Cliquez sur "Add new site" → "Import an existing project"
   - Sélectionnez votre fournisseur Git (GitHub, GitLab, Bitbucket)
   - Autorisez Netlify à accéder à votre compte
   - Choisissez le dépôt `GwadaSVG`

2. **Configurer le build**
   - **Base directory** : `/` (racine du projet)
   - **Build command** : `npm run build`
   - **Publish directory** : `.next` (géré automatiquement par le plugin Next.js)

3. **Ajouter les variables d'environnement**
   - Dans "Site settings" → "Environment variables"
   - Ajoutez toutes les variables listées ci-dessus

4. **Déployer**
   - Cliquez sur "Deploy site"
   - Netlify va installer les dépendances, builder le projet et le déployer

### Méthode 2 : Via Netlify CLI

```bash
# Installer Netlify CLI globalement
npm install -g netlify-cli

# Se connecter à Netlify
netlify login

# Initialiser le site (première fois)
netlify init

# Déployer
netlify deploy --prod
```

## 🔧 Configuration avancée

### Timeouts des fonctions

Par défaut, Netlify limite les fonctions serverless à :
- **Plan gratuit** : 10 secondes
- **Plan Pro** : 26 secondes

Si vous rencontrez des timeouts sur `/api/weather` (qui fait 33 appels en parallèle), vous pouvez :

1. **Upgrader vers le plan Pro** (26s de timeout)
2. **Optimiser les appels API** (réduire le nombre de communes ou augmenter le cache)

### Cache

Le système de cache utilise un cache mémoire local sur Netlify. Chaque fonction serverless a son propre cache, ce qui est suffisant pour la plupart des cas d'usage.

Si vous avez besoin d'un cache partagé entre toutes les instances, vous pouvez :
- Utiliser Netlify Edge Functions (plan Pro)
- Intégrer un service externe (Redis, Upstash, etc.)

### Configuration du scan de secrets

Netlify scanne automatiquement votre code pour détecter les secrets exposés. Si vous recevez une erreur concernant `METEOFRANCE_TOKEN_URL` :

**Solution 1 (recommandée)** : Le code utilise maintenant une variable d'environnement. Assurez-vous que :
- La variable `METEOFRANCE_TOKEN_URL` est configurée dans le dashboard Netlify
- Le code source n'a plus de valeurs en dur (déjà corrigé dans `lib/api-clients.ts`)

**Solution 2** : Exclure les fichiers de documentation du scan (car ils contiennent des exemples) :
- Dans le dashboard Netlify : Site settings → Environment variables
- Ajoutez : `SECRETS_SCAN_OMIT_PATHS` = `docs/**`

**Solution 3** : Ignorer spécifiquement la clé `METEOFRANCE_TOKEN_URL` :
- Dans le dashboard Netlify : Site settings → Environment variables
- Ajoutez : `SECRETS_SCAN_OMIT_KEYS` = `METEOFRANCE_TOKEN_URL`

Note : L'URL du token Météo-France (`https://portail-api.meteofrance.fr/token`) est une URL publique documentée, pas un secret. Le scan la détecte car elle correspond à une variable d'environnement configurée.

## 🧪 Tester le déploiement

Après le déploiement, testez les endpoints :

```bash
# Qualité de l'air
curl https://votre-site.netlify.app/api/air-quality

# Météo
curl https://votre-site.netlify.app/api/weather

# Prévisions
curl https://votre-site.netlify.app/api/forecast/97105

# Vigilance
curl https://votre-site.netlify.app/api/vigilance

# Tours d'eau
curl https://votre-site.netlify.app/api/water-cuts
```

## 🔍 Vérification de la sécurité

### Checklist post-déploiement

- [ ] Le site est accessible en HTTPS (automatique sur Netlify)
- [ ] Les variables d'environnement sont bien configurées
- [ ] Aucune clé API n'est visible dans le code source du site (inspecter le code compilé)
- [ ] Les headers de sécurité sont présents (vérifier avec [securityheaders.com](https://securityheaders.com))
- [ ] Les API Routes fonctionnent correctement
- [ ] Le cache fonctionne (vérifier les logs Netlify)

### Vérifier les headers de sécurité

```bash
curl -I https://votre-site.netlify.app
```

Vous devriez voir :
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 🐛 Dépannage

### Erreur "OPENWEATHER_API_KEY non configurée"

- Vérifier que la variable est bien définie dans Netlify Dashboard
- Redéployer le site après avoir ajouté la variable

### Erreur de timeout sur /api/weather

- L'endpoint fait 33 appels API en parallèle
- Vérifier les logs Netlify pour voir où ça bloque
- Considérer upgrader vers le plan Pro (26s de timeout)

### Erreur "Module not found" lors du build

- Vérifier que `@netlify/plugin-nextjs` est installé
- Vérifier que `package.json` contient toutes les dépendances

### Le cache ne fonctionne pas

- Normal : le cache mémoire est réinitialisé à chaque déploiement
- Le cache fonctionne pendant la durée de vie d'une fonction serverless
- Pour un cache persistant, utiliser un service externe

## 📊 Monitoring

### Logs Netlify

- Dashboard Netlify → Site → Functions → Logs
- Permet de voir les erreurs et les performances des API Routes

### Analytics

- Dashboard Netlify → Site → Analytics
- Statistiques de trafic, fonctions les plus utilisées, etc.

## 🔄 Déploiements automatiques

Netlify déploie automatiquement à chaque push sur la branche principale.

Pour configurer des branches spécifiques :
- Dashboard Netlify → Site settings → Build & deploy → Continuous Deployment
- Ajouter des branches à surveiller

## 📚 Ressources

- [Documentation Netlify](https://docs.netlify.com/)
- [Plugin Next.js Netlify](https://github.com/netlify/netlify-plugin-nextjs)
- [Next.js sur Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)

## ✅ Résumé des fichiers modifiés pour Netlify

- ✅ `netlify.toml` - Configuration Netlify créée
- ✅ `app/tours-deau/page.tsx` - Référence backend corrigée
- ✅ `app/page.client.tsx` - Référence backend corrigée
- ✅ `lib/cache.ts` - Déjà compatible (fallback mémoire)

Tout est prêt pour le déploiement ! 🎉
