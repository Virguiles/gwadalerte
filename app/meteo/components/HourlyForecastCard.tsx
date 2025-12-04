'use client';

import React, { useEffect, useState } from 'react';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Gauge,
  Navigation,
} from 'lucide-react';
import { HourlyForecast } from '../types';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastCardProps {
  hour: HourlyForecast;
}

/**
 * Composant pour afficher une carte horaire enrichie avec toutes les métriques météo
 */
export function HourlyForecastCard({ hour }: HourlyForecastCardProps) {
  // Hook pour détecter la taille d'écran
  const [iconSize, setIconSize] = useState(32);

  useEffect(() => {
    const updateIconSize = () => {
      if (window.innerWidth >= 768) {
        setIconSize(44); // md et plus
      } else if (window.innerWidth >= 640) {
        setIconSize(40); // sm
      } else {
        setIconSize(32); // mobile
      }
    };

    updateIconSize();
    window.addEventListener('resize', updateIconSize);
    return () => window.removeEventListener('resize', updateIconSize);
  }, []);

  // Vérifier si le ressenti est différent de la température
  const showFeelsLike = Math.abs(hour.feels_like - hour.temperature) >= 2;

  // Déterminer le gradient de fond selon l'heure (jour/nuit)
  const bgGradient = hour.is_day
    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900'
    : 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-900 dark:to-indigo-950';

  return (
    <div
      className={`min-w-[120px] sm:min-w-[140px] md:min-w-[160px] ${bgGradient} rounded-xl p-2 sm:p-3 md:p-4 border border-blue-100 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-200 flex flex-col gap-1 sm:gap-1.5 md:gap-2`}
      role="article"
      aria-label={`Prévisions météo pour ${hour.hour} : ${Math.round(hour.temperature)} degrés, ${hour.weather_description}`}
    >
      {/* Heure */}
      <div className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 text-center">
        {hour.hour}
      </div>

      {/* Icône météo centrale */}
      <div className="flex items-center justify-center my-1 sm:my-1.5 md:my-2">
        <WeatherIcon
          weatherCode={hour.weather_code}
          isDay={hour.is_day}
          iconName={hour.weather_icon}
          size={iconSize}
          className="text-sky-600 dark:text-sky-400"
        />
      </div>

      {/* Température principale */}
      <div className="flex items-center justify-center gap-2 mb-0.5 sm:mb-1">
        <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
          {Math.round(hour.temperature)}°C
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-600 my-0.5 sm:my-1" />

      {/* Métriques détaillées */}
      <div className="space-y-1 sm:space-y-1.5 text-[10px] sm:text-xs">
        {/* Ressenti thermique (si différent) */}
        {showFeelsLike && (
          <MetricRow
            icon={<Thermometer className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-400" />}
            label="Ressenti"
            value={`${Math.round(hour.feels_like)}°C`}
          />
        )}

        {/* Probabilité de précipitations */}
        <MetricRow
          icon={<Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500" />}
          label="Pluie"
          value={`${hour.precipitation_probability}%`}
        />

        {/* Quantité de pluie (si > 0) */}
        {hour.precipitation > 0 && (
          <MetricRow
            icon={<CloudRain className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />}
            label="Quantité"
            value={`${hour.precipitation.toFixed(1)} mm`}
          />
        )}

        {/* Vent avec direction */}
        <MetricRow
          icon={
            <Navigation
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-500"
              style={{ transform: `rotate(${hour.wind_deg}deg)` }}
            />
          }
          label="Vent"
          value={`${Math.round(hour.wind_speed)} km/h`}
        />

        {/* Humidité */}
        <MetricRow
          icon={<Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-500" />}
          label="Humidité"
          value={`${hour.humidity}%`}
        />

        {/* Nébulosité */}
        {hour.clouds > 0 && (
          <MetricRow
            icon={<Gauge className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />}
            label="Nuages"
            value={`${hour.clouds}%`}
          />
        )}
      </div>

      {/* Description météo */}
      <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-center text-gray-600 dark:text-gray-400 capitalize leading-tight">
        {hour.weather_description}
      </div>
    </div>
  );
}

/**
 * Composant pour afficher une ligne de métrique
 */
function MetricRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
      <div className="flex items-center gap-1 sm:gap-1.5">
        {icon}
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default HourlyForecastCard;
