
import httpx
import json
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

    print(f"[API] Appel à l'API Gwad'Air...")

    # Si le cache est expiré ou n'existe pas, faire un nouvel appel API
    try:
        from datetime import datetime, timedelta

        # Obtenir la date d'aujourd'hui et demain au format YYYY-MM-DD
        today = datetime.now().strftime('%Y-%m-%d')
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')

        # Construire la requête pour obtenir les données d'aujourd'hui
        params = {
            'where': f"date_ech >= '{today}' AND date_ech <= '{tomorrow}'",
            'outFields': '*',
            'returnGeometry': 'false',
            'outSR': '4326',
            'f': 'json'
        }

        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(GWADAIR_API_BASE_URL, params=params)
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

                if date_dif_timestamp:
                    date_dif = datetime.fromtimestamp(date_dif_timestamp / 1000)
                    attrs["date_dif"] = date_dif.strftime("%a, %d %b %Y %H:%M:%S GMT")

                # Ajouter la commune (en écrasant si déjà présente, car on ne prend que les données d'aujourd'hui)
                formatted_data[code_zone] = attrs
                communes_count += 1

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

# Coordonnées des communes de Guadeloupe (lat, lon)
COMMUNE_COORDINATES = {
    "97101": {"name": "LES ABYMES", "lat": 16.2681, "lon": -61.5078},
    "97102": {"name": "ANSE-BERTRAND", "lat": 16.4667, "lon": -61.5167},
    "97103": {"name": "BAIE-MAHAULT", "lat": 16.2667, "lon": -61.5833},
    "97104": {"name": "BAILLIF", "lat": 16.0167, "lon": -61.7417},
    "97105": {"name": "BASSE-TERRE", "lat": 16.0000, "lon": -61.7333},
    "97106": {"name": "BOUILLANTE", "lat": 16.1333, "lon": -61.7667},
    "97107": {"name": "CAPESTERRE-BELLE-EAU", "lat": 16.0450, "lon": -61.5550},
    "97108": {"name": "CAPESTERRE-DE-MARIE-GALANTE", "lat": 15.8833, "lon": -61.2000},
    "97109": {"name": "GOURBEYRE", "lat": 16.0000, "lon": -61.6667},
    "97110": {"name": "LA DÉSIRADE", "lat": 16.3167, "lon": -61.0000},
    "97111": {"name": "DESHAIES", "lat": 16.3000, "lon": -61.8000},
    "97112": {"name": "GRAND-BOURG", "lat": 15.8833, "lon": -61.3167},
    "97113": {"name": "LE GOSIER", "lat": 16.2167, "lon": -61.5167},
    "97114": {"name": "GOYAVE", "lat": 16.1167, "lon": -61.5667},
    "97115": {"name": "LAMENTIN", "lat": 16.2667, "lon": -61.6500},
    "97116": {"name": "MORNE-À-L'EAU", "lat": 16.3333, "lon": -61.4500},
    "97117": {"name": "LE MOULE", "lat": 16.3333, "lon": -61.3500},
    "97118": {"name": "PETIT-BOURG", "lat": 16.1833, "lon": -61.6000},
    "97119": {"name": "PETIT-CANAL", "lat": 16.4167, "lon": -61.4333},
    "97120": {"name": "POINTE-À-PITRE", "lat": 16.2417, "lon": -61.5333},
    "97121": {"name": "POINTE-NOIRE", "lat": 16.2000, "lon": -61.7833},
    "97122": {"name": "PORT-LOUIS", "lat": 16.4333, "lon": -61.5333},
    "97124": {"name": "SAINT-CLAUDE", "lat": 16.0333, "lon": -61.6833},
    "97125": {"name": "SAINT-FRANÇOIS", "lat": 16.2500, "lon": -61.2833},
    "97126": {"name": "SAINT-LOUIS", "lat": 15.9667, "lon": -61.2667},
    "97128": {"name": "SAINTE-ANNE", "lat": 16.2333, "lon": -61.3833},
    "97129": {"name": "SAINTE-ROSE", "lat": 16.3333, "lon": -61.7000},
    "97130": {"name": "TERRE-DE-BAS", "lat": 15.8667, "lon": -61.6500},
    "97131": {"name": "TERRE-DE-HAUT", "lat": 15.8667, "lon": -61.5833},
    "97132": {"name": "TROIS-RIVIÈRES", "lat": 16.0333, "lon": -61.6500},
    "97133": {"name": "VIEUX-FORT", "lat": 15.9667, "lon": -61.7000},
    "97134": {"name": "VIEUX-HABITANTS", "lat": 16.0667, "lon": -61.7667},
}

OPENWEATHER_API_KEY = "REDACTED_OPENWEATHER_KEY"

# Token Météo France
METEOFRANCE_TOKEN = "eyJ4NXQiOiJOelU0WTJJME9XRXhZVGt6WkdJM1kySTFaakZqWVRJeE4yUTNNalEyTkRRM09HRmtZalkzTURkbE9UZ3paakUxTURRNFltSTVPR1kyTURjMVkyWTBNdyIsImtpZCI6Ik56VTRZMkkwT1dFeFlUa3paR0kzWTJJMVpqRmpZVEl4TjJRM01qUTJORFEzT0dGa1lqWTNNRGRsT1RnelpqRTFNRFE0WW1JNU9HWTJNRGMxWTJZME13X1JTMjU2IiwidHlwIjoiYXQrand0IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIyMjMzZDljMi0yYzViLTRlOTQtYTQyZS0zYzVhMTIzODRlNzIiLCJhdXQiOiJBUFBMSUNBVElPTiIsImF1ZCI6IjhOSXFPRVV1cEtPd0NjelRHSVRLOWR3aF9mTWEiLCJuYmYiOjE3NjI0NjQxNDQsImF6cCI6IjhOSXFPRVV1cEtPd0NjelRHSVRLOWR3aF9mTWEiLCJzY29wZSI6ImRlZmF1bHQiLCJpc3MiOiJodHRwczpcL1wvcG9ydGFpbC1hcGkubWV0ZW9mcmFuY2UuZnJcL29hdXRoMlwvdG9rZW4iLCJleHAiOjE3NjI0Njc3NDQsImlhdCI6MTc2MjQ2NDE0NCwianRpIjoiYjEyNWFlNWEtYTUzMy00YjQxLWJmZjQtNTNjY2VkZjM4YWUwIiwiY2xpZW50X2lkIjoiOE5JcU9FVXVwS093Q2N6VEdJVEs5ZHdoX2ZNYSJ9.a0dXpF-5GI-lKWwpSBnyfI65LSWdMWD_1uW_Vnjw0UsaD9Kwci57-t69ZRTKm6Pa2SPQLUbZWJiVX4W1ufVEUGBGXwDC6uOv24dAH1Rlvf4JBsLIrM086ml4htTQ4iBH4KwuZY7zEuWHd3NJvoQOCkHeRP4AcdF9_12FvNCTig_b9mpxn1fnqSY6KdaFgFAlcfbQYyHLKILmExWCNAVpqnG8Djdv6GlPuwX69KhhdoAm0NwmfegPXaRQw3cBP1Gl2lUudNqn5W07FrOrMXRzVzUSTkwB-DU2mw1Ez4xHR9ElKSE7heSPQbCFswacaQCnnZfVoRo-wqBMewWKYrdhrA"

# Cache pour les données météo
weather_cache_data = None
weather_cache_timestamp = 0
WEATHER_CACHE_TTL = 3600  # Cache valide pendant 1 heure (pas besoin de temps réel)

# Cache pour la vigilance météo
vigilance_cache_data = None
vigilance_cache_timestamp = 0
VIGILANCE_CACHE_TTL = 7200  # Cache valide pendant 2 heures (pas besoin de temps réel)

@app.get("/api/weather")
async def get_weather():
    global weather_cache_data, weather_cache_timestamp

    current_time = time.time()

    # Vérifier si le cache est encore valide
    if weather_cache_data is not None and (current_time - weather_cache_timestamp) < WEATHER_CACHE_TTL:
        return weather_cache_data

    # Récupérer les données météo pour chaque commune
    weather_data = {}

    async with httpx.AsyncClient() as client:
        for code_zone, info in COMMUNE_COORDINATES.items():
            try:
                # Appel à l'API OpenWeatherMap
                url = f"https://api.openweathermap.org/data/2.5/weather?lat={info['lat']}&lon={info['lon']}&appid={OPENWEATHER_API_KEY}&units=metric&lang=fr"
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()

                # Extraire les informations pertinentes
                weather_data[code_zone] = {
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
                    "weather_main": data["weather"][0]["main"],
                    "weather_description": data["weather"][0]["description"],
                    "weather_icon": data["weather"][0]["icon"],
                    "clouds": data["clouds"]["all"],
                }
            except Exception as e:
                print(f"Erreur pour {info['name']}: {e}")
                # En cas d'erreur, on met des valeurs par défaut
                weather_data[code_zone] = {
                    "lib_zone": info["name"],
                    "code_zone": code_zone,
                    "temperature": 0,
                    "feels_like": 0,
                    "temp_min": 0,
                    "temp_max": 0,
                    "humidity": 0,
                    "pressure": 0,
                    "wind_speed": 0,
                    "wind_deg": 0,
                    "weather_main": "N/A",
                    "weather_description": "Données non disponibles",
                    "weather_icon": "01d",
                    "clouds": 0,
                }

    # Mettre à jour le cache
    weather_cache_data = weather_data
    weather_cache_timestamp = current_time

    return weather_data

@app.get("/api/vigilance")
async def get_vigilance():
    global vigilance_cache_data, vigilance_cache_timestamp

    current_time = time.time()

    # Vérifier si le cache est encore valide
    if vigilance_cache_data is not None and (current_time - vigilance_cache_timestamp) < VIGILANCE_CACHE_TTL:
        return vigilance_cache_data

    # Récupérer les données de vigilance depuis Météo France
    async with httpx.AsyncClient() as client:
        try:
            # Appel à l'API de vigilance Météo France pour la Guadeloupe (971)
            url = "https://portail-api.meteofrance.fr/public/DPVigilance/v1/cartevigilance/encours"
            headers = {
                "Authorization": f"Bearer {METEOFRANCE_TOKEN}",
                "Accept": "application/json"
            }
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

            # Parser les données pour extraire le niveau de vigilance pour la Guadeloupe
            # La structure exacte dépend de l'API, on cherche le département 971
            vigilance_level = 1  # Par défaut: vert (pas de vigilance)
            vigilance_color = "#28d761"  # Vert par défaut
            vigilance_label = "Vert"
            vigilance_risks = []

            # Chercher la Guadeloupe dans les données
            if "product" in data and "periods" in data["product"]:
                for period in data["product"]["periods"]:
                    if "timelaps" in period and "domain_ids" in period["timelaps"]:
                        for domain in period["timelaps"]["domain_ids"]:
                            if domain.get("domain_id") == "971":
                                # Récupérer le niveau maximum de vigilance
                                if "phenomenon_items" in domain:
                                    max_level = 1
                                    risks = []
                                    for phenomenon in domain["phenomenon_items"]:
                                        level = phenomenon.get("phenomenon_max_color_id", 1)
                                        if level > max_level:
                                            max_level = level
                                        risks.append({
                                            "type": phenomenon.get("phenomenon_id", ""),
                                            "level": level
                                        })
                                    vigilance_level = max_level
                                    vigilance_risks = risks

            # Mapper les niveaux aux couleurs et labels
            level_mapping = {
                1: {"color": "#28d761", "label": "Vert"},
                2: {"color": "#FFFF00", "label": "Jaune"},
                3: {"color": "#FF9900", "label": "Orange"},
                4: {"color": "#FF0000", "label": "Rouge"},
            }

            vigilance_info = level_mapping.get(vigilance_level, level_mapping[1])
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

            return result

        except Exception as e:
            print(f"Erreur lors de la récupération de la vigilance: {e}")
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

            # Mettre à jour le cache même en cas d'erreur
            vigilance_cache_data = default_result
            vigilance_cache_timestamp = current_time

            return default_result
