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

Dans le dashboard Netlify → Site settings → Environment variables, ajoutez toutes les variables d'environnement nécessaires au fonctionnement de l'application.

Consultez la documentation du projet pour la liste complète des variables requises et optionnelles.

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
   - Ajoutez toutes les variables d'environnement nécessaires (voir section Configuration des variables d'environnement)

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

Netlify scanne automatiquement votre code pour détecter les secrets exposés. Si vous recevez des alertes :

**Solution 1 (recommandée)** : Assurez-vous que toutes les valeurs sensibles utilisent des variables d'environnement et qu'aucune valeur n'est hardcodée dans le code source.

**Solution 2** : Exclure les fichiers de documentation du scan (car ils peuvent contenir des exemples) :
- Dans le dashboard Netlify : Site settings → Environment variables
- Ajoutez : `SECRETS_SCAN_OMIT_PATHS` = `docs/**`

**Solution 3** : Si nécessaire, ignorer des clés spécifiques dans le scan :
- Dans le dashboard Netlify : Site settings → Environment variables
- Ajoutez : `SECRETS_SCAN_OMIT_KEYS` = `nom_de_la_variable`

**Note importante** : La variable `METEOFRANCE_TOKEN_URL` doit être définie dans les variables d'environnement Netlify. Cette variable contient l'URL publique de l'API Météo-France pour l'authentification OAuth2 (par défaut : `https://portail-api.meteofrance.fr/token`). Bien que cette URL soit publique, elle doit être définie via une variable d'environnement pour éviter les alertes du scanner de secrets.

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

### Erreur "Variable d'environnement non configurée"

- Vérifier que toutes les variables requises sont bien définies dans Netlify Dashboard
- Redéployer le site après avoir ajouté les variables

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
