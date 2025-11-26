
import httpx
import json
import time
import zipfile
import io
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# URL de la vraie API en temps réel (utilisée par le site officiel gwadair.fr)
GWADAIR_API_BASE_URL = "https://services8.arcgis.com/7RrxpwWeFIQ8JGGp/arcgis/rest/services/ind_guadeloupe_1/FeatureServer/0/query"

# Cache simple en mémoire avec TTL (Time To Live)
cache_data = None
cache_timestamp = 0
CACHE_TTL = 180  # Cache valide pendant 3 minutes (180 secondes) - réduit pour avoir des données plus fraîches

@app.get("/api/air-quality")
async def get_air_quality():
    global cache_data, cache_timestamp

    current_time = time.time()

    # Vérifier si le cache est encore valide
    if cache_data is not None and (current_time - cache_timestamp) < CACHE_TTL:
        print(f"[Cache] Utilisation du cache (âge: {int(current_time - cache_timestamp)}s)")
        return cache_data

    print("[API] Appel à l'API Gwad'Air...")

    # Si le cache est expiré ou n'existe pas, faire un nouvel appel API
    try:
        from datetime import datetime, timedelta

        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            # Essayer d'abord les données d'aujourd'hui
            today = datetime.now().strftime('%Y-%m-%d')
            tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

            params_today = {
                'where': f"date_ech >= '{today}' AND date_ech <= '{tomorrow}'",
                'outFields': '*',
                'returnGeometry': 'false',
                'outSR': '4326',
                'f': 'json',
                'orderByFields': 'date_ech DESC'  # Les plus récentes en premier
            }

            response = await client.get(GWADAIR_API_BASE_URL, params=params_today)
            response.raise_for_status()
            data = response.json()

            # Si pas de données pour aujourd'hui, essayer hier
            if not data.get("features") or len(data.get("features", [])) == 0:
                print("[API] Aucune donnée pour aujourd'hui, récupération des données d'hier...")
                yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')

                params_yesterday = {
                    'where': f"date_ech >= '{yesterday}' AND date_ech < '{today}'",
                    'outFields': '*',
                    'returnGeometry': 'false',
                    'outSR': '4326',
                    'f': 'json',
                    'orderByFields': 'date_ech DESC'
                }

                response = await client.get(GWADAIR_API_BASE_URL, params=params_yesterday)
                response.raise_for_status()
                data = response.json()

            # Transformer les données ArcGIS en format attendu par le frontend
            formatted_data = {}
            communes_count = 0
            max_date = None

            for feature in data.get("features", []):
                attrs = feature.get("attributes", {})
                code_zone = attrs.get("code_zone")

                if not code_zone:
                    continue

                # Convertir les timestamps UNIX en dates
                date_ech_timestamp = attrs.get("date_ech")
                date_dif_timestamp = attrs.get("date_dif")

                if date_ech_timestamp:
                    date_ech = datetime.fromtimestamp(date_ech_timestamp / 1000)
                    attrs["date_ech"] = date_ech.strftime("%a, %d %b %Y %H:%M:%S GMT")

                    if max_date is None or date_ech > max_date:
                        max_date = date_ech

                # Ne garder que la donnée la plus récente pour chaque commune
                if code_zone not in formatted_data:
                    formatted_data[code_zone] = attrs
                    communes_count += 1
                else:
                    # Comparer les dates pour garder la plus récente
                    existing_date_str = formatted_data[code_zone].get("date_ech", "")
                    if existing_date_str:
                        try:
                            existing_date = datetime.strptime(existing_date_str, "%a, %d %b %Y %H:%M:%S GMT")
                            if date_ech > existing_date:
                                formatted_data[code_zone] = attrs
                        except ValueError:
                            # Si la date existante est invalide, remplacer
                            formatted_data[code_zone] = attrs
                    else:
                        formatted_data[code_zone] = attrs

                if date_dif_timestamp:
                    date_dif = datetime.fromtimestamp(date_dif_timestamp / 1000)
                    attrs["date_dif"] = date_dif.strftime("%a, %d %b %Y %H:%M:%S GMT")

            # Mettre à jour le cache
            cache_data = formatted_data
            cache_timestamp = current_time

            print(f"[API] Données récupérées: {communes_count} communes")
            if max_date:
                print(f"[API] Date la plus récente: {max_date.strftime('%Y-%m-%d %H:%M:%S')}")

            return formatted_data

    except httpx.TimeoutException:
        print("[Error] Timeout lors de l'appel à l'API Gwad'Air")
        # Retourner le cache si disponible même s'il est expiré
        if cache_data is not None:
            print("[Fallback] Utilisation du cache expiré en cas de timeout")
            return cache_data
        raise
    except httpx.HTTPStatusError as e:
        print(f"[Error] Erreur HTTP lors de l'appel à l'API: {e.response.status_code}")
        # Retourner le cache si disponible même s'il est expiré
        if cache_data is not None:
            print("[Fallback] Utilisation du cache expiré en cas d'erreur HTTP")
            return cache_data
        raise
    except Exception as e:
        print(f"[Error] Erreur lors de l'appel à l'API: {str(e)}")
        # Retourner le cache si disponible même s'il est expiré
        if cache_data is not None:
            print("[Fallback] Utilisation du cache expiré en cas d'erreur")
            return cache_data
        raise

# Fonction pour charger les données de tours d'eau (pour ne pas le lire à chaque requête)
def load_water_cuts_data():
    try:
        with open("tours-deau.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Fichier tours-deau.json non trouvé"}
    except json.JSONDecodeError:
        return {"error": "Erreur de formatage du JSON"}

water_cuts_data = load_water_cuts_data()

@app.get("/api/water-cuts")
async def get_water_cuts():
    # Retourne simplement le contenu du fichier JSON que nous avons chargé au démarrage
    return water_cuts_data

# Coordonnées des communes de Guadeloupe (lat, lon) - Extraites du GeoJSON officiel
COMMUNE_COORDINATES = {
    "97101": {"name": "Les Abymes", "lat": 16.269098, "lon": -61.491712},
    "97102": {"name": "Anse-Bertrand", "lat": 16.471009, "lon": -61.506},
    "97103": {"name": "Baie-Mahault", "lat": 16.250984, "lon": -61.593918},
    "97104": {"name": "Baillif", "lat": 16.04277, "lon": -61.7313},
    "97105": {"name": "Basse-Terre", "lat": 15.998443, "lon": -61.72447},
    "97106": {"name": "Bouillante", "lat": 16.101058, "lon": -61.764318},
    "97107": {"name": "Capesterre-Belle-Eau", "lat": 16.060373, "lon": -61.574103},
    "97108": {"name": "Capesterre-de-Marie-Galante", "lat": 15.893608, "lon": -61.222379},
    "97109": {"name": "Gourbeyre", "lat": 15.991118, "lon": -61.684582},
    "97110": {"name": "La Désirade", "lat": 16.30279, "lon": -61.077034},
    "97111": {"name": "Deshaies", "lat": 16.30812, "lon": -61.793379},
    "97112": {"name": "Grand-Bourg", "lat": 15.902875, "lon": -61.307448},
    "97113": {"name": "Le Gosier", "lat": 16.225134, "lon": -61.467175},
    "97114": {"name": "Goyave", "lat": 16.130428, "lon": -61.585075},
    "97115": {"name": "Lamentin", "lat": 16.246752, "lon": -61.650672},
    "97116": {"name": "Morne-à-l'Eau", "lat": 16.321248, "lon": -61.457015},
    "97117": {"name": "Le Moule", "lat": 16.32455, "lon": -61.352319},
    "97118": {"name": "Petit-Bourg", "lat": 16.193519, "lon": -61.600424},
    "97119": {"name": "Petit-Canal", "lat": 16.379163, "lon": -61.442341},
    "97120": {"name": "Pointe-à-Pitre", "lat": 16.241587, "lon": -61.537708},
    "97121": {"name": "Pointe-Noire", "lat": 16.210064, "lon": -61.780597},
    "97122": {"name": "Port-Louis", "lat": 16.418389, "lon": -61.52852},
    "97124": {"name": "Saint-Claude", "lat": 16.0167, "lon": -61.709911},
    "97125": {"name": "Saint-François", "lat": 16.260504, "lon": -61.289773},
    "97126": {"name": "Saint-Louis", "lat": 15.956251, "lon": -61.315493},
    "97128": {"name": "Sainte-Anne", "lat": 16.257101, "lon": -61.352828},
    "97129": {"name": "Sainte-Rose", "lat": 16.318948, "lon": -61.695059},
    "97130": {"name": "Terre-de-Bas", "lat": 15.848911, "lon": -61.643872},
    "97131": {"name": "Terre-de-Haut", "lat": 15.86704, "lon": -61.58231},
    "97132": {"name": "Trois-Rivières", "lat": 15.979825, "lon": -61.641339},
    "97133": {"name": "Vieux-Fort", "lat": 15.952554, "lon": -61.702531},
    "97134": {"name": "Vieux-Habitants", "lat": 16.045746, "lon": -61.750473},
    "97801": {"name": "Saint-Martin", "lat": 18.067043, "lon": -63.084698},
}

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

# Credentials Météo France
METEOFRANCE_CLIENT_ID = os.getenv("METEOFRANCE_CLIENT_ID")
METEOFRANCE_CLIENT_SECRET = os.getenv("METEOFRANCE_CLIENT_SECRET")
METEOFRANCE_TOKEN = None
METEOFRANCE_TOKEN_EXPIRY = 0

async def get_meteofrance_token():
    """Obtenir ou rafraîchir le token Météo-France"""
    global METEOFRANCE_TOKEN, METEOFRANCE_TOKEN_EXPIRY

    current_time = time.time()

    # Si le token existe et n'est pas expiré (avec marge de 5 minutes)
    if METEOFRANCE_TOKEN and current_time < (METEOFRANCE_TOKEN_EXPIRY - 300):
        return METEOFRANCE_TOKEN

    # Sinon, générer un nouveau token
    async with httpx.AsyncClient() as client:
        try:
            import base64
            credentials = f"{METEOFRANCE_CLIENT_ID}:{METEOFRANCE_CLIENT_SECRET}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()

            response = await client.post(
                "https://portail-api.meteofrance.fr/token",
                headers={
                    "Authorization": f"Basic {encoded_credentials}",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data="grant_type=client_credentials"
            )
            response.raise_for_status()
            token_data = response.json()

            METEOFRANCE_TOKEN = token_data["access_token"]
            METEOFRANCE_TOKEN_EXPIRY = current_time + token_data.get("expires_in", 3600)

            print(f"[Météo-France] Nouveau token généré, expire dans {token_data.get('expires_in', 3600)}s")
            return METEOFRANCE_TOKEN

        except Exception as e:
            print(f"Erreur lors de la génération du token Météo-France: {e}")
            raise

# Cache pour les données météo
weather_cache_data = None
weather_cache_timestamp = 0
WEATHER_CACHE_TTL = 3600  # Cache valide pendant 1 heure (pas besoin de temps réel)

# Cache pour la vigilance météo
vigilance_cache_data = None
vigilance_cache_timestamp = 0
VIGILANCE_CACHE_TTL = 600  # Cache valide pendant 10 minutes (pour avoir des données plus fraîches)

@app.get("/api/weather")
async def get_weather():
    global weather_cache_data, weather_cache_timestamp

    current_time = time.time()

    # Vérifier si le cache est encore valide
    if weather_cache_data is not None and (current_time - weather_cache_timestamp) < WEATHER_CACHE_TTL:
        return weather_cache_data

    # Fonction pour récupérer les données météo d'une commune
    async def fetch_commune_weather(client: httpx.AsyncClient, code_zone: str, info: dict):
        try:
            from datetime import datetime

            # Appel à l'API OpenWeatherMap avec plus de données (onecall inclut plus d'infos)
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={info['lat']}&lon={info['lon']}&appid={OPENWEATHER_API_KEY}&units=metric&lang=fr"
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()

            # Vérifier que les données sont valides (température dans une plage raisonnable pour la Guadeloupe)
            temp = data["main"]["temp"]
            # Vérifier si la température est None, NaN, ou dans une plage invalide
            # Note: On accepte 0°C car c'est techniquement valide, mais on vérifie la cohérence avec d'autres données
            if temp is None or (isinstance(temp, float) and (temp != temp or temp < -50 or temp > 60)):
                # Données invalides, traiter comme une erreur
                raise ValueError(f"Température invalide: {temp}°C pour {info['name']}")

            # Vérifier aussi la cohérence: si température est 0 mais que d'autres champs sont absents/invalides, c'est suspect
            if temp == 0 and (not data.get("main", {}).get("humidity") or data["main"].get("humidity", 0) == 0):
                # Probablement des données invalides si température est 0 ET humidité est absente/0
                raise ValueError(f"Données suspectes (temp=0, humidité manquante) pour {info['name']}")

            # Calculer le point de rosée (approximation)
            humidity = data["main"]["humidity"]
            dew_point = temp - ((100 - humidity) / 5)

            # Extraire les informations pertinentes avec plus de détails
            weather_data = {
                "lib_zone": info["name"],
                "code_zone": code_zone,
                "temperature": round(data["main"]["temp"], 1),
                "feels_like": round(data["main"]["feels_like"], 1),
                "temp_min": round(data["main"]["temp_min"], 1),
                "temp_max": round(data["main"]["temp_max"], 1),
                "humidity": data["main"]["humidity"],
                "pressure": data["main"]["pressure"],
                "wind_speed": round(data["wind"]["speed"] * 3.6, 1),  # Convertir m/s en km/h
                "wind_deg": data["wind"].get("deg", 0),
                "wind_gust": round(data["wind"]["gust"] * 3.6, 1) if "gust" in data.get("wind", {}) else None,
                "weather_main": data["weather"][0]["main"],
                "weather_description": data["weather"][0]["description"],
                "weather_icon": data["weather"][0]["icon"],
                "clouds": data["clouds"]["all"],
                "visibility": data.get("visibility", 10000),  # en mètres
                "dew_point": round(dew_point, 1),
                "sunrise": datetime.fromtimestamp(data["sys"]["sunrise"]).strftime("%H:%M"),
                "sunset": datetime.fromtimestamp(data["sys"]["sunset"]).strftime("%H:%M"),
                "timezone": data.get("timezone", 0),
                "rain_1h": data.get("rain", {}).get("1h") if "rain" in data and data.get("rain", {}).get("1h") is not None else None,
                "rain_3h": data.get("rain", {}).get("3h") if "rain" in data and data.get("rain", {}).get("3h") is not None else None,
            }

            # Ajouter l'indice UV si disponible (nécessite un appel séparé à onecall)
            # Pour l'instant, on le calcule de manière approximative basé sur l'heure et les nuages
            try:
                current_hour = datetime.now().hour
                # Indice UV approximatif pour la Guadeloupe (latitudes tropicales)
                if 6 <= current_hour <= 18:  # Jour
                    base_uv = 8 if 10 <= current_hour <= 14 else 5  # Fort au midi
                    # Ajuster selon la couverture nuageuse
                    cloud_factor = 1 - (data["clouds"]["all"] / 200)  # Réduction si nuageux
                    weather_data["uv_index"] = round(base_uv * max(cloud_factor, 0.3), 1)
                else:
                    weather_data["uv_index"] = 0
            except Exception:
                weather_data["uv_index"] = None

            return (code_zone, weather_data)
        except Exception as e:
            print(f"Erreur pour {info['name']}: {e}")
            # En cas d'erreur, on met des valeurs par défaut
            return (code_zone, {
                "lib_zone": info["name"],
                "code_zone": code_zone,
                "temperature": None,
                "feels_like": None,
                "temp_min": None,
                "temp_max": None,
                "humidity": None,
                "pressure": None,
                "wind_speed": None,
                "wind_deg": None,
                "wind_gust": None,
                "weather_main": "N/A",
                "weather_description": "Données non disponibles",
                "weather_icon": "01d",
                "clouds": None,
                "visibility": None,
                "dew_point": None,
                "sunrise": None,
                "sunset": None,
                "timezone": None,
                "rain_1h": None,
                "rain_3h": None,
                "uv_index": None,
            })

    # Récupérer les données météo pour toutes les communes en parallèle
    import asyncio
    weather_data = {}

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Créer toutes les tâches en parallèle
        tasks = [
            fetch_commune_weather(client, code_zone, info)
            for code_zone, info in COMMUNE_COORDINATES.items()
        ]

        # Exécuter toutes les tâches en parallèle
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Construire le dictionnaire de résultats
        for result in results:
            if isinstance(result, Exception):
                print(f"Erreur lors de la récupération des données météo: {result}")
                continue
            code_zone, data = result
            weather_data[code_zone] = data

    # Mettre à jour le cache
    weather_cache_data = weather_data
    weather_cache_timestamp = current_time

    print(f"[Weather] Données récupérées pour {len(weather_data)} communes en parallèle")

    return weather_data

# Cache pour les prévisions météo
forecast_cache_data = None
forecast_cache_timestamp = 0
FORECAST_CACHE_TTL = 10800  # Cache valide pendant 3 heures

@app.get("/api/forecast/{code_zone}")
async def get_forecast(code_zone: str):
    """Obtenir les prévisions météo pour une commune spécifique (5 jours)"""
    global forecast_cache_data, forecast_cache_timestamp

    current_time = time.time()

    # Vérifier si le code_zone existe
    if code_zone not in COMMUNE_COORDINATES:
        return {"error": f"Commune {code_zone} non trouvée"}

    # Vérifier le cache pour cette commune
    cache_key = f"forecast_{code_zone}"
    if (forecast_cache_data is not None and
        cache_key in forecast_cache_data and
        (current_time - forecast_cache_timestamp) < FORECAST_CACHE_TTL):
        return forecast_cache_data[cache_key]

    commune = COMMUNE_COORDINATES[code_zone]

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Appel à l'API de prévisions (5 jours / 3h)
            url = f"https://api.openweathermap.org/data/2.5/forecast?lat={commune['lat']}&lon={commune['lon']}&appid={OPENWEATHER_API_KEY}&units=metric&lang=fr&cnt=40"
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

            # Organiser les prévisions par jour
            from datetime import datetime
            forecasts_by_day = {}

            for item in data["list"]:
                dt = datetime.fromtimestamp(item["dt"])
                day_key = dt.strftime("%Y-%m-%d")

                if day_key not in forecasts_by_day:
                    forecasts_by_day[day_key] = []

                forecasts_by_day[day_key].append({
                    "time": dt.strftime("%H:%M"),
                    "timestamp": item["dt"],
                    "temperature": round(item["main"]["temp"], 1),
                    "feels_like": round(item["main"]["feels_like"], 1),
                    "temp_min": round(item["main"]["temp_min"], 1),
                    "temp_max": round(item["main"]["temp_max"], 1),
                    "humidity": item["main"]["humidity"],
                    "pressure": item["main"]["pressure"],
                    "weather_main": item["weather"][0]["main"],
                    "weather_description": item["weather"][0]["description"],
                    "weather_icon": item["weather"][0]["icon"],
                    "clouds": item["clouds"]["all"],
                    "wind_speed": round(item["wind"]["speed"] * 3.6, 1),
                    "wind_deg": item["wind"].get("deg", 0),
                    "pop": round(item.get("pop", 0) * 100),  # Probabilité de précipitation en %
                    "rain_3h": item.get("rain", {}).get("3h", 0),
                })

            # Calculer les min/max par jour
            daily_summary = {}
            for day, forecasts in forecasts_by_day.items():
                temps = [f["temperature"] for f in forecasts]
                daily_summary[day] = {
                    "date": day,
                    "temp_min": round(min(temps), 1),
                    "temp_max": round(max(temps), 1),
                    "hourly": forecasts,
                    # Prendre la météo la plus représentative (vers midi)
                    "main_weather": forecasts[len(forecasts)//2]["weather_main"],
                    "main_weather_description": forecasts[len(forecasts)//2]["weather_description"],
                    "main_weather_icon": forecasts[len(forecasts)//2]["weather_icon"],
                }

            result = {
                "code_zone": code_zone,
                "lib_zone": commune["name"],
                "daily": daily_summary,
                "city": data["city"]
            }

            # Mettre à jour le cache
            if forecast_cache_data is None:
                forecast_cache_data = {}
            forecast_cache_data[cache_key] = result
            forecast_cache_timestamp = current_time

            return result

    except Exception as e:
        print(f"Erreur lors de la récupération des prévisions pour {commune['name']}: {e}")
        return {"error": str(e), "code_zone": code_zone, "lib_zone": commune["name"]}

@app.get("/api/vigilance")
async def get_vigilance():
    global vigilance_cache_data, vigilance_cache_timestamp

    current_time = time.time()

    # Vérifier si le cache est encore valide
    if vigilance_cache_data is not None and (current_time - vigilance_cache_timestamp) < VIGILANCE_CACHE_TTL:
        print(f"[Cache] Utilisation du cache vigilance (âge: {int(current_time - vigilance_cache_timestamp)}s)")
        return vigilance_cache_data

    print("[API] Appel à l'API Météo-France pour la vigilance...")

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Obtenir le token
            token = await get_meteofrance_token()

            # Télécharger le fichier ZIP de vigilance outre-mer
            url = "https://public-api.meteofrance.fr/public/DPVigilance/v1/vigilanceom/flux/dernier"
            headers = {
                "Authorization": f"Bearer {token}"
            }

            response = await client.get(url, headers=headers)
            response.raise_for_status()

            # Extraire le contenu du ZIP
            zip_data = io.BytesIO(response.content)
            with zipfile.ZipFile(zip_data, 'r') as zip_ref:
                # Le fichier qui contient les données de la Guadeloupe est CDPV85_TFFR_.txt
                vigilance_file = "CDPV85_TFFR_.txt"

                if vigilance_file not in zip_ref.namelist():
                    raise Exception(f"Fichier {vigilance_file} non trouvé dans le ZIP")

                # Lire et parser le fichier JSON
                with zip_ref.open(vigilance_file) as f:
                    vigilance_json = json.loads(f.read().decode('utf-8'))

            # Extraire les données pour la Guadeloupe (VIGI971)
            vigilance_level = 1  # Par défaut: vert
            vigilance_color = "#28d761"
            vigilance_label = "Vert"
            vigilance_risks = []

            # Chercher VIGI971 dans les données
            if "timelaps" in vigilance_json and "domain_ids" in vigilance_json["timelaps"]:
                for domain in vigilance_json["timelaps"]["domain_ids"]:
                    if domain["domain_id"] == "VIGI971":
                        vigilance_level = domain.get("max_color_id", 1)

                        # Extraire les risques
                        for phenomenon in domain.get("phenomenon_items", []):
                            pheno_id = phenomenon.get("phenomenon_id")
                            pheno_level = phenomenon.get("phenomenon_max_color_id", -1)

                            # Mapper les phenomenon_id aux noms (basé sur la doc Météo-France)
                            phenomenon_names = {
                                1: "Vent",
                                2: "Pluie-inondation",
                                3: "Orages",
                                4: "Crues",
                                5: "Neige-verglas",
                                6: "Canicule",
                                7: "Grand froid",
                                8: "Avalanches",
                                9: "Vagues-submersion",
                                10: "Mer-houle"
                            }

                            if pheno_level >= 1:  # Ne pas inclure les phénomènes avec level -1 ou 0
                                vigilance_risks.append({
                                    "type": phenomenon_names.get(pheno_id, f"Phénomène {pheno_id}"),
                                    "level": pheno_level
                                })
                        break

            # Mapping niveau -> couleur et label
            vigilance_info = {
                -1: {"color": "#CCCCCC", "label": "Non disponible"},
                0: {"color": "#28d761", "label": "Vert"},
                1: {"color": "#28d761", "label": "Vert"},
                2: {"color": "#FFFF00", "label": "Jaune"},
                3: {"color": "#FF9900", "label": "Orange"},
                4: {"color": "#FF0000", "label": "Rouge"}
            }.get(vigilance_level, {"color": "#28d761", "label": "Vert"})

            vigilance_color = vigilance_info["color"]
            vigilance_label = vigilance_info["label"]

            result = {
                "department": "971",
                "department_name": "Guadeloupe",
                "level": vigilance_level,
                "color": vigilance_color,
                "label": vigilance_label,
                "risks": vigilance_risks,
                "last_update": current_time
            }

            # Mettre à jour le cache
            vigilance_cache_data = result
            vigilance_cache_timestamp = current_time

            print(f"[Vigilance] Niveau: {vigilance_label} ({vigilance_level}), Risques: {len(vigilance_risks)}")

            return result

        except Exception as e:
            print(f"Erreur lors de la récupération de la vigilance: {e}")
            import traceback
            traceback.print_exc()

            # En cas d'erreur, retourner des valeurs par défaut
            default_result = {
                "department": "971",
                "department_name": "Guadeloupe",
                "level": 1,
                "color": "#28d761",
                "label": "Vert",
                "risks": [],
                "last_update": current_time,
                "error": str(e)
            }

            # Mettre à jour le cache même en cas d'erreur pour éviter trop d'appels
            vigilance_cache_data = default_result
            vigilance_cache_timestamp = current_time

            return default_result
