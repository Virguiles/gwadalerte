# Informations disponibles via l'API Météo France

## 📊 Vue d'ensemble

L'API Météo France (portail-api.meteofrance.fr) fournit un accès gratuit à de nombreuses données météorologiques publiques depuis le 1er janvier 2024. Voici les informations que vous pouvez intégrer sur votre site.

---

## ✅ Déjà implémenté sur votre site

### 1. **Vigilance Météo** (`/api/vigilance`)
- ✅ **Niveau de vigilance** : Vert, Jaune, Orange, Rouge
- ✅ **Phénomènes surveillés** :
  - Vent
  - Pluie-inondation
  - Orages
  - Crues
  - Neige-verglas
  - Canicule
  - Grand froid
  - Avalanches
  - Vagues-submersion
  - Mer-houle
- ✅ **Niveau par phénomène** : Code couleur pour chaque risque
- ✅ **Date de mise à jour** : Horodatage du dernier bulletin

**Endpoint utilisé :**
```
GET https://public-api.meteofrance.fr/public/DPVigilance/v1/vigilanceom/flux/dernier
```

---

## 🆕 Informations supplémentaires disponibles (non encore implémentées)

### 2. **Prévisions météorologiques**

#### 2.1. Prévisions à court terme (jusqu'à 7 jours)
- **Températures** : Min/Max par jour
- **Conditions météo** : Description détaillée (ensoleillé, nuageux, pluvieux, etc.)
- **Probabilité de précipitations** : Pourcentage de chance de pluie
- **Quantité de précipitations** : En mm
- **Vent** : Vitesse et direction
- **Humidité** : Pourcentage
- **Pression atmosphérique** : En hPa
- **Indice UV** : Niveau d'exposition aux UV
- **Visibilité** : En km
- **Point de rosée** : Température

**Endpoints possibles :**
- Prévisions horaires (24h)
- Prévisions journalières (7 jours)
- Prévisions détaillées par commune

#### 2.2. Prévisions à moyen terme (7-15 jours)
- Tendances météo générales
- Évolutions des températures
- Risques de précipitations

---

### 3. **Observations en temps réel**

#### 3.1. Données d'observation actuelles
- **Température actuelle** : Mesurée toutes les 6 minutes
- **Température ressentie** : Indice de refroidissement éolien
- **Humidité relative** : Pourcentage
- **Pression atmosphérique** : En hPa
- **Vitesse et direction du vent** : En km/h et degrés
- **Rafales de vent** : Vitesse maximale
- **Précipitations** : Cumul horaire et journalier
- **Visibilité** : En km
- **Point de rosée** : Température
- **Indice UV** : Niveau actuel
- **Ensoleillement** : Durée et intensité
- **Nébulosité** : Pourcentage de couverture nuageuse

**Fréquence de mise à jour :** Toutes les 6 minutes

**Endpoints possibles :**
- Observations d'une station météo spécifique
- Observations par coordonnées GPS
- Observations par code INSEE (commune)

---

### 4. **Données climatologiques historiques**

#### 4.1. Données quotidiennes
- Températures min/max/moyenne
- Précipitations journalières
- Ensoleillement
- Vitesse du vent moyenne

#### 4.2. Données horaires
- Observations détaillées heure par heure
- Évolution des conditions météo sur 24h

#### 4.3. Données mensuelles
- Statistiques mensuelles agrégées
- Comparaisons avec les normales saisonnières

#### 4.4. Données à haute fréquence (toutes les 6 minutes)
- Observations très détaillées pour analyses précises

**Période couverte :** Plusieurs décennies de données historiques

---

### 5. **Données radar de précipitations**

#### 5.1. Images radar en temps réel
- **Carte des précipitations** : Visualisation des zones de pluie
- **Intensité des précipitations** : Légère, modérée, forte
- **Déplacement des précipitations** : Animation des systèmes pluvieux
- **Prévisions radar** : Extrapolation à court terme (1-3h)

**Couverture :** 95% du territoire français avec 33 radars

**Utilisation possible :**
- Carte interactive des précipitations en temps réel
- Animation des systèmes pluvieux
- Alertes précipitations pour la Guadeloupe

---

### 6. **Données marines (spécifique aux DOM)**

#### 6.1. Conditions marines
- **État de la mer** : Hauteur des vagues
- **Houle** : Hauteur et période
- **Courants marins** : Vitesse et direction
- **Température de l'eau** : En surface
- **Visibilité en mer** : En km
- **Conditions de navigation** : Avis aux navigateurs

**Utile pour :** La Guadeloupe (zone maritime importante)

---

### 7. **Avertissements et alertes**

#### 7.1. Bulletins d'alerte
- **Bulletins de vigilance détaillés** : Plus d'informations que la vigilance de base
- **Avertissements spécifiques** : Par type de phénomène
- **Consignes de sécurité** : Recommandations officielles
- **Zones géographiques précises** : Par commune ou secteur

#### 7.2. Bulletins météo régionaux
- **Bulletins quotidiens** : Synthèse météo de la journée
- **Bulletins hebdomadaires** : Tendances de la semaine
- **Bulletins saisonniers** : Prévisions à long terme

---

### 8. **Indices et indicateurs**

#### 8.1. Indice UV
- **Niveau UV actuel** : 0-11+
- **Recommandations** : Protection solaire nécessaire
- **Prévisions UV** : Pour les prochaines heures

#### 8.2. Indice de confort
- **Indice de confort thermique** : Sensation de chaleur/froid
- **Indice de confort humidex** : Chaleur humide
- **Indice de confort vent** : Refroidissement éolien

#### 8.3. Indice de qualité de l'air (si disponible)
- **Qualité de l'air** : Bon, moyen, dégradé, etc.
- **Polluants** : Concentrations si disponibles

---

### 9. **Données spécifiques aux DOM (Guadeloupe)**

#### 9.1. Vigilance outre-mer
- ✅ **Déjà implémenté** : Vigilance générale
- **Vigilance par zone** : Zones spécifiques de la Guadeloupe
  - VIGI971-01 : Zone spécifique 1
  - VIGI971-51 à VIGI971-61 : Autres zones

#### 9.2. Bulletins météo DOM
- **Bulletins spécifiques** : Adaptés aux conditions tropicales
- **Cyclones et tempêtes tropicales** : Suivi et prévisions
- **Saisons des pluies** : Prévisions saisonnières

---

## 🔧 Endpoints API Météo France disponibles

### Base URL
```
https://public-api.meteofrance.fr/public/
```

### Endpoints principaux (à vérifier dans la documentation officielle)

1. **Vigilance**
   - `/DPVigilance/v1/vigilanceom/flux/dernier` ✅ (déjà utilisé)

2. **Prévisions**
   - `/DPPrev/v1/previsions` (prévisions générales)
   - `/DPPrev/v1/previsions/{code_insee}` (prévisions par commune)

3. **Observations**
   - `/DPObs/v1/observations` (observations en temps réel)
   - `/DPObs/v1/observations/{code_insee}` (observations par commune)

4. **Données climatologiques**
   - `/DPClim/v1/donnees` (données historiques)

5. **Radar**
   - `/DPRadar/v1/images` (images radar)

6. **Marine**
   - `/DPMarine/v1/conditions` (conditions marines)

---

## 💡 Suggestions d'intégration pour votre site

### Priorité 1 : Prévisions météo (remplacer OpenWeatherMap)
- **Avantage** : Données officielles françaises, plus précises pour la Guadeloupe
- **Données** : Prévisions 7 jours avec détails horaires
- **Affichage** : Graphiques de températures, probabilités de pluie, vent

### Priorité 2 : Observations en temps réel
- **Avantage** : Données toutes les 6 minutes (plus fraîches que OpenWeatherMap)
- **Données** : Température, humidité, vent, précipitations actuelles
- **Affichage** : Mise à jour en temps réel sur la carte

### Priorité 3 : Données radar de précipitations
- **Avantage** : Visualisation des zones de pluie en temps réel
- **Données** : Carte des précipitations, animation
- **Affichage** : Overlay sur la carte de la Guadeloupe

### Priorité 4 : Données marines
- **Avantage** : Très utile pour la Guadeloupe (zone maritime)
- **Données** : État de la mer, houle, température de l'eau
- **Affichage** : Section dédiée aux conditions marines

### Priorité 5 : Indices UV et confort
- **Avantage** : Informations utiles pour les activités extérieures
- **Données** : Indice UV, indices de confort
- **Affichage** : Widgets dans les tooltips des communes

---

## 📚 Documentation officielle

- **Portail API** : https://portail-api.meteofrance.fr/
- **Documentation Confluence** : https://confluence-meteofrance.atlassian.net/wiki/spaces/OpenDataMeteoFrance/
- **API DonneesPubliquesVigilance** : https://portail-api.meteofrance.fr/web/fr/api/DonneesPubliquesVigilance

---

## 🔑 Authentification

Votre site utilise déjà l'authentification OAuth 2.0 :
- **Client ID** : Configuré via la variable d'environnement `METEOFRANCE_CLIENT_ID`
- **Client Secret** : Configuré via la variable d'environnement `METEOFRANCE_CLIENT_SECRET`
- **Token endpoint** : Configuré via la variable d'environnement `METEOFRANCE_TOKEN_URL` (par défaut: `https://portail-api.meteofrance.fr/token`)

Le token est déjà généré automatiquement dans `get_meteofrance_token()`.

⚠️ **Important** : Les clés API doivent être configurées dans un fichier `.env` dans le dossier `backend/`. Voir `VIGILANCE_METEOFRANCE.md` pour plus de détails.

---

## ⚠️ Limitations et quotas

- **Limite d'appels** : Généralement 50 requêtes par minute
- **Cache recommandé** : Mettre en cache les données pour éviter les appels répétés
- **Données en temps réel** : Mises à jour toutes les 6 minutes
- **Données de prévision** : Mises à jour plusieurs fois par jour

---

## 📝 Notes importantes

1. **Gratuité** : Toutes ces données sont gratuites depuis le 1er janvier 2024
2. **Réutilisation libre** : Les données peuvent être réutilisées librement
3. **Précision** : Les données Météo France sont plus précises pour la France et les DOM que les services internationaux
4. **Spécificités DOM** : Certaines APIs sont spécifiquement adaptées aux départements d'outre-mer

---

Créé le 8 novembre 2025
