'use client';

import { useState, useEffect, useMemo } from 'react';
import GuadeloupeMap, { HoverInfo, AirData, CommuneData } from '../components/GuadeloupeMap';

// Type pour les données météo
type WeatherData = {
  lib_zone: string;
  code_zone: string;
  temperature: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  weather_main: string;
  weather_description: string;
  weather_icon: string;
  clouds: number;
};

type WeatherDataMap = {
  [code_zone: string]: WeatherData;
};

// Type pour les données de vigilance
type VigilanceData = {
  department: string;
  department_name: string;
  level: number;
  color: string;
  label: string;
  risks: Array<{ type: string; level: number }>;
  last_update: number;
};

// Fonction pour obtenir l'icône météo en emoji
function getWeatherEmoji(weatherMain: string, icon: string): string {
  const isDay = icon.includes('d');

  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return isDay ? '☀️' : '🌙';
    case 'clouds':
      return '☁️';
    case 'rain':
    case 'drizzle':
      return '🌧️';
    case 'thunderstorm':
      return '⛈️';
    case 'snow':
      return '❄️';
    case 'mist':
    case 'fog':
    case 'haze':
      return '🌫️';
    default:
      return '🌤️';
  }
}

// Fonction pour obtenir la couleur basée sur la température
function getTemperatureColor(temp: number): string {
  if (temp <= 20) return '#3B82F6'; // Bleu
  if (temp <= 24) return '#10B981'; // Vert
  if (temp <= 28) return '#F59E0B'; // Orange
  if (temp <= 32) return '#EF4444'; // Rouge
  return '#DC2626'; // Rouge foncé
}

// Fonction pour obtenir la direction du vent
function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

// Liste de toutes les communes de Guadeloupe avec leurs noms
const ALL_COMMUNES: { [code: string]: string } = {
  '97101': 'LES ABYMES',
  '97102': 'ANSE-BERTRAND',
  '97103': 'BAIE-MAHAULT',
  '97104': 'BAILLIF',
  '97105': 'BASSE-TERRE',
  '97106': 'BOUILLANTE',
  '97107': 'CAPESTERRE-BELLE-EAU',
  '97108': 'CAPESTERRE-DE-MARIE-GALANTE',
  '97109': 'GOURBEYRE',
  '97110': 'LA DÉSIRADE',
  '97111': 'DESHAIES',
  '97112': 'GRAND-BOURG',
  '97113': 'LE GOSIER',
  '97114': 'GOYAVE',
  '97115': 'LAMENTIN',
  '97116': 'MORNE-À-L\'EAU',
  '97117': 'LE MOULE',
  '97118': 'PETIT-BOURG',
  '97119': 'PETIT-CANAL',
  '97120': 'POINTE-À-PITRE',
  '97121': 'POINTE-NOIRE',
  '97122': 'PORT-LOUIS',
  '97124': 'SAINT-CLAUDE',
  '97125': 'SAINT-FRANÇOIS',
  '97126': 'SAINT-LOUIS',
  '97128': 'SAINTE-ANNE',
  '97129': 'SAINTE-ROSE',
  '97130': 'TERRE-DE-BAS',
  '97131': 'TERRE-DE-HAUT',
  '97132': 'TROIS-RIVIÈRES',
  '97133': 'VIEUX-FORT',
  '97134': 'VIEUX-HABITANTS',
};

export default function MeteoPage() {
  // Fonction pour charger depuis le cache
  const loadFromCache = (): { weatherData: WeatherDataMap; vigilanceData: VigilanceData; timestamp: number } | null => {
    if (typeof window === 'undefined') return null; // SSR
    try {
      const WEATHER_CACHE_KEY = 'gwada_weather_cache';
      const VIGILANCE_CACHE_KEY = 'gwada_vigilance_cache';
      const CACHE_TIMESTAMP_KEY = 'gwada_meteo_cache_timestamp';

      const cachedWeather = localStorage.getItem(WEATHER_CACHE_KEY);
      const cachedVigilance = localStorage.getItem(VIGILANCE_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedWeather && cachedVigilance && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        return {
          weatherData: JSON.parse(cachedWeather),
          vigilanceData: JSON.parse(cachedVigilance),
          timestamp,
        };
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du cache:', error);
    }
    return null;
  };

  // État pour savoir si le composant est monté côté client (pour éviter l'hydratation mismatch)
  const [mounted, setMounted] = useState(false);

  // Initialisation lazy depuis le cache
  const [weatherData, setWeatherData] = useState<WeatherDataMap>(() => {
    const cached = loadFromCache();
    return cached?.weatherData || {};
  });
  const [vigilanceData, setVigilanceData] = useState<VigilanceData | null>(() => {
    const cached = loadFromCache();
    return cached?.vigilanceData || null;
  });
  const [tooltip, setTooltip] = useState<HoverInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(() => {
    const cached = loadFromCache();
    return cached ? new Date(cached.timestamp) : null;
  });

  // Marquer le composant comme monté après l'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fonction pour vérifier si deux dates sont le même jour
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Récupérer les données météo et de vigilance (seulement si nécessaire - une fois par jour)
  useEffect(() => {
    // Ne rien faire côté serveur
    if (typeof window === 'undefined') return;

    const WEATHER_CACHE_KEY = 'gwada_weather_cache';
    const VIGILANCE_CACHE_KEY = 'gwada_vigilance_cache';
    const CACHE_TIMESTAMP_KEY = 'gwada_meteo_cache_timestamp';

    // Fonction pour sauvegarder dans le cache
    const saveToCache = (weather: WeatherDataMap, vigilance: VigilanceData) => {
      try {
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(weather));
        localStorage.setItem(VIGILANCE_CACHE_KEY, JSON.stringify(vigilance));
        const timestamp = Date.now();
        localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
        setLastUpdate(new Date(timestamp));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du cache:', error);
      }
    };

    // Vérifier si un appel API est nécessaire
    const shouldFetch = (): boolean => {
      try {
        const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (!cachedTimestamp) {
          return true; // Pas de cache, on doit faire un appel
        }

        const timestamp = parseInt(cachedTimestamp, 10);
        const lastUpdateDate = new Date(timestamp);
        const today = new Date();

        // Faire un appel seulement si la dernière mise à jour n'est pas d'aujourd'hui
        return !isSameDay(lastUpdateDate, today);
      } catch (error) {
        console.error('Erreur lors de la vérification du cache:', error);
        return true; // En cas d'erreur, on fait un appel
      }
    };

    // Faire un appel API seulement si nécessaire (une fois par jour)
    if (shouldFetch()) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Récupérer les données météo
          const weatherResponse = await fetch('http://127.0.0.1:8000/api/weather');
          const weatherData = await weatherResponse.json();
          setWeatherData(weatherData);

          // Récupérer les données de vigilance
          const vigilanceResponse = await fetch('http://127.0.0.1:8000/api/vigilance');
          const vigilanceData = await vigilanceResponse.json();
          setVigilanceData(vigilanceData);

          // Sauvegarder dans le cache
          saveToCache(weatherData, vigilanceData);
        } catch (error) {
          console.error('Erreur lors de la récupération des données:', error);
          // Si l'appel API échoue, on garde les données du cache si elles existent
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, []); // Se lance une seule fois après le montage

  // Logique d'infobulle personnalisée pour la météo
  const handleCommuneHover = (info: HoverInfo) => {
    const code_zone = info.data.code_zone;
    if (!code_zone) return;

    const communeWeather = weatherData[code_zone];

    if (communeWeather) {
      setTooltip({
        x: info.x,
        y: info.y,
        data: {
          ...communeWeather,
          lib_zone: communeWeather.lib_zone,
          lib_qual: vigilanceData?.label || '',
          coul_qual: vigilanceData?.color || '#28d761',
        } as CommuneData,
      });
    }
  };

  // Transformer les données météo pour la carte (avec couleur de vigilance)
  const mapDataForComponent = useMemo(() => {
    const vigilanceColor = vigilanceData?.color || '#28d761';
    const vigilanceLabel = vigilanceData?.label || 'Vert';
    const result: AirData = {};

    // S'assurer que toutes les communes sont colorées avec la couleur de vigilance
    Object.keys(ALL_COMMUNES).forEach((code) => {
      const weather = weatherData[code];
      if (weather) {
        // Si on a des données météo, les utiliser
        result[code] = {
          ...weather,
          coul_qual: vigilanceColor,
          lib_zone: weather.lib_zone,
          lib_qual: vigilanceLabel,
        } as CommuneData;
      } else {
        // Sinon, créer une entrée minimale avec juste la couleur de vigilance
        result[code] = {
          lib_zone: ALL_COMMUNES[code] || code,
          coul_qual: vigilanceColor,
          lib_qual: vigilanceLabel,
          code_zone: code,
        } as CommuneData;
      }
    });

    return result;
  }, [weatherData, vigilanceData]);

  // Formater la date et l'heure
  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gray-50">
      <div className="w-full max-w-7xl">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-800">Météo et Vigilance en Guadeloupe</h1>
          <p className="text-base text-gray-600 mb-2">Conditions météorologiques actuelles par commune avec vigilance Météo France</p>
          <p className="text-sm text-gray-500">Sources: OpenWeatherMap • Météo France</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          {/* Carte */}
          <div className="flex-1 w-full shadow-lg rounded-lg overflow-hidden flex items-center justify-center relative" style={{ height: '700px' }}>
            <GuadeloupeMap
              data={mapDataForComponent}
              onCommuneHover={handleCommuneHover}
              onCommuneLeave={() => setTooltip(null)}
            />
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-sm text-gray-600">Mise à jour des données...</p>
              </div>
            )}
          </div>

          {/* Légende - Vigilance Météo France */}
          <div className="w-full lg:w-80 bg-white rounded-lg shadow-lg p-6 lg:sticky lg:top-6">
            <h2 className="text-xl font-bold mb-1 text-gray-800">Vigilance Météo France</h2>
            <p className="text-xs text-gray-500 mb-4">Niveau d&apos;alerte en Guadeloupe</p>

            {/* Échelle de vigilance */}
            <div className="space-y-2.5 mb-6">
              {[
                {
                  label: 'Vert',
                  color: '#28d761',
                  description: 'Pas de vigilance particulière',
                  level: 1
                },
                {
                  label: 'Jaune',
                  color: '#FFFF00',
                  description: 'Soyez attentifs',
                  level: 2
                },
                {
                  label: 'Orange',
                  color: '#FF9900',
                  description: 'Soyez très vigilants',
                  level: 3
                },
                {
                  label: 'Rouge',
                  color: '#FF0000',
                  description: 'Vigilance absolue',
                  level: 4
                },
              ].map((level) => {
                const isActive = vigilanceData?.level === level.level;
                return (
                  <div
                    key={level.label}
                    className={`border rounded-lg p-3 transition-all ${isActive ? 'shadow-lg' : 'hover:shadow-md'}`}
                    style={{
                      borderColor: level.color + '40',
                      boxShadow: isActive ? `0 0 0 2px ${level.color}` : undefined
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border-2 flex-shrink-0"
                        style={{
                          backgroundColor: level.color,
                          borderColor: level.color + '80'
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="font-bold text-sm"
                            style={{ color: level.color === '#FFFF00' ? '#B8860B' : level.color }}
                          >
                            {level.label}
                          </span>
                          {isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                              Actuel
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{level.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Informations supplémentaires */}
            <div className="pt-6 border-t border-gray-200">
              {mounted && lastUpdate && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-1">
                    <strong className="text-gray-700">Dernière mise à jour :</strong>
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {formatDateTime(lastUpdate)}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-700">Note :</strong> La couleur de fond de la carte correspond au niveau de vigilance Météo France pour toute la Guadeloupe. Survolez une commune pour voir les détails météo locaux. Les données sont mises à jour une fois par jour.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Source: Météo France
              </p>
            </div>
          </div>
        </div>

        {/* Infobulle (Tooltip) - Détails météo par commune */}
        {tooltip && (() => {
          const weatherInfo = tooltip.data as unknown as WeatherData;
          const tempColor = getTemperatureColor(weatherInfo.temperature);
          const vigilanceColor = vigilanceData?.color || '#28d761';

          return (
            <div
              className="absolute bg-white border-2 rounded-xl shadow-2xl pointer-events-none transition-all z-50 min-w-[300px] max-w-[350px]"
              style={{
                left: tooltip.x + 20,
                top: tooltip.y + 20,
                borderColor: vigilanceColor,
                boxShadow: `0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px ${vigilanceColor}20`,
              }}
            >
              {/* En-tête avec couleur de vigilance */}
              <div
                className="px-4 py-3 rounded-t-xl text-white font-bold text-lg flex items-center justify-between"
                style={{ backgroundColor: vigilanceColor }}
              >
                <span>{weatherInfo.lib_zone}</span>
                <span className="text-3xl">
                  {getWeatherEmoji(weatherInfo.weather_main, weatherInfo.weather_icon)}
                </span>
              </div>

              {/* Indicateur de vigilance */}
              {vigilanceData && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: vigilanceColor }}
                    ></div>
                    <span className="text-xs font-semibold text-gray-600">Vigilance:</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: vigilanceColor === '#FFFF00' ? '#B8860B' : vigilanceColor }}>
                    {vigilanceData.label}
                  </span>
                </div>
              )}

              {/* Corps du tooltip */}
              <div className="px-4 py-4 space-y-3">
                {/* Température principale */}
                <div className="text-center py-3 border-b border-gray-200">
                  <div className="text-4xl font-bold" style={{ color: tempColor }}>
                    {weatherInfo.temperature}°C
                  </div>
                  <div className="text-sm text-gray-600 mt-1 capitalize">
                    {weatherInfo.weather_description}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Ressenti: {weatherInfo.feels_like}°C
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="space-y-2">
                  {/* Vent */}
                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <div className="text-2xl">💨</div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Vent</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {weatherInfo.wind_speed} km/h {getWindDirection(weatherInfo.wind_deg)}
                      </div>
                    </div>
                  </div>

                  {/* Humidité */}
                  <div className="flex items-center gap-3 p-2 bg-cyan-50 rounded-lg">
                    <div className="text-2xl">💧</div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Humidité</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {weatherInfo.humidity}%
                      </div>
                    </div>
                  </div>

                  {/* Nuages */}
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="text-2xl">☁️</div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Couverture nuageuse</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {weatherInfo.clouds}%
                      </div>
                    </div>
                  </div>

                  {/* Températures min/max */}
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1 p-2 bg-blue-50 rounded-lg text-center">
                      <div className="text-xs text-gray-500">Min</div>
                      <div className="text-sm font-semibold text-blue-700">
                        {weatherInfo.temp_min}°C
                      </div>
                    </div>
                    <div className="flex-1 p-2 bg-red-50 rounded-lg text-center">
                      <div className="text-xs text-gray-500">Max</div>
                      <div className="text-sm font-semibold text-red-700">
                        {weatherInfo.temp_max}°C
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-gray-50 rounded-b-xl text-xs text-gray-600 text-center">
                Météo: OpenWeatherMap • Vigilance: Météo France
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
