# Intégration de la Vigilance Météo-France pour la Guadeloupe

## 🎯 Résumé

L'API de vigilance a été mise à jour pour utiliser **les données officielles de Météo-France en temps réel** pour la Guadeloupe.

### ✅ État actuel de la vigilance

**Niveau actuel : JAUNE ⚠️**

Risques identifiés :
- 🌧️ **Pluie-inondation** : Niveau 2 (Jaune)
- 💨 **Vent** : Niveau 1 (Vert)
- 🌊 **Mer-houle** : Niveau 1 (Vert)

---

## 📡 API Météo-France utilisée

### Endpoint principal
```
https://public-api.meteofrance.fr/public/DPVigilance/v1/vigilanceom/flux/dernier
```

### Authentification
L'API utilise OAuth 2.0 avec génération automatique de token :
- **Client ID** : `REDACTED_METEOFRANCE_CLIENT_ID`
- **Client Secret** : `REDACTED_METEOFRANCE_SECRET`
- **Token** : Généré automatiquement et rafraîchi toutes les heures

---

## 🔧 Comment ça marche

### 1. Génération du token
Le backend génère automatiquement un token OAuth 2.0 en appelant :
```bash
POST https://portail-api.meteofrance.fr/token
Authorization: Basic <credentials>
Content-Type: application/x-www-form-urlencoded
Body: grant_type=client_credentials
```

### 2. Téléchargement des données
Une fois le token obtenu, le backend :
1. Télécharge le fichier ZIP de vigilance outre-mer
2. Extrait le fichier `CDPV85_TFFR_.txt` (format JSON)
3. Parse les données pour la zone `VIGI971` (Guadeloupe)

### 3. Structure des données
Le fichier JSON contient :
- **update_time** : Heure de mise à jour
- **domain_ids** : Zones de vigilance
  - `VIGI971` : Guadeloupe globale
  - `VIGI971-01`, `VIGI971-51` à `VIGI971-61` : Zones spécifiques
- **phenomenon_items** : Liste des phénomènes météo avec leur niveau

### 4. Mapping des niveaux de vigilance

| Level | Couleur | Label | Signification |
|-------|---------|-------|---------------|
| -1    | Gris (#CCCCCC) | Non disponible | Pas de données |
| 0     | Vert (#28d761) | Vert | Pas de vigilance particulière |
| 1     | Vert (#28d761) | Vert | Pas de vigilance particulière |
| 2     | Jaune (#FFFF00) | Jaune | Soyez attentifs |
| 3     | Orange (#FF9900) | Orange | Soyez très vigilants |
| 4     | Rouge (#FF0000) | Rouge | Vigilance absolue |

### 5. Types de phénomènes

| ID | Type |
|----|------|
| 1  | Vent |
| 2  | Pluie-inondation |
| 3  | Orages |
| 4  | Crues |
| 5  | Neige-verglas |
| 6  | Canicule |
| 7  | Grand froid |
| 8  | Avalanches |
| 9  | Vagues-submersion |
| 10 | Mer-houle |

---

## 🚀 Utilisation

### Backend (FastAPI)

L'endpoint `/api/vigilance` est disponible à :
```
http://127.0.0.1:8000/api/vigilance
```

**Réponse JSON** :
```json
{
  "department": "971",
  "department_name": "Guadeloupe",
  "level": 2,
  "color": "#FFFF00",
  "label": "Jaune",
  "risks": [
    {"type": "Pluie-inondation", "level": 2},
    {"type": "Vent", "level": 1},
    {"type": "Mer-houle", "level": 1}
  ],
  "last_update": 1762612162.664332
}
```

### Frontend (Next.js)

Le frontend à `frontend/app/meteo/page.tsx` :
1. Appelle automatiquement `/api/vigilance` au chargement
2. Affiche la couleur de vigilance sur la carte de la Guadeloupe
3. Met à jour les tooltips avec les informations de vigilance
4. Cache les données en localStorage pour une journée

---

## ⚙️ Configuration

### Cache
- **Backend** : 2 heures (7200 secondes)
- **Frontend** : 1 jour (vérification quotidienne)

### Démarrer le serveur
```bash
cd backend
python3 -m uvicorn main:app --port 8000
```

### Tester l'API
```bash
curl http://127.0.0.1:8000/api/vigilance | jq .
```

---

## 📊 Fichiers modifiés

### Backend
- **`backend/main.py`**
  - Ajout de `get_meteofrance_token()` pour générer le token automatiquement
  - Mise à jour de l'endpoint `/api/vigilance` pour télécharger et parser le ZIP
  - Extraction des données de la zone `VIGI971`
  - Mapping des phénomènes et niveaux

### Frontend
- **`frontend/app/meteo/page.tsx`**
  - Déjà configuré pour utiliser l'endpoint `/api/vigilance`
  - Affiche la couleur de vigilance sur toute la carte
  - Affiche les informations dans les tooltips

---

## 🔗 Documentation Météo-France

- **Confluence** : https://confluence-meteofrance.atlassian.net/wiki/spaces/OpenDataMeteoFrance/pages/874741792/
- **Portail API** : https://portail-api.meteofrance.fr/
- **API DonneesPubliquesVigilance** : https://portail-api.meteofrance.fr/web/fr/api/DonneesPubliquesVigilance

---

## 📝 Notes importantes

1. **Mise à jour des données** : Les données de vigilance sont mises à jour par Météo-France plusieurs fois par jour
2. **Cache intelligent** : Le backend met en cache les données pendant 2 heures pour éviter trop d'appels API
3. **Gestion des erreurs** : En cas d'erreur API, le système retourne des valeurs par défaut (Vert) et continue de fonctionner
4. **Token automatique** : Le token est régénéré automatiquement avant expiration (marge de 5 minutes)

---

## ✅ Tests effectués

1. ✅ Génération du token OAuth 2.0
2. ✅ Téléchargement du fichier ZIP (~1.5 Mo)
3. ✅ Extraction du fichier JSON
4. ✅ Parsing des données pour VIGI971
5. ✅ Mapping des phénomènes et niveaux
6. ✅ Cache fonctionnel
7. ✅ Endpoint API fonctionnel

**Résultat actuel : Vigilance JAUNE pour pluie-inondation** ⚠️

---

## 🎨 Affichage sur la carte

La carte de la Guadeloupe (page `/meteo`) :
- **Fond de carte** : Coloré selon le niveau de vigilance global
- **Communes** : Chaque commune affiche ses données météo locales
- **Tooltip** : Affiche la vigilance + météo détaillée au survol

---

Créé le 8 novembre 2025
