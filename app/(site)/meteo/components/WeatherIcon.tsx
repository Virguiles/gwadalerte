'use client';

import React from 'react';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Snowflake,
  Droplets,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { getWeatherIcon } from '@/lib/weather-codes';

// Mapping des noms d'icônes vers les composants Lucide
const iconMap: Record<string, LucideIcon> = {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Snowflake,
  Droplets,
  HelpCircle,
};

interface WeatherIconProps {
  iconName?: string; // Nom de l'icône (pour compatibilité avec l'ancien code)
  weatherCode?: number | null; // Code météo WMO (prioritaire)
  isDay?: boolean; // Indique si c'est le jour (pour déterminer l'icône jour/nuit)
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/**
 * Composant pour afficher une icône météo basée sur le code météo WMO
 * Utilise les icônes Lucide React avec distinction jour/nuit
 */
export function WeatherIcon({
  iconName,
  weatherCode,
  isDay = true,
  size = 24,
  className = '',
  strokeWidth = 2,
}: WeatherIconProps) {
  // Déterminer l'icône à utiliser
  let finalIconName: string;

  if (weatherCode !== undefined && weatherCode !== null) {
    // Utiliser le code météo avec la fonction getWeatherIcon qui prend en compte jour/nuit
    const hour = isDay ? 12 : 0; // 12h pour jour, 0h pour nuit
    finalIconName = getWeatherIcon(weatherCode, hour);
  } else if (iconName) {
    // Fallback sur le nom d'icône fourni (compatibilité)
    finalIconName = iconName;
  } else {
    finalIconName = 'HelpCircle';
  }

  // Récupérer le composant d'icône correspondant
  const IconComponent = iconMap[finalIconName] || HelpCircle;

  return (
    <IconComponent
      size={size}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}

export default WeatherIcon;
