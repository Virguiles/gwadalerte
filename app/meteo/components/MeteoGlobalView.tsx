import React, { useMemo } from 'react';
import { useArchipelForecast } from '../hooks/useArchipelForecast';
import { WeatherData } from '../types';
import { ForecastDisplay } from './ForecastDisplay';
import { WeatherIcon } from './WeatherIcon';
import { isNightTime } from '@/lib/weather-codes';

type ForecastFilter = 'today' | 'tomorrow' | '3days';

interface MeteoGlobalViewProps {
    avgTemperature: number | null;
    generalWeather: string | null;
    sunrise: string | null;
    sunset: string | null;
    avgWindSpeed: number | null;
    forecastFilter: ForecastFilter;
}

export const MeteoGlobalView: React.FC<MeteoGlobalViewProps> = ({
    avgTemperature,
    generalWeather,
    sunrise,
    sunset,
    avgWindSpeed,
    forecastFilter,
}) => {
    // Récupérer les prévisions agrégées de l'archipel
    const { forecast, loading } = useArchipelForecast();

    // Déterminer si c'est le jour ou la nuit
    const isDay = !isNightTime();

    // Récupérer le code météo du jour actuel depuis les prévisions
    const currentWeatherCode = forecast?.daily?.[0]?.weather_code;

    // Créer un objet WeatherData virtuel pour l'archipel (données actuelles)
    const archipelCurrentWeather: WeatherData | null = useMemo(() => {
        if (avgTemperature === null) return null;

        return {
            lib_zone: 'Guadeloupe',
            code_zone: '971',
            temperature: avgTemperature,
            feels_like: null,
            temp_min: null,
            temp_max: null,
            humidity: null,
            pressure: null,
            wind_speed: avgWindSpeed,
            wind_deg: null,
            wind_gust: null,
            weather_main: generalWeather || '',
            weather_description: generalWeather || '',
            weather_icon: 'Sun', // Par défaut
            clouds: null,
            visibility: null,
            dew_point: null,
            sunrise: sunrise,
            sunset: sunset,
            timezone: null,
            rain_1h: null,
            rain_3h: null,
            uv_index: null,
        };
    }, [avgTemperature, avgWindSpeed, generalWeather, sunrise, sunset]);

    return (
        <section className="space-y-4">
            {/* En-tête archipel avec structure unifiée */}
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <WeatherIcon
                        weatherCode={currentWeatherCode}
                        isDay={isDay}
                        size={24}
                        className="text-blue-600 dark:text-blue-400"
                    />
                    <span>Guadeloupe</span>
                </h2>
            </div>

            {/* Affichage des prévisions avec structure unifiée */}
            <ForecastDisplay
                forecasts={forecast?.daily}
                currentWeather={archipelCurrentWeather}
                filter={forecastFilter}
                loading={loading}
            />
        </section>
    );
};
