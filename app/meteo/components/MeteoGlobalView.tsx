import React from 'react';
import { CloudSun } from 'lucide-react';
import { WeatherCard } from './WeatherCard';

interface MeteoGlobalViewProps {
    avgTemperature: number | null;
    generalWeather: string | null;
    sunrise: string | null;
    sunset: string | null;
    avgWindSpeed: number | null;
    seaState: string;
}

export const MeteoGlobalView: React.FC<MeteoGlobalViewProps> = ({
    avgTemperature,
    generalWeather,
    sunrise,
    sunset,
    avgWindSpeed,
    seaState
}) => {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CloudSun className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                Guadeloupe
            </h2>
            <WeatherCard
                temperature={avgTemperature}
                weatherDescription={generalWeather}
                sunrise={sunrise}
                sunset={sunset}
                windSpeed={avgWindSpeed}
                seaState={seaState}
                isGlobalView={true}
            />
        </section>
    );
};
