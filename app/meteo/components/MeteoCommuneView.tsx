'use client';

import React from 'react';
import { MapPin, X } from 'lucide-react';
import { WeatherData } from '../types';
import { useCommuneForecast } from '../hooks/useMeteoForecast';
import { ForecastDisplay } from './ForecastDisplay';

type ForecastFilter = 'today' | 'tomorrow' | '3days';

interface MeteoCommuneViewProps {
    name: string;
    data: WeatherData;
    codeZone: string;
    archipelSunrise: string | null;
    archipelSunset: string | null;
    forecastFilter: ForecastFilter;
    onClose?: () => void;
}

export const MeteoCommuneView: React.FC<MeteoCommuneViewProps> = ({
    name,
    data,
    codeZone,
    // archipelSunrise, // Unused props kept for interface compatibility if needed, but not used
    // archipelSunset,
    forecastFilter,
    onClose
}) => {
    // Récupérer les prévisions pour cette commune
    const { forecast, loading: forecastLoading } = useCommuneForecast(codeZone);

    return (
        <section className="space-y-4">
            {/* En-tête commune avec icône et bouton de fermeture */}
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">{name}</span>
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
                        aria-label="Fermer la vue de la commune"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Affichage des prévisions avec structure unifiée */}
            <ForecastDisplay
                forecasts={forecast?.daily}
                currentWeather={data}
                filter={forecastFilter}
                loading={forecastLoading}
            />
        </section>
    );
};
