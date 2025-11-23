import React from 'react';
import Link from 'next/link';
import { WeatherData } from '../../meteo/types';
import { CommuneData } from '../../components/GuadeloupeMap';
import { WaterCutData } from '../../tours-deau/types';
import { ArrowRight, CloudRain, Droplets, Wind, Thermometer } from 'lucide-react';
import { hasCutsOnDay } from '../../tours-deau/utils';

interface CommuneDashboardProps {
  communeName: string;
  weather?: WeatherData;
  air?: CommuneData;
  water?: WaterCutData;
}

export const CommuneDashboard: React.FC<CommuneDashboardProps> = ({
  communeName,
  weather,
  air,
  water
}) => {
  // --- Helpers ---
  const formatTemp = (t: number | null | undefined) => t ? Math.round(t) : '--';

  // Check Water Cuts for Today
  const today = new Date();
  const hasWaterCut = water && hasCutsOnDay(water, today);

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Situation à <span className="text-blue-600 capitalize">{communeName.toLowerCase()}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Météo Card */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <CloudRain className="w-8 h-8 text-blue-600" />
              </div>
              {weather?.weather_icon && (
                 <img
                 src={`https://openweathermap.org/img/wn/${weather.weather_icon}@2x.png`}
                 alt={weather.weather_description}
                 className="w-16 h-16 -my-4"
               />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Météo</h3>
            <p className="text-gray-500 text-sm mb-4 capitalize">{weather?.weather_description || "Chargement..."}</p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <span className="text-3xl font-bold text-gray-900">{formatTemp(weather?.temperature)}°</span>
              </div>
              <div className="text-sm text-gray-500">
                <p>Ressenti {formatTemp(weather?.feels_like)}°</p>
                <p>Humidité {weather?.humidity}%</p>
              </div>
            </div>
          </div>
          <Link
            href="/meteo"
            className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
          >
            Voir les prévisions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2. Air Quality Card */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-teal-50 p-3 rounded-xl">
                <Wind className="w-8 h-8 text-teal-600" />
              </div>
              {air?.coul_qual && (
                <div
                  className="px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm"
                  style={{ backgroundColor: air.coul_qual }}
                >
                  {air.lib_qual}
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Qualité de l'Air</h3>
            <p className="text-gray-500 text-sm mb-4">Indice ATMO actuel</p>

            {air?.code_pm10 ? (
              <div className="space-y-2">
                 <p className="text-sm text-gray-600">
                   Qualité globale: <span className="font-bold" style={{ color: air.coul_qual }}>{air.lib_qual}</span>
                 </p>
                 <p className="text-xs text-gray-400">
                   Données Gwad'Air
                 </p>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">Données non disponibles pour cette zone.</p>
            )}
          </div>
          <Link
            href="/qualite-air"
            className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-teal-600 font-semibold hover:bg-teal-50 transition-colors"
          >
            Détails des polluants
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3. Water Card */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 flex-1">
             <div className="flex justify-between items-start mb-4">
              <div className="bg-cyan-50 p-3 rounded-xl">
                <Droplets className="w-8 h-8 text-cyan-600" />
              </div>
              {hasWaterCut && (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wide">
                  Coupure en cours
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Eau Potable</h3>
            <p className="text-gray-500 text-sm mb-4">Tours d'eau programmés</p>

            {hasWaterCut ? (
               <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                 <p className="text-red-800 font-medium text-sm">
                   Des coupures sont prévues aujourd'hui sur votre secteur.
                 </p>
               </div>
            ) : (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="text-green-800 font-medium text-sm">
                   Aucun tour d'eau signalé aujourd'hui pour cette commune.
                </p>
              </div>
            )}
          </div>
          <Link
            href="/tours-deau"
            className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-cyan-600 font-semibold hover:bg-cyan-50 transition-colors"
          >
            Voir le planning
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
