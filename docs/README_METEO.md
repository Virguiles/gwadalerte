# 🌤️ Données Météo par Commune - Guadeloupe

## ✅ Améliorations Réalisées

Votre application dispose maintenant de **données météo complètes et précises** pour chaque commune de Guadeloupe via l'API OpenWeather.

### 🎯 Ce qui a été amélioré

#### 1. **Coordonnées Géographiques Précises**
- ✅ **33 communes** couvertes (incluant Saint-Martin)
- ✅ Coordonnées extraites du GeoJSON officiel
- ✅ Précision de **6 décimales** (~10 mètres)

#### 2. **Données Météo Enrichies**
Chaque commune dispose maintenant de :
- 🌡️ Températures (actuelle, ressentie, min, max)
- 💧 Humidité + **Point de rosée**
- 💨 Vent (vitesse, direction) + **Rafales**
- ☁️ Nébulosité + **Visibilité**
- 🌧️ **Précipitations** (1h et 3h)
- ☀️ **Indice UV** (avec interprétation)
- 🌅 **Lever du soleil**
- 🌇 **Coucher du soleil**

#### 3. **Prévisions Météo (5 jours)**
- Nouveau endpoint : `/api/forecast/{code_zone}`
- Prévisions horaires (toutes les 3h)
- **Probabilité de précipitations**
- Quantité de pluie prévue
- Températures min/max par jour

#### 4. **Interface Améliorée**
- Tooltip enrichi avec toutes les nouvelles données
- Affichage conditionnel (UV, rafales, pluie)
- Couleurs et icônes pour une meilleure lisibilité

---

## 🚀 Comment utiliser

### Démarrer le Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

L'API sera accessible à : http://127.0.0.1:8000

### Démarrer le Frontend

```bash
cd frontend
npm run dev
```

L'application sera accessible à : http://localhost:3000

### Page Météo

Accédez à la page météo : http://localhost:3000/meteo

**Fonctionnalités :**
- 🗺️ Carte interactive de la Guadeloupe
- 🎨 Communes colorées selon le niveau de vigilance
- 🖱️ Survolez une commune pour voir les détails météo
- 🔄 Rafraîchissement automatique toutes les 15 minutes
- 💾 Cache local pour performances optimales

---

## 📡 Endpoints API

### 1. Données Météo Actuelles

```bash
GET http://127.0.0.1:8000/api/weather
```

**Retourne :** Données météo pour les 33 communes

**Exemple de réponse :**
```json
{
  "97101": {
    "lib_zone": "Les Abymes",
    "temperature": 29.7,
    "feels_like": 34.4,
    "humidity": 70,
    "wind_speed": 20.4,
    "sunrise": "06:07",
    "sunset": "17:32",
    "uv_index": 5.0,
    "rain_1h": 0.64,
    ...
  }
}
```

### 2. Prévisions par Commune

```bash
GET http://127.0.0.1:8000/api/forecast/97101
```

**Retourne :** Prévisions 5 jours pour Les Abymes

**Exemple de réponse :**
```json
{
  "code_zone": "97101",
  "lib_zone": "Les Abymes",
  "daily": {
    "2025-11-10": {
      "temp_min": 25.3,
      "temp_max": 29.2,
      "hourly": [
        {
          "time": "14:00",
          "temperature": 29.2,
          "pop": 100,
          "rain_3h": 1.26,
          ...
        }
      ]
    }
  }
}
```

### 3. Vigilance Météo France

```bash
GET http://127.0.0.1:8000/api/vigilance
```

**Retourne :** Niveau de vigilance pour la Guadeloupe

---

## 🧪 Tests

Un script de test complet est disponible :

```bash
python3 test_meteo_improvements.py
```

**Ce script vérifie :**
- ✅ Données météo enrichies
- ✅ Prévisions 5 jours
- ✅ Vigilance Météo France
- ✅ Précision des coordonnées

**Résultat attendu :** 4/4 tests réussis (100%)

---

## 📊 Codes des Communes

| Code | Commune |
|------|---------|
| 97101 | Les Abymes |
| 97102 | Anse-Bertrand |
| 97103 | Baie-Mahault |
| 97104 | Baillif |
| 97105 | Basse-Terre |
| 97106 | Bouillante |
| 97107 | Capesterre-Belle-Eau |
| 97108 | Capesterre-de-Marie-Galante |
| 97109 | Gourbeyre |
| 97110 | La Désirade |
| 97111 | Deshaies |
| 97112 | Grand-Bourg |
| 97113 | Le Gosier |
| 97114 | Goyave |
| 97115 | Lamentin |
| 97116 | Morne-à-l'Eau |
| 97117 | Le Moule |
| 97118 | Petit-Bourg |
| 97119 | Petit-Canal |
| 97120 | Pointe-à-Pitre |
| 97121 | Pointe-Noire |
| 97122 | Port-Louis |
| 97124 | Saint-Claude |
| 97125 | Saint-François |
| 97126 | Saint-Louis |
| 97128 | Sainte-Anne |
| 97129 | Sainte-Rose |
| 97130 | Terre-de-Bas |
| 97131 | Terre-de-Haut |
| 97132 | Trois-Rivières |
| 97133 | Vieux-Fort |
| 97134 | Vieux-Habitants |
| 97801 | Saint-Martin |

---

## 🔧 Configuration

### Clé API OpenWeather

La clé API doit être configurée via une variable d'environnement dans un fichier `.env` :

```bash
OPENWEATHER_API_KEY=votre_cle_api_openweather
```

Dans `backend/main.py`, la clé est récupérée depuis les variables d'environnement :
```python
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
```

**Limites gratuites :**
- 1000 appels/jour
- 60 appels/minute
- Données actuelles + prévisions 5 jours

### Cache

Les données sont mises en cache pour optimiser les performances :
- **Météo actuelle :** 1 heure
- **Prévisions :** 3 heures
- **Vigilance :** 10 minutes
- **Cache client (frontend) :** 15 minutes

---

## 📚 Documentation Complète

Pour plus de détails sur les améliorations, consultez :
- `AMELIORATIONS_METEO.md` - Documentation technique complète
- `INFORMATIONS_API_METEOFRANCE.md` - API Météo France
- `VIGILANCE_METEOFRANCE.md` - Système de vigilance

---

## 💡 Exemples d'Utilisation

### Obtenir la météo pour Pointe-à-Pitre

```bash
curl http://127.0.0.1:8000/api/weather | jq '.["97120"]'
```

### Obtenir les prévisions pour Basse-Terre

```bash
curl http://127.0.0.1:8000/api/forecast/97105 | jq '.daily'
```

### Vérifier la vigilance

```bash
curl http://127.0.0.1:8000/api/vigilance | jq '{level, label, risks}'
```

---

## 🌐 Sources de Données

- **OpenWeather API** - Données météo et prévisions
  - https://openweathermap.org/api
  - Données en français
  - Unités métriques

- **Météo France** - Vigilance officielle
  - Bulletins pour la Guadeloupe (971)
  - Phénomènes dangereux
  - Consignes de sécurité

---

## 📞 Support

En cas de problème :

1. **Backend ne démarre pas ?**
   - Vérifiez que le venv est activé
   - Vérifiez les dépendances : `pip install -r requirements.txt`
   - Port 8000 déjà utilisé ? Changez le port

2. **Données météo non disponibles ?**
   - Vérifiez votre connexion internet
   - Vérifiez la clé API OpenWeather
   - Consultez les logs du backend

3. **Frontend ne charge pas ?**
   - Vérifiez que le backend est démarré
   - Vérifiez l'URL de l'API dans le code
   - Videz le cache navigateur

---

## ✨ Prochaines Améliorations Possibles

1. **Graphiques météo**
   - Évolution des températures
   - Graphique de précipitations
   - Rose des vents

2. **Alertes personnalisées**
   - Notifications par commune
   - Seuils configurables
   - Emails/SMS

3. **Données historiques**
   - Comparaison avec les normales
   - Statistiques mensuelles
   - Tendances annuelles

4. **Application mobile**
   - Progressive Web App (PWA)
   - Notifications push
   - Mode hors-ligne

---

**Développé avec ❤️ pour la Guadeloupe 🇬🇵**

*Date de mise à jour : 10 novembre 2025*
