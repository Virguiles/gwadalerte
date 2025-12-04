/**
 * Mapping des codes météo WMO (World Meteorological Organization)
 * Utilisés par Open-Meteo pour décrire les conditions météorologiques
 *
 * Documentation: https://open-meteo.com/en/docs
 * Référence WMO: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
 */

export interface WeatherCodeInfo {
  code: number;
  label: string;
  description: string;
  icon: string; // Nom de l'icône Lucide React
  iconNight?: string; // Icône alternative pour la nuit
  color: string; // Couleur associée (pour badges, etc.)
  intensity: 'calm' | 'light' | 'moderate' | 'heavy' | 'extreme';
}

/**
 * Mapping complet des codes météo WMO vers descriptions françaises
 */
export const WMO_WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  // Ciel dégagé et nuageux
  0: {
    code: 0,
    label: 'Ciel dégagé',
    description: 'Ciel parfaitement clair, sans nuages',
    icon: 'Sun',
    iconNight: 'Moon',
    color: '#FFD700',
    intensity: 'calm',
  },
  1: {
    code: 1,
    label: 'Principalement dégagé',
    description: 'Ciel majoritairement clair avec quelques nuages épars',
    icon: 'Sun',
    iconNight: 'Moon',
    color: '#FFD700',
    intensity: 'calm',
  },
  2: {
    code: 2,
    label: 'Partiellement nuageux',
    description: 'Alternance de soleil et de nuages',
    icon: 'CloudSun',
    iconNight: 'CloudMoon',
    color: '#87CEEB',
    intensity: 'calm',
  },
  3: {
    code: 3,
    label: 'Couvert',
    description: 'Ciel complètement couvert de nuages',
    icon: 'Cloud',
    iconNight: 'Cloud',
    color: '#A9A9A9',
    intensity: 'calm',
  },

  // Brouillard
  45: {
    code: 45,
    label: 'Brouillard',
    description: 'Brouillard réduisant la visibilité',
    icon: 'CloudFog',
    iconNight: 'CloudFog',
    color: '#B0C4DE',
    intensity: 'light',
  },
  48: {
    code: 48,
    label: 'Brouillard givrant',
    description: 'Brouillard avec dépôt de givre',
    icon: 'CloudFog',
    iconNight: 'CloudFog',
    color: '#E0FFFF',
    intensity: 'moderate',
  },

  // Bruine
  51: {
    code: 51,
    label: 'Bruine légère',
    description: 'Fines gouttelettes de pluie légère',
    icon: 'CloudDrizzle',
    iconNight: 'CloudDrizzle',
    color: '#87CEFA',
    intensity: 'light',
  },
  53: {
    code: 53,
    label: 'Bruine modérée',
    description: 'Bruine continue modérée',
    icon: 'CloudDrizzle',
    iconNight: 'CloudDrizzle',
    color: '#6495ED',
    intensity: 'moderate',
  },
  55: {
    code: 55,
    label: 'Bruine dense',
    description: 'Bruine intense et persistante',
    icon: 'CloudDrizzle',
    iconNight: 'CloudDrizzle',
    color: '#4169E1',
    intensity: 'heavy',
  },

  // Bruine verglaçante
  56: {
    code: 56,
    label: 'Bruine verglaçante légère',
    description: 'Bruine légère qui gèle au contact du sol',
    icon: 'CloudDrizzle',
    iconNight: 'CloudDrizzle',
    color: '#ADD8E6',
    intensity: 'light',
  },
  57: {
    code: 57,
    label: 'Bruine verglaçante dense',
    description: 'Bruine dense qui gèle au contact du sol',
    icon: 'CloudDrizzle',
    iconNight: 'CloudDrizzle',
    color: '#87CEEB',
    intensity: 'moderate',
  },

  // Pluie
  61: {
    code: 61,
    label: 'Pluie légère',
    description: 'Pluie fine et intermittente',
    icon: 'CloudRain',
    iconNight: 'CloudRain',
    color: '#6495ED',
    intensity: 'light',
  },
  63: {
    code: 63,
    label: 'Pluie modérée',
    description: 'Pluie continue d\'intensité moyenne',
    icon: 'CloudRain',
    iconNight: 'CloudRain',
    color: '#4169E1',
    intensity: 'moderate',
  },
  65: {
    code: 65,
    label: 'Pluie forte',
    description: 'Pluie intense et abondante',
    icon: 'CloudRain',
    iconNight: 'CloudRain',
    color: '#0000CD',
    intensity: 'heavy',
  },

  // Pluie verglaçante
  66: {
    code: 66,
    label: 'Pluie verglaçante légère',
    description: 'Pluie légère qui gèle au contact du sol',
    icon: 'CloudRain',
    iconNight: 'CloudRain',
    color: '#B0E0E6',
    intensity: 'light',
  },
  67: {
    code: 67,
    label: 'Pluie verglaçante forte',
    description: 'Pluie forte qui gèle au contact du sol',
    icon: 'CloudRain',
    iconNight: 'CloudRain',
    color: '#87CEEB',
    intensity: 'heavy',
  },

  // Neige
  71: {
    code: 71,
    label: 'Neige légère',
    description: 'Chutes de neige légères',
    icon: 'CloudSnow',
    iconNight: 'CloudSnow',
    color: '#F0F8FF',
    intensity: 'light',
  },
  73: {
    code: 73,
    label: 'Neige modérée',
    description: 'Chutes de neige modérées',
    icon: 'CloudSnow',
    iconNight: 'CloudSnow',
    color: '#E6E6FA',
    intensity: 'moderate',
  },
  75: {
    code: 75,
    label: 'Neige forte',
    description: 'Fortes chutes de neige',
    icon: 'CloudSnow',
    iconNight: 'CloudSnow',
    color: '#D8BFD8',
    intensity: 'heavy',
  },

  // Grains de neige
  77: {
    code: 77,
    label: 'Grains de neige',
    description: 'Petits grains de glace blancs et opaques',
    icon: 'CloudSnow',
    iconNight: 'CloudSnow',
    color: '#FFFAFA',
    intensity: 'light',
  },

  // Averses de pluie
  80: {
    code: 80,
    label: 'Averses légères',
    description: 'Averses de pluie légères et brèves',
    icon: 'CloudRain',
    iconNight: 'CloudRain',
    color: '#87CEFA',
    intensity: 'light',
  },
  81: {
    code: 81,
    label: 'Averses modérées',
    description: 'Averses de pluie d\'intensité modérée',
    icon: 'CloudRain',
    iconNight: 'CloudRain',
    color: '#4682B4',
    intensity: 'moderate',
  },
  82: {
    code: 82,
    label: 'Averses violentes',
    description: 'Averses de pluie intenses et soudaines',
    icon: 'CloudRain',
    iconNight: 'CloudRain',
    color: '#0000FF',
    intensity: 'heavy',
  },

  // Averses de neige
  85: {
    code: 85,
    label: 'Averses de neige légères',
    description: 'Brèves averses de neige légères',
    icon: 'CloudSnow',
    iconNight: 'CloudSnow',
    color: '#F0FFFF',
    intensity: 'light',
  },
  86: {
    code: 86,
    label: 'Averses de neige fortes',
    description: 'Averses de neige intenses',
    icon: 'CloudSnow',
    iconNight: 'CloudSnow',
    color: '#E0FFFF',
    intensity: 'heavy',
  },

  // Orages
  95: {
    code: 95,
    label: 'Orage',
    description: 'Orage avec éclairs et tonnerre',
    icon: 'CloudLightning',
    iconNight: 'CloudLightning',
    color: '#FFD700',
    intensity: 'moderate',
  },
  96: {
    code: 96,
    label: 'Orage avec grêle légère',
    description: 'Orage accompagné de petits grêlons',
    icon: 'CloudLightning',
    iconNight: 'CloudLightning',
    color: '#FFA500',
    intensity: 'heavy',
  },
  99: {
    code: 99,
    label: 'Orage avec grêle forte',
    description: 'Orage violent avec gros grêlons',
    icon: 'CloudLightning',
    iconNight: 'CloudLightning',
    color: '#FF4500',
    intensity: 'extreme',
  },
};

/**
 * Récupère les informations d'un code météo WMO
 * Retourne des valeurs par défaut si le code n'est pas trouvé
 */
export function getWeatherInfo(code: number | undefined | null): WeatherCodeInfo {
  if (code === undefined || code === null) {
    return {
      code: -1,
      label: 'Données indisponibles',
      description: 'Les conditions météorologiques ne sont pas disponibles',
      icon: 'HelpCircle',
      iconNight: 'HelpCircle',
      color: '#CCCCCC',
      intensity: 'calm',
    };
  }

  return WMO_WEATHER_CODES[code] || {
    code: code,
    label: `Code ${code}`,
    description: 'Conditions météorologiques non reconnues',
    icon: 'Cloud',
    iconNight: 'Cloud',
    color: '#A9A9A9',
    intensity: 'calm',
  };
}

/**
 * Détermine si c'est actuellement la nuit en Guadeloupe
 * (basé sur le lever/coucher du soleil approximatif)
 */
export function isNightTime(hour?: number): boolean {
  const currentHour = hour ?? new Date().getHours();
  // En Guadeloupe, le soleil se lève vers 5h30-6h30 et se couche vers 17h30-18h30
  return currentHour < 6 || currentHour >= 18;
}

/**
 * Récupère l'icône appropriée selon l'heure (jour/nuit)
 */
export function getWeatherIcon(code: number | undefined | null, hour?: number): string {
  const info = getWeatherInfo(code);
  if (isNightTime(hour) && info.iconNight) {
    return info.iconNight;
  }
  return info.icon;
}

/**
 * Détermine une couleur de fond selon les conditions météo
 * Utile pour les cartes ou badges
 */
export function getWeatherBackgroundColor(code: number | undefined | null): string {
  const info = getWeatherInfo(code);

  // Ajuster l'opacité selon l'intensité
  switch (info.intensity) {
    case 'calm':
      return `${info.color}20`; // 12% opacity
    case 'light':
      return `${info.color}30`; // 19% opacity
    case 'moderate':
      return `${info.color}40`; // 25% opacity
    case 'heavy':
      return `${info.color}50`; // 31% opacity
    case 'extreme':
      return `${info.color}60`; // 38% opacity
    default:
      return `${info.color}20`;
  }
}

/**
 * Obtient une description courte pour les badges/tags
 */
export function getShortWeatherLabel(code: number | undefined | null): string {
  const info = getWeatherInfo(code);

  // Labels courts pour l'affichage compact
  const shortLabels: Record<number, string> = {
    0: 'Soleil',
    1: 'Dégagé',
    2: 'Nuageux',
    3: 'Couvert',
    45: 'Brouillard',
    48: 'Brouillard',
    51: 'Bruine',
    53: 'Bruine',
    55: 'Bruine',
    61: 'Pluie',
    63: 'Pluie',
    65: 'Pluie',
    80: 'Averses',
    81: 'Averses',
    82: 'Averses',
    95: 'Orage',
    96: 'Orage',
    99: 'Orage',
  };

  if (code !== undefined && code !== null && shortLabels[code]) {
    return shortLabels[code];
  }

  return info.label;
}

/**
 * Récupère une description météo adaptée selon l'heure (jour/nuit)
 * Remplace les références au soleil par la lune la nuit
 */
export function getWeatherDescription(
  code: number | undefined | null,
  isDay: boolean | undefined | null = true,
  hour?: number
): string {
  const info = getWeatherInfo(code);
  let description = info.description;

  // Déterminer si c'est la nuit
  // Priorité à isDay de l'API, mais vérifier aussi l'heure si disponible
  let isNight = false;

  if (isDay !== undefined && isDay !== null) {
    // Utiliser la valeur isDay de l'API
    isNight = !isDay;
  }

  // Si on a aussi l'heure, faire une double vérification
  // (l'heure peut être plus fiable dans certains cas)
  if (hour !== undefined) {
    const isNightByHour = isNightTime(hour);
    // Si l'heure indique la nuit, on considère que c'est la nuit
    // (même si isDay dit le contraire, l'heure locale est plus fiable)
    if (isNightByHour) {
      isNight = true;
    }
  }

  if (isNight) {
    // Remplacer les références au soleil par la lune
    description = description
      .replace(/soleil/gi, 'lune')
      .replace(/Soleil/gi, 'Lune')
      .replace(/du soleil/gi, 'de la lune')
      .replace(/Du soleil/gi, 'De la lune')
      .replace(/le soleil/gi, 'la lune')
      .replace(/Le soleil/gi, 'La lune');
  }

  return description;
}

/**
 * Détermine si les conditions météo sont favorables
 */
export function isFavorableWeather(code: number | undefined | null): boolean {
  if (code === undefined || code === null) return true;

  // Codes favorables: ciel dégagé à partiellement nuageux
  return code <= 3;
}

/**
 * Détermine si les conditions météo nécessitent une alerte
 */
export function isAlertWeather(code: number | undefined | null): boolean {
  if (code === undefined || code === null) return false;

  // Codes d'alerte: pluie forte, orages
  return code >= 65 || code >= 95;
}
