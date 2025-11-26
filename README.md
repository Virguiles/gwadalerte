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
├── backend/              # API FastAPI
│   ├── main.py          # Point d'entrée de l'API
│   ├── requirements.txt # Dépendances Python
│   ├── tours-deau.json  # Données des coupures d'eau
│   └── cache/           # Cache des données API
├── frontend/            # Application Next.js
│   ├── app/            # Pages et composants
│   │   ├── components/ # Composants réutilisables
│   │   ├── meteo/      # Page météo
│   │   ├── qualite-air/# Page qualité de l'air
│   │   └── tours-deau/ # Page tours d'eau
│   └── public/         # Assets statiques (cartes SVG)
└── docs/               # Documentation technique
```

## 🚀 Installation

### Prérequis

- Python 3.8+
- Node.js 18+
- npm ou yarn

### Configuration des variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` avec les clés API suivantes :

```env
# OpenWeatherMap (pour les données météo)
OPENWEATHER_API_KEY=votre_cle_openweather

# Météo-France (pour la vigilance)
METEOFRANCE_CLIENT_ID=votre_client_id
METEOFRANCE_CLIENT_SECRET=votre_client_secret
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

L'API sera disponible sur `http://localhost:8000`

**Endpoints disponibles :**
- `GET /api/air-quality` - Données qualité de l'air (Gwad'Air)
- `GET /api/weather` - Données météo par commune (OpenWeather)
- `GET /api/forecast/{code_zone}` - Prévisions 5 jours pour une commune
- `GET /api/vigilance` - Niveau de vigilance météo (Météo-France)
- `GET /api/water-cuts` - Planning des tours d'eau (SMGEAG)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 📦 Technologies utilisées

### Backend
- **FastAPI** - Framework web moderne et performant
- **httpx** - Client HTTP asynchrone
- **python-dotenv** - Gestion des variables d'environnement
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
- **Prévisions 5 jours** : Détails horaires et résumés quotidiens
- **Vigilance météo** : Niveaux officiels (Vert, Jaune, Orange, Rouge)
- **Alertes cycloniques** : Guide éducatif sur la vigilance cyclonique
- **Données multi-sources** : OpenWeather + Météo-France
- **Micro-climats** : Adaptation au relief guadeloupéen

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

## 🔧 Développement

### Structure des composants

- `components/GuadeloupeMap.tsx` - Carte SVG principale
- `components/HomeDashboard.tsx` - Dashboard d'accueil
- `components/Navbar.tsx` - Navigation principale
- `components/Footer.tsx` - Pied de page
- `hooks/useAirData.ts` - Hook pour les données qualité de l'air
- `hooks/useMeteoData.ts` - Hook pour les données météo
- `hooks/useWaterData.ts` - Hook pour les tours d'eau

### Cache et performance

Le backend implémente un système de cache intelligent :
- **Qualité de l'air** : Cache de 3 minutes (TTL)
- **Météo** : Cache de 1 heure
- **Vigilance** : Cache de 10 minutes
- **Prévisions** : Cache de 3 heures

Le frontend utilise également le localStorage pour mettre en cache les données côté client.

## 📚 Documentation

Vous trouverez la documentation détaillée dans le dossier `docs/` :

- [Guide Météo](docs/README_METEO.md) - Documentation complète de la page météo
- [Améliorations Météo](docs/AMELIORATIONS_METEO.md) - Évolutions et améliorations
- [API Météo France](docs/INFORMATIONS_API_METEOFRANCE.md) - Intégration Météo-France
- [Vigilance Météo France](docs/VIGILANCE_METEOFRANCE.md) - Système de vigilance
- [API Gwad'Air](docs/DOCUMENTATION_API_GWADAIR.md) - Documentation API qualité de l'air

## 🌐 Sources de données

- **Gwad'Air** : Qualité de l'air (indice ATMO, polluants)
- **OpenWeatherMap** : Données météorologiques par commune
- **Météo-France** : Vigilance météo et alertes officielles
- **SMGEAG** : Planning des tours d'eau

## 📄 Licence

Ce projet est en cours de développement. Les fonctionnalités sont ajoutées progressivement.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
