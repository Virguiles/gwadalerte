import React from 'react';
import { MapPin } from 'lucide-react';
import { WeatherData } from '../types';
import { WeatherCard } from './WeatherCard';

interface MeteoCommuneViewProps {
    name: string;
    data: WeatherData;
    archipelSunrise: string | null;
    archipelSunset: string | null;
    onClose?: () => void;
}

export const MeteoCommuneView: React.FC<MeteoCommuneViewProps> = ({
    name,
    data,
    archipelSunrise,
    archipelSunset,
    onClose
}) => {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-between gap-2 relative">
                <div className="flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    {name}
                </div>
                {/* Espace réservé pour le bouton - toujours présent pour éviter les décalages */}
                <div className="w-6 h-6"></div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 absolute right-0"
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                )}
            </h2>

            <WeatherCard
                temperature={data.temperature}
                weatherDescription={data.weather_description}
                sunrise={data.sunrise || archipelSunrise}
                sunset={data.sunset || archipelSunset}
                windSpeed={data.wind_speed}
                humidity={data.humidity}
                isGlobalView={false}
            />
        </section>
    );
};
