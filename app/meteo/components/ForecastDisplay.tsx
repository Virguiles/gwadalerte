'use client';

import React from 'react';
import { DailyForecast, WeatherData } from '../types';
import { ForecastDayView } from './ForecastDayView';
import { useForecastProcessing } from '../hooks/useForecastLogic';

type ForecastFilter = 'today' | 'tomorrow' | '3days';

interface ForecastDisplayProps {
  forecasts: DailyForecast[] | undefined;
  currentWeather: WeatherData | null;
  filter: ForecastFilter;
  loading: boolean;
}

export function ForecastDisplay({
  forecasts,
  currentWeather,
  filter,
  loading
}: ForecastDisplayProps) {
  const { todayForecast, tomorrowForecast, threeDaysForecast } = useForecastProcessing(forecasts);

  // Déterminer quelle prévision afficher selon le filtre
  const getSelectedForecast = () => {
    switch (filter) {
      case 'today':
        return { forecast: todayForecast, isToday: true };
      case 'tomorrow':
        return { forecast: tomorrowForecast, isToday: false };
      case '3days':
        return { forecast: threeDaysForecast, isToday: false };
      default:
        return { forecast: todayForecast, isToday: true };
    }
  };

  const { forecast, isToday } = getSelectedForecast();

  // Gestion de l'état de chargement
  if (loading) {
    return (
      <div className="relative min-h-[200px]">
        <ForecastDayView
          dayForecast={null}
          currentWeather={null}
          loading={true}
          isToday={false}
        />
      </div>
    );
  }

  // Gestion de l'absence de données
  if (!forecast && !loading) {
    return (
      <div className="relative min-h-[200px] flex items-center justify-center">
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Prévisions non disponibles pour cette période
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[200px]">
      {/* Transition fluide avec animation lors du changement de filtre */}
      <div
        key={filter}
        className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
      >
        <ForecastDayView
          dayForecast={forecast}
          currentWeather={isToday ? currentWeather : null}
          loading={false}
          isToday={isToday}
        />
      </div>
    </div>
  );
}
