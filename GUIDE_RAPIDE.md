# ⚡ Guide Rapide - Données Météo par Commune

## 🎉 C'est Fait !

Votre application dispose maintenant de **données météo complètes et précises** pour chaque commune de Guadeloupe via OpenWeather API.

---

## 🚀 Démarrage Rapide

### 1️⃣ Démarrer le Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```
➜ API disponible sur http://127.0.0.1:8000

### 2️⃣ Démarrer le Frontend
```bash
cd frontend
npm run dev
```
➜ Application disponible sur http://localhost:3000

### 3️⃣ Voir la Météo
Ouvrez : http://localhost:3000/meteo

---

## ✅ Ce Qui Est Nouveau

### 📍 33 Communes (+ Saint-Martin)
Coordonnées géographiques précises extraites du GeoJSON officiel.

### 🌡️ 15+ Informations par Commune
- Température (actuelle, ressentie, min, max)
- Humidité + **Point de rosée** 🆕
- Vent (vitesse, direction) + **Rafales** 🆕
- Nébulosité + **Visibilité** 🆕
- **Précipitations** (1h et 3h) 🆕
- **Indice UV** avec interprétation 🆕
- **Lever/coucher du soleil** 🆕

### 📅 Prévisions 5 Jours 🆕
Nouveau endpoint : `GET /api/forecast/{code_zone}`
- Prévisions horaires (toutes les 3h)
- Probabilité de précipitations
- Quantité de pluie prévue

### 🎨 Interface Améliorée
Tooltip enrichi avec toutes les nouvelles informations, affichage conditionnel et icônes.

---

## 🧪 Tester

```bash
./test_meteo_improvements.py
```

**Résultat attendu :** 4/4 tests réussis ✅

---

## 📡 Endpoints API

### Météo Actuelle
```bash
curl http://127.0.0.1:8000/api/weather
```

### Prévisions (ex: Les Abymes)
```bash
curl http://127.0.0.1:8000/api/forecast/97101
```

### Vigilance
```bash
curl http://127.0.0.1:8000/api/vigilance
```

### Documentation Interactive
http://127.0.0.1:8000/docs

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| `README_METEO.md` | 📚 Guide complet d'utilisation |
| `AMELIORATIONS_METEO.md` | 🔧 Documentation technique |
| `RESUME_MODIFICATIONS.md` | 📋 Synthèse des changements |
| `GUIDE_RAPIDE.md` | ⚡ Ce document |

---

## 💡 Exemples d'Utilisation

### Sur la Page Météo

1. **Voir une commune**
   - Survolez n'importe quelle commune sur la carte
   - Le tooltip affiche toutes les informations météo

2. **Rafraîchir les données**
   - Cliquez sur "🔄 Rafraîchir"
   - Les données sont automatiquement rafraîchies toutes les 15 min

3. **Vérifier la vigilance**
   - Le panneau de droite affiche le niveau de vigilance
   - Chaque commune est colorée selon ce niveau

### Via l'API

```bash
# Météo de toutes les communes
curl http://127.0.0.1:8000/api/weather | jq '.["97101"]'

# Prévisions pour Pointe-à-Pitre
curl http://127.0.0.1:8000/api/forecast/97120 | jq '.daily | keys'

# Niveau de vigilance
curl http://127.0.0.1:8000/api/vigilance | jq '{level, label, color}'
```

---

## 🎯 Points Clés

### Pour l'Utilisateur
- ✅ Plus d'informations (15+ données par commune)
- ✅ Prévisions disponibles (5 jours)
- ✅ Indice UV pour protection solaire
- ✅ Lever/coucher pour planification
- ✅ Précipitations en temps réel
- ✅ Rafales pour sécurité

### Pour le Développeur
- ✅ 33 communes avec coordonnées précises
- ✅ Backend enrichi avec nouvelles données
- ✅ Frontend mis à jour avec tooltip amélioré
- ✅ Nouveau endpoint prévisions
- ✅ Tests automatisés (100% réussite)
- ✅ Documentation complète

---

## 📊 Codes Communes

| Code | Commune | Code | Commune |
|------|---------|------|---------|
| 97101 | Les Abymes | 97119 | Petit-Canal |
| 97102 | Anse-Bertrand | 97120 | Pointe-à-Pitre |
| 97103 | Baie-Mahault | 97121 | Pointe-Noire |
| 97104 | Baillif | 97122 | Port-Louis |
| 97105 | Basse-Terre | 97124 | Saint-Claude |
| 97106 | Bouillante | 97125 | Saint-François |
| 97107 | Capesterre-Belle-Eau | 97126 | Saint-Louis |
| 97108 | Capesterre-de-Marie-Galante | 97128 | Sainte-Anne |
| 97109 | Gourbeyre | 97129 | Sainte-Rose |
| 97110 | La Désirade | 97130 | Terre-de-Bas |
| 97111 | Deshaies | 97131 | Terre-de-Haut |
| 97112 | Grand-Bourg | 97132 | Trois-Rivières |
| 97113 | Le Gosier | 97133 | Vieux-Fort |
| 97114 | Goyave | 97134 | Vieux-Habitants |
| 97115 | Lamentin | 97801 | **Saint-Martin** 🆕 |
| 97116 | Morne-à-l'Eau | | |
| 97117 | Le Moule | | |
| 97118 | Petit-Bourg | | |

---

## 🔍 Vérification Rapide

### Backend fonctionne ?
```bash
curl http://127.0.0.1:8000/api/weather | jq 'keys | length'
```
➜ Doit afficher : `33`

### Frontend accessible ?
```bash
curl -I http://localhost:3000/meteo
```
➜ Doit retourner : `200 OK`

### Toutes les fonctionnalités OK ?
```bash
./test_meteo_improvements.py
```
➜ Doit afficher : `🎉 Toutes les améliorations fonctionnent correctement ! 🎉`

---

## 🆘 Problèmes Courants

### Backend ne démarre pas
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Port 8000 déjà utilisé
```bash
# Trouver le processus
lsof -i :8000

# Ou utiliser un autre port
uvicorn main:app --port 8001
```

### Données météo vides
- Vérifiez votre connexion internet
- Attendez quelques secondes (appels API en cours)
- Vérifiez les logs backend

### Frontend ne se connecte pas au backend
- Vérifiez que le backend est démarré
- Vérifiez l'URL dans le code : `http://127.0.0.1:8000`

---

## 🏆 Résultat Final

**✅ OBJECTIF ATTEINT**

Les données météo par commune sont maintenant :
- **COMPLÈTES** → 15+ informations par commune
- **PRÉCISES** → Coordonnées à 6 décimales
- **UTILES** → UV, prévisions, précipitations, lever/coucher
- **FIABLES** → Cache, gestion d'erreurs
- **RAPIDES** → < 3 secondes pour 33 communes

---

## 📞 Support

- 📚 Documentation complète → `README_METEO.md`
- 🔧 Détails techniques → `AMELIORATIONS_METEO.md`
- 📋 Résumé des modifications → `RESUME_MODIFICATIONS.md`

---

**Bon développement ! 🚀**

*Pour la Guadeloupe 🇬🇵*
