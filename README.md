# Gwad'Alerte

Application web interactive pour visualiser en temps réel les données environnementales de la Guadeloupe : qualité de l'air, météo, vigilance et tours d'eau.

## 🎯 Vue d'ensemble

Gwad'Alerte est un tableau de bord citoyen qui centralise les informations essentielles pour les habitants de la Guadeloupe :
- **Qualité de l'air** : Indice ATMO, polluants et recommandations sanitaires
- **Météo & Vigilance** : Prévisions par commune, alertes météorologiques et vigilance cyclonique
- **Tours d'eau** : Planning des coupures d'eau programmées par la SMGEAG

## 🏗️ Structure du projet

```
GwadaSVG/
├── app/                # Pages et composants Next.js
│   ├── api/           # API Routes serverless
│   │   ├── air-quality/   # Qualité de l'air (Gwad'Air)
│   │   ├── meteo/         # Météo actuelle et prévisions (Open-Meteo)
│   │   │   ├── current/   # Météo actuelle
│   │   │   └── forecast/  # Prévisions 3 jours
│   │   ├── vigilance/     # Vigilance météo (Météo-France)
│   │   └── water-cuts/    # Tours d'eau (SMGEAG)
│   ├── components/    # Composants réutilisables
│   ├── meteo/         # Page météo
│   ├── qualite-air/   # Page qualité de l'air
│   └── tours-deau/    # Page tours d'eau
├── lib/               # Utilitaires et clients API
│   ├── weather-codes.ts  # Mapping codes météo WMO
│   ├── cache.ts          # Système de cache
│   ├── api-clients.ts    # Clients API partagés
│   └── data/             # Données statiques (tours-deau.json)
├── public/            # Assets statiques (cartes SVG)
├── components/        # Composants UI réutilisables (Radix UI)
└── CHANGELOG_METEO.md # Historique des améliorations météo
```

## 🚀 Déploiement sur Vercel

Le projet est optimisé pour Vercel. Pour déployer :

1. **Connecter votre dépôt Git à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Importez votre dépôt GitHub/GitLab/Bitbucket

2. **Configurer les variables d'environnement**
   - Dans Vercel Dashboard → Settings → Environment Variables
   - Ajoutez : `METEOFRANCE_CLIENT_ID`, `METEOFRANCE_CLIENT_SECRET`
   - **Note** : Open-Meteo ne nécessite PAS de clé API ! 🎉

3. **Déployer**
   - Vercel détecte automatiquement Next.js
   - Le build se lance automatiquement à chaque push

4. **Optionnel : Ajouter Vercel KV pour le cache**
   - Dashboard → Storage → Create Database → KV
   - Lier au projet (les variables sont ajoutées automatiquement)

Pour plus de détails, consultez [MIGRATION.md](MIGRATION.md).

## 🚀 Installation locale

### Prérequis

- Node.js 18+
- npm ou yarn

### Configuration des variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Météo-France (pour la vigilance météo uniquement)
# Obtenez vos credentials sur : https://portail-api.meteofrance.fr/
METEOFRANCE_CLIENT_ID=votre_client_id
METEOFRANCE_CLIENT_SECRET=votre_client_secret
```

**Note importante** :
- ✅ **Open-Meteo** : Gratuit, sans clé API nécessaire !
- ✅ **Gwad'Air** : API publique, sans clé API
- ⚙️ **Météo-France** : Credentials nécessaires uniquement pour la vigilance

Pour créer le fichier rapidement :
```bash
touch .env.local
# Puis éditez .env.local avec vos credentials Météo-France
```

### Installation et lancement

```bash
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

**API Routes disponibles :**
- `GET /api/air-quality` - Données qualité de l'air (Gwad'Air)
- `GET /api/meteo/current` - Météo actuelle par commune (Open-Meteo) 🆕
- `GET /api/meteo/forecast` - Prévisions 3 jours (Open-Meteo) 🆕
- `GET /api/meteo/forecast?code_zone=97105` - Prévisions pour une commune spécifique
- `GET /api/vigilance` - Niveau de vigilance météo (Météo-France)
- `GET /api/water-cuts` - Planning des tours d'eau (SMGEAG)

## 📦 Technologies utilisées

### Backend (API Routes Next.js)
- **Next.js API Routes** - API serverless intégrée
- **Vercel KV** - Cache Redis managé (optionnel, fallback mémoire en local)
- **Cache intelligent** - Optimisation des appels API avec TTL

### Frontend
- **Next.js 16** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides
- **Lucide React** - Icônes modernes
- **next-themes** - Support du mode sombre/clair
- **Radix UI** - Composants accessibles (Tabs, Scroll Area)

### Données
- **Cartes SVG interactives** - Visualisation géographique
- **32 communes** - Couverture complète de la Guadeloupe

## 📝 Fonctionnalités

### 🏠 Page d'accueil
- Dashboard global avec vue d'ensemble
- Alertes en temps réel (qualité de l'air dégradée)
- Navigation vers les différentes sections
- Design moderne avec animations

### 🌬️ Qualité de l'air
- **Carte interactive** : Visualisation de l'indice ATMO par commune
- **Données en temps réel** : Mise à jour automatique depuis Gwad'Air
- **Détails par commune** : Polluants, recommandations sanitaires
- **Guides éducatifs** : Comprendre l'indice ATMO et les polluants
- **Cache intelligent** : Données mises en cache pour performance optimale

### 🌤️ Météo & Vigilance
- **Carte météo interactive** : Températures, conditions par commune
- **Prévisions 3 jours** : Onglets Aujourd'hui / Demain / 3 jours
- **Prévisions horaires détaillées** : 9 métriques par heure (température, ressenti, précipitations, vent, humidité, nébulosité, etc.)
- **Scroll horizontal** : Navigation fluide des prévisions horaires (mobile & desktop)
- **Vigilance météo** : Niveaux officiels (Vert, Jaune, Orange, Rouge, Violet, Gris)
- **Alertes cycloniques** : Guide éducatif sur la vigilance cyclonique
- **Données multi-sources** : Open-Meteo (météo) + Météo-France (vigilance)
- **Micro-climats** : Adaptation au relief guadeloupéen
- **Design uniformisé** : Interface cohérente entre vue Archipel et Commune

### 💧 Tours d'eau
- **Planning interactif** : Carte des coupures programmées
- **Filtres temporels** : Aujourd'hui, demain, semaine
- **Détails par commune** : Horaires et zones impactées
- **Données SMGEAG** : Informations officielles

### 🎨 Interface utilisateur
- **Mode sombre/clair** : Adaptation automatique au système
- **Design responsive** : Optimisé mobile, tablette et desktop
- **Cartes SVG interactives** : Survol et sélection des communes
- **Sidebars contextuelles** : Informations détaillées selon la sélection
- **Animations fluides** : Expérience utilisateur soignée
- **Accessibilité** : Conforme WCAG 2.1 AA (attributs ARIA, navigation clavier)

## 🔧 Développement

### Structure des composants

**Composants principaux :**
- `app/components/GuadeloupeMap.tsx` - Carte SVG principale
- `app/components/HomeDashboard.tsx` - Dashboard d'accueil
- `app/components/Navbar.tsx` - Navigation principale avec widget vigilance
- `app/components/Footer.tsx` - Pied de page
- `app/components/BackgroundSlider.tsx` - Carrousel d'images de fond

**Composants météo :**
- `app/meteo/components/HourlyForecastCard.tsx` - Carte de prévision horaire détaillée
- `app/meteo/components/ForecastDayView.tsx` - Vue des prévisions par jour
- `app/meteo/components/MeteoCommuneView.tsx` - Vue météo par commune
- `app/meteo/components/MeteoGlobalView.tsx` - Vue météo globale (Archipel)
- `app/meteo/components/VigilanceSection.tsx` - Section vigilance météo
- `app/meteo/components/CyclonicVigilanceGuide.tsx` - Guide vigilance cyclonique

**Hooks de données :**
- `app/hooks/useAirData.ts` - Hook pour les données qualité de l'air
- `app/meteo/hooks/useMeteoData.ts` - Hook pour les données météo actuelles (Open-Meteo)
- `app/meteo/hooks/useMeteoForecast.ts` - Hook pour les prévisions 3 jours
- `app/meteo/hooks/useForecastLogic.ts` - Logique de filtrage des prévisions
- `app/hooks/useWaterData.ts` - Hook pour les tours d'eau

### Cache et performance

L'application utilise un système de cache intelligent optimisé pour Open-Meteo :
- **Qualité de l'air** : Cache de 3 minutes (TTL)
- **Météo actuelle** : Cache de 15 minutes (Open-Meteo) 🆕
- **Prévisions** : Cache de 3 heures
- **Vigilance** : Cache de 10 minutes (Météo-France)
- **Tours d'eau** : Cache de 24 heures

En production (Vercel), le cache utilise Vercel KV (Redis). En développement local, un cache mémoire est utilisé automatiquement.

Le frontend utilise également le localStorage pour mettre en cache les données côté client.

### Codes météo WMO

Les conditions météo sont basées sur les codes WMO (World Meteorological Organization) utilisés par Open-Meteo. Le mapping vers les icônes et descriptions françaises est dans `lib/weather-codes.ts`.

## 📚 Documentation

**Fichiers de documentation disponibles :**
- [CHANGELOG_METEO.md](CHANGELOG_METEO.md) - Historique des améliorations de la page météo
- [MIGRATION.md](MIGRATION.md) - Guide de migration FastAPI → Next.js API Routes
- [DEPLOIEMENT_VERCEL.md](DEPLOIEMENT_VERCEL.md) - Guide de déploiement sur Vercel
- [DEPLOIEMENT_NETLIFY.md](DEPLOIEMENT_NETLIFY.md) - Guide de déploiement sur Netlify

## 🌐 Sources de données

| Source | Données | Clé API |
|--------|---------|---------|
| **[Open-Meteo](https://open-meteo.com/)** | Météo actuelle, prévisions 3 jours | ❌ Non requise (gratuit) |
| **[Météo-France](https://portail-api.meteofrance.fr/)** | Vigilance météo officielle | ✅ Requise |
| **[Gwad'Air](https://gwadair.fr/)** | Qualité de l'air (ATMO) | ❌ Non requise |
| **SMGEAG** | Tours d'eau | ❌ Non requise |

## 📄 Licence

Ce projet est en cours de développement. Les fonctionnalités sont ajoutées progressivement.


## 🎯 Dernières améliorations

### Décembre 2024
- ✅ **Prévisions horaires enrichies** : 9 métriques par heure (température, ressenti, précipitations, vent, humidité, nébulosité)
- ✅ **Design uniformisé** : Interface cohérente entre vue Archipel et Commune
- ✅ **Correction onglet "3 jours"** : Affiche maintenant uniquement les prévisions de J+3
- ✅ **Accessibilité améliorée** : Conformité WCAG 2.1 AA avec attributs ARIA et navigation clavier
- ✅ **Scroll horizontal optimisé** : Navigation fluide des prévisions horaires sur mobile et desktop

Pour plus de détails, consultez [CHANGELOG_METEO.md](CHANGELOG_METEO.md).

---

*Dernière mise à jour : Décembre 2024 - Prévisions horaires enrichies et améliorations UX*
