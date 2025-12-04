'use client';

import React from 'react';
import {
  CloudRain,
  Wind,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { DailyForecast, WeatherData } from '../types';
import { WeatherIcon } from './WeatherIcon';
import { HourlyForecastCard } from './HourlyForecastCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ForecastDayViewProps {
  dayForecast: DailyForecast | null;
  currentWeather?: WeatherData | null;
  loading?: boolean;
  isToday?: boolean;
}

export function ForecastDayView({
  dayForecast,
  currentWeather,
  loading = false,
  isToday = false,
}: ForecastDayViewProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    );
  }

  if (!dayForecast) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>Prévisions non disponibles</p>
      </div>
    );
  }

  // Utiliser les données actuelles si c'est aujourd'hui, sinon les données du jour
  const displayTemp = isToday && currentWeather?.temperature
    ? currentWeather.temperature
    : (dayForecast.temp_max + dayForecast.temp_min) / 2;

  const displayWeather = isToday && currentWeather
    ? currentWeather
    : {
      weather_icon: dayForecast.weather_icon,
      weather_main: dayForecast.weather_main,
      weather_description: dayForecast.weather_description,
      weather_code: dayForecast.weather_code,
      is_day: true, // Pour les prévisions journalières, on utilise l'icône du jour
    };

  const rainRisk = Math.round(dayForecast.precipitation_probability);

  return (
    <div className="space-y-4">
      {/* En-tête simplifié avec date */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">
            {dayForecast.day_name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {dayForecast.date_formatted}
          </p>
        </div>
        {/* Températures min/max en en-tête */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-red-500 dark:text-red-400 font-semibold">
            {dayForecast.temp_max}°
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-blue-500 dark:text-blue-400 font-semibold">
            {dayForecast.temp_min}°
          </span>
        </div>
      </div>

      {/* Carte principale météo simplifiée */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-100 dark:from-slate-800 dark:to-blue-900/30 rounded-xl p-5 border border-sky-200 dark:border-sky-800/50">
        <div className="flex items-center gap-5">
          <WeatherIcon
            weatherCode={'weather_code' in displayWeather ? displayWeather.weather_code : dayForecast.weather_code}
            isDay={'is_day' in displayWeather ? (displayWeather.is_day ?? true) : true}
            iconName={displayWeather.weather_icon}
            size={64}
            className="text-sky-600 dark:text-sky-400"
          />
          <div className="flex-1">
            <div className="text-5xl font-bold text-slate-800 dark:text-white mb-1">
              {Math.round(displayTemp)}°C
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 capitalize">
              {displayWeather.weather_description || displayWeather.weather_main}
            </div>
          </div>
        </div>
      </div>

      {/* Métriques compactes */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<CloudRain className="w-5 h-5 text-sky-400" />}
          label="Pluie"
          value={`${rainRisk}%`}
        />
        <MetricCard
          icon={<Wind className="w-5 h-5 text-sky-300" />}
          label="Vent"
          value={`${dayForecast.wind_speed_max} km/h`}
        />
      </div>

      {/* Lever/Coucher du soleil */}
      <SunTimelineCard sunrise={dayForecast.sunrise} sunset={dayForecast.sunset} />

      {/* Prévisions horaires */}
      {dayForecast.hourly && dayForecast.hourly.length > 0 && (
        <div className="mt-4">
          <h4
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3"
            id="hourly-forecast-heading"
          >
            Prévisions horaires
          </h4>
          <ScrollArea
            className="w-full"
            aria-labelledby="hourly-forecast-heading"
          >
            <div
              className="flex gap-3 pb-4"
              role="list"
              aria-label="Prévisions météo horaires"
            >
              {dayForecast.hourly.map((hour, index) => (
                <HourlyForecastCard key={index} hour={hour} />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// Composant pour les cartes métriques simplifiées
function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      </div>
      <div className="text-lg font-bold text-slate-800 dark:text-white">{value}</div>
    </div>
  );
}

function SunTimelineCard({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 rounded-lg p-3 border border-amber-200/50 dark:border-slate-700">
      <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700">
        <div className="flex items-center gap-2 pr-3">
          <Sunrise className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Lever</div>
            <div className="text-base font-semibold text-slate-800 dark:text-white">{sunrise}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-3">
          <Sunset className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
          <div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Coucher</div>
            <div className="text-base font-semibold text-slate-800 dark:text-white">{sunset}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
