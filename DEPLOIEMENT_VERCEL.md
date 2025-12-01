# 🚀 Guide de déploiement Vercel - Gwad'Alerte

Ce guide vous accompagne pour déployer Gwad'Alerte sur Vercel en toute simplicité.

## 📋 Prérequis

- Un compte Vercel (gratuit) : [https://vercel.com/signup](https://vercel.com/signup)
- Votre code sur GitHub, GitLab ou Bitbucket
- Les clés API nécessaires (voir section Variables d'environnement)

## 🔐 Sécurité - Vérifications avant déploiement

### ✅ Vérifications effectuées

1. **Variables d'environnement sécurisées** ✅
   - Toutes les clés API sont stockées dans des variables d'environnement
   - Aucune clé API n'est hardcodée dans le code
   - Le fichier `.gitignore` exclut tous les fichiers `.env*`

2. **Architecture simplifiée** ✅
   - Le projet utilise exclusivement les API Routes Next.js
   - Plus de dépendance au backend Python
   - Configuration optimisée pour Vercel

3. **Cache optimisé** ✅
   - Le système de cache utilise Vercel KV (optionnel)
   - Fallback mémoire automatique si KV n'est pas configuré
   - TTL configurés pour chaque endpoint

4. **Configuration Vercel** ✅
   - `vercel.json` configuré avec les bonnes limites
   - Headers CORS configurés
   - Crons configurés pour le préchauffage du cache

## 🚀 Déploiement

### Méthode 1 : Via l'interface Vercel (recommandé)

1. **Connecter votre dépôt Git**
   - Allez sur [vercel.com](https://vercel.com)
   - Cliquez sur "Add New Project"
   - Sélectionnez votre fournisseur Git (GitHub, GitLab, Bitbucket)
   - Autorisez Vercel à accéder à votre compte
   - Choisissez le dépôt `GwadaSVG`

2. **Configurer le projet**
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Root Directory** : `/` (racine du projet)
   - **Build Command** : `npm run build` (par défaut)
   - **Output Directory** : `.next` (géré automatiquement)

3. **Ajouter les variables d'environnement**
   - Dans "Environment Variables", ajoutez toutes les variables d'environnement nécessaires
   - Consultez la documentation du projet pour la liste complète des variables requises
   - Sélectionnez tous les environnements (Production, Preview, Development)

4. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel va installer les dépendances, builder le projet et le déployer
   - Le déploiement prend généralement 2-3 minutes

### Méthode 2 : Via Vercel CLI

```bash
# Installer Vercel CLI globalement
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer (première fois)
vercel

# Déployer en production
vercel --prod
```

## 🔧 Configuration avancée

### Ajouter Vercel KV pour le cache (recommandé en production)

1. **Créer une base de données KV**
   - Dashboard Vercel → Storage → Create Database
   - Choisir "KV" (Redis)
   - Donner un nom à votre base (ex: `gwad-alerte-kv`)

2. **Lier au projet**
   - Sélectionnez votre projet
   - Les variables de connexion KV seront automatiquement ajoutées

3. **Avantages**
   - Cache partagé entre toutes les instances serverless
   - Persistance du cache même après redéploiement
   - Meilleures performances

### Configuration des fonctions serverless

Le fichier `vercel.json` configure déjà les limites optimales :

```json
{
  "functions": {
    "app/api/weather/route.ts": {
      "memory": 512,
      "maxDuration": 30
    }
  }
}
```

Si vous rencontrez des timeouts, vous pouvez augmenter `maxDuration` (jusqu'à 60s sur le plan Pro).

### Crons (préchauffage du cache)

Des crons sont configurés pour préchauffer le cache :

- `/api/weather` : Toutes les heures
- `/api/vigilance` : Toutes les 10 minutes

Cela garantit que les données sont toujours fraîches même sans trafic.


## 🔍 Vérification de la sécurité

### Checklist post-déploiement

- [ ] Le site est accessible en HTTPS (automatique sur Vercel)
- [ ] Les variables d'environnement sont bien configurées
- [ ] Aucune clé API n'est visible dans le code source du site
- [ ] Les API Routes fonctionnent correctement
- [ ] Le cache fonctionne (vérifier les logs Vercel)

### Vérifier les headers de sécurité

```bash
curl -I https://votre-site.vercel.app
```

Vercel ajoute automatiquement les headers de sécurité nécessaires.

## 🐛 Dépannage

### Erreur "Variable d'environnement non configurée"

- Vérifier que toutes les variables requises sont bien définies dans Vercel Dashboard
- Vérifier que tous les environnements sont sélectionnés
- Redéployer le site après avoir ajouté les variables

### Erreur de timeout sur /api/weather

- L'endpoint fait 33 appels API en parallèle
- Vérifier les logs Vercel pour voir où ça bloque
- Augmenter `maxDuration` dans `vercel.json` si nécessaire
- Considérer upgrader vers le plan Pro (60s de timeout)

### Erreur "Module not found" lors du build

- Vérifier que `package.json` contient toutes les dépendances
- Vérifier que le "Root Directory" est bien configuré sur `/` (racine)

### Le cache ne fonctionne pas

- Si Vercel KV n'est pas configuré, le cache mémoire est utilisé (normal)
- Chaque fonction serverless a son propre cache mémoire
- Pour un cache partagé, configurer Vercel KV

## 📊 Monitoring

### Logs Vercel

- Dashboard Vercel → Project → Functions → Logs
- Permet de voir les erreurs et les performances des API Routes
- Filtres par fonction, date, niveau de log

### Analytics

- Dashboard Vercel → Project → Analytics
- Statistiques de trafic, fonctions les plus utilisées, etc.
- Disponible sur le plan Pro

### Real User Monitoring (RUM)

- Dashboard Vercel → Project → Speed Insights
- Métriques de performance réelles des utilisateurs

## 🔄 Déploiements automatiques

Vercel déploie automatiquement à chaque push sur la branche principale.

Pour configurer des branches spécifiques :
- Dashboard Vercel → Project → Settings → Git
- Configurer les branches à surveiller

### Preview Deployments

Chaque pull request génère automatiquement une preview URL pour tester les changements avant de merger.

## 💰 Plans et limites

### Plan Hobby (gratuit)

- 100 GB de bande passante/mois
- Fonctions serverless : 10s timeout
- Builds illimités
- Parfait pour commencer

### Plan Pro ($20/mois)

- 1 TB de bande passante/mois
- Fonctions serverless : 60s timeout
- Analytics avancés
- Support prioritaire

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Next.js sur Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)

## ✅ Résumé

Le projet est maintenant optimisé pour Vercel :

- ✅ Backend Python supprimé
- ✅ API Routes Next.js configurées
- ✅ `vercel.json` optimisé
- ✅ Variables d'environnement documentées
- ✅ Cache configuré avec fallback

Tout est prêt pour le déploiement ! 🎉
