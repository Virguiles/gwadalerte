# Documentation de l'API Gwad'Air

## 📊 Vue d'ensemble

L'API en temps réel de Gwad'Air est un service ArcGIS qui fournit les données actuelles et historiques sur la qualité de l'air en Guadeloupe et à Saint-Martin.

**URL de l'API (temps réel - recommandée):**
```
https://services8.arcgis.com/7RrxpwWeFIQ8JGGp/arcgis/rest/services/ind_guadeloupe_1/FeatureServer/0/query
```

**URL de l'ancienne API OpenData (obsolète - NE PLUS UTILISER):**
```
https://data-gwadair.opendata.arcgis.com/datasets/5deeac7ff3ae46dea837d149f7cf34f6_0.geojson
```

## 📈 Statistiques

- **Nombre de communes:** 33 (Guadeloupe) + 1 (Saint-Martin)
- **Période couverte:** Données en temps réel (mises à jour quotidiennement)
- **Format de réponse:** JSON (ArcGIS Feature Service)

## 🏗️ Structure des données

### Exemple de requête

Pour obtenir les données d'aujourd'hui :
```
GET https://services8.arcgis.com/7RrxpwWeFIQ8JGGp/arcgis/rest/services/ind_guadeloupe_1/FeatureServer/0/query?where=date_ech%20%3E%3D%20%272025-11-08%27%20AND%20date_ech%20%3C%3D%20%272025-11-09%27&outFields=*&returnGeometry=false&outSR=4326&f=json
```

**Paramètres de requête :**
- `where` : Filtre de date (format: `date_ech >= 'YYYY-MM-DD' AND date_ech <= 'YYYY-MM-DD'`)
- `outFields` : `*` pour tous les champs
- `returnGeometry` : `false` (nous n'avons pas besoin de la géométrie)
- `outSR` : `4326` (système de coordonnées WGS84)
- `f` : `json` (format de réponse)

### Format de réponse (ArcGIS Feature Service)
```json
{
  "objectIdFieldName": "OBJECTID",
  "features": [
    {
      "attributes": {
        "OBJECTID": 321218,
        "date_ech": 1762574400000,
        "code_qual": 1,
        "lib_qual": "Bon",
        "coul_qual": "#50F0E6",
        "date_dif": 1762488000000,
        "source": "Gwad'Air",
        "type_zone": "commune",
        "code_zone": "97101",
        "lib_zone": "Les Abymes",
        "code_no2": 1,
        "code_so2": 1,
        "code_o3": 1,
        "code_pm10": 1,
        "code_pm25": 1,
        "x_wgs84": -61.4917115229248,
        "y_wgs84": 16.2690976053805,
        "x_reg": 661172.200000207,
        "y_reg": 1799296.23302357,
        "epsg_reg": "5490"
      }
    }
  ]
}
```

**Note importante :** Les dates sont au format timestamp UNIX (millisecondes). Par exemple, `1762574400000` = `Fri, 08 Nov 2025 00:00:00 GMT`.

### Propriétés disponibles (properties)

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `OBJECTID` | int | Identifiant unique de l'entrée | 216734 |
| `code_zone` | string | Code INSEE de la commune | "97101" |
| `lib_zone` | string | Nom de la commune | "Les Abymes" |
| `type_zone` | string | Type de zone (toujours "commune") | "commune" |
| `date_ech` | string | Date d'échéance (format GMT) | "Sat, 06 Jan 2024 04:00:00 GMT" |
| `date_dif` | string | Date de diffusion (format GMT) | "Fri, 05 Jan 2024 04:00:00 GMT" |
| `code_qual` | int | Code numérique de la qualité (1-6) | 1 |

| `source` | string | Source des données | "Gwad'Air" |
| `x_wgs84` | float | Longitude (WGS84) | -61.4917115229248 |
| `y_wgs84` | float | Latitude (WGS84) | 16.2690976053805 |
| `x_reg` | float | Coordonnée X (système régional) | 661172.200000207 |
| `y_reg` | float | Coordonnée Y (système régional) | 1799296.23302357 |
| `epsg_reg` | string | Code EPSG du système régional | "5490" |

## 🎨 Niveaux de qualité disponibles

| Code | Libellé | Couleur | Description |
|------|---------|---------|-------------|
| 1 | Bon | #50F0E6 | Qualité de l'air bonne |
| 2 | Moyen | #50CCAA | Qualité de l'air acceptable |
| 3 | Dégradé | #F0E641 | Qualité de l'air dégradée |
| 4 | Mauvais | #FF5050 | Qualité de l'air mauvaise |
| 5 | Très mauvais | #960032 | Qualité de l'air très mauvaise |
| 6 | Extrêmement mauvais | #803399 | Qualité de l'air extrêmement mauvaise |
| 0 | Absent | #DDDDDD | Données absentes |

## ⚠️ Points importants

### 1. Données historiques multiples
L'API retourne **plusieurs entrées par commune** (environ 675 entrées par commune). Il est **essentiel de filtrer** pour ne garder que la donnée la plus récente pour chaque commune.

### 2. Dates disponibles
- Les données les plus récentes datent de **juillet 2024**
- Le site officiel (gwadair.fr) affiche des données de **novembre 2025**
- **Conclusion:** L'API OpenData ne contient pas les données les plus récentes en temps réel

### 3. Codes de qualité des polluants
Chaque polluant (NO₂, SO₂, O₃, PM10, PM2.5) a son propre code de qualité (1-6), qui peut différer du code global (`code_qual`).

## 🔧 Recommandations d'utilisation

### Exemple en Python (backend)
```python
import httpx
from datetime import datetime, timedelta

# Obtenir les données d'aujourd'hui
async def get_air_quality_data():
    base_url = "https://services8.arcgis.com/7RrxpwWeFIQ8JGGp/arcgis/rest/services/ind_guadeloupe_1/FeatureServer/0/query"

    # Date d'aujourd'hui et demain
    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

    # Paramètres de requête
    params = {
        'where': f"date_ech >= '{today}' AND date_ech <= '{tomorrow}'",
        'outFields': '*',
        'returnGeometry': 'false',
        'outSR': '4326',
        'f': 'json'
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(base_url, params=params)
        data = response.json()

        # Transformer les données
        formatted_data = {}
        for feature in data.get("features", []):
            attrs = feature.get("attributes", {})
            code_zone = attrs.get("code_zone")

            # Convertir les timestamps UNIX (millisecondes) en dates
            if attrs.get("date_ech"):
                date_ech = datetime.fromtimestamp(attrs["date_ech"] / 1000)
                attrs["date_ech"] = date_ech.strftime("%a, %d %b %Y %H:%M:%S GMT")

            if code_zone:
                formatted_data[code_zone] = attrs

        return formatted_data
```

### Correspondance avec les codes SVG
Les codes de zone de l'API correspondent directement aux IDs des polygones SVG :
- Format SVG: `"97101 LES ABYMES"`
- Code API: `"97101"`
- Extraction: `communeId.split(' ')[0]` → `"97101"`

## 🔍 Compatibilité avec le site officiel

✅ **Avec la nouvelle API (`services8.arcgis.com`)**, les données sont **identiques** au site officiel gwadair.fr car :
1. **Même source de données :** C'est l'API en temps réel utilisée par le site officiel
2. **Même méthodologie :** Les indices ATMO sont calculés de la même manière
3. **Mise à jour quotidienne :** Les données sont synchronisées quotidiennement

❌ **Ancienne API (`data-gwadair.opendata.arcgis.com`)** - NE PLUS UTILISER :
- Données obsolètes (dernière mise à jour : juillet 2024)
- Ne correspond plus au site officiel
- Retournée uniquement pour des raisons historiques

## 📝 Notes techniques

- **Format de l'API :** ArcGIS Feature Service (JSON)
- **Timestamps :** Format UNIX en millisecondes (ex: `1762574400000`)
- **Mise à jour :** Quotidienne (généralement vers 10h UTC+4)
- **Cache recommandé :** 3 minutes (pour éviter les appels inutiles)
- **Source des données :** Gwad'Air (Association Agréée de Surveillance de la Qualité de l'Air)
- **Système de coordonnées :** WGS84 (EPSG:4326)
