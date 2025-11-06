
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

GWADAIR_API_URL = "https://data-gwadair.opendata.arcgis.com/datasets/5deeac7ff3ae46dea837d149f7cf34f6_0.geojson"

# Cache simple en mémoire avec TTL (Time To Live)
cache_data = None
cache_timestamp = 0
CACHE_TTL = 300  # Cache valide pendant 5 minutes (300 secondes)

@app.get("/api/air-quality")
async def get_air_quality():
    global cache_data, cache_timestamp

    current_time = time.time()

    # Vérifier si le cache est encore valide
    if cache_data is not None and (current_time - cache_timestamp) < CACHE_TTL:
        return cache_data

    # Si le cache est expiré ou n'existe pas, faire un nouvel appel API
    async with httpx.AsyncClient(follow_redirects=True) as client:
        response = await client.get(GWADAIR_API_URL)
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()

        formatted_data = {
            feature["properties"]["code_zone"]: feature["properties"]
            for feature in data["features"]
        }

        # Mettre à jour le cache
        cache_data = formatted_data
        cache_timestamp = current_time

        return formatted_data

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
