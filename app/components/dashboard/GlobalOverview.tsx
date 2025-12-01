import React from 'react';
import { AlertTriangle, Droplets, Wind } from 'lucide-react';
import { VigilanceData } from '../../meteo/types';
import { AirData } from '../../components/GuadeloupeMap';
import { WaterDataMap } from '../../tours-deau/types';
import { hasCutsOnDay } from '../../tours-deau/utils';

interface GlobalOverviewProps {
  vigilance: VigilanceData | null;
  airData: AirData;
  waterData: WaterDataMap;
}

export const GlobalOverview: React.FC<GlobalOverviewProps> = ({
  vigilance,
  airData,
  waterData
}) => {
  // --- Calcul Météo ---
  const getVigilanceColor = (color: string | undefined) => {
    switch (color?.toLowerCase()) {
      case 'rouge': return 'bg-red-500 text-white';
      case 'orange': return 'bg-orange-500 text-white';
      case 'jaune': return 'bg-yellow-400 text-gray-900';
      default: return 'bg-green-500 text-white';
    }
  };

  const vigilanceLabel = vigilance?.label || 'Aucune vigilance';
  const vigilanceColorClass = getVigilanceColor(vigilance?.color);

  // --- Calcul Air ---
  // On compte le nombre de communes avec un indice > 4 (Mauvais)
  const airAlertCount = Object.values(airData).filter(d => {
    // code_qual: 1=Bon ... 6=Extrêmement Mauvais. On alerte à partir de 4 (Mauvais) ?
    // Ou on regarde le libellé. "Mauvais", "Très Mauvais", "Extrêmement Mauvais"
    const badLabels = ['Mauvais', 'Très Mauvais', 'Extrêmement Mauvais'];
    return d.lib_qual && badLabels.includes(d.lib_qual);
  }).length;

  const airGlobalStatus = airAlertCount > 0
    ? `${airAlertCount} commune${airAlertCount > 1 ? 's' : ''} en mauvaise qualité`
    : "Qualité globale bonne à moyenne";
  const airColorClass = airAlertCount > 0 ? "text-orange-600 bg-orange-50" : "text-teal-600 bg-teal-50";

  // --- Calcul Eau ---
  const today = new Date();
  const waterCutsCount = Object.values(waterData).filter(commune => {
    if (!commune.details || commune.details.length === 0) return false;
    return hasCutsOnDay(commune, today);
  }).length;

  const waterStatus = waterCutsCount > 0
    ? `${waterCutsCount} commune${waterCutsCount > 1 ? 's' : ''} avec tours d'eau`
    : "Aucun tour d'eau signalé aujourd'hui";
  const waterColorClass = waterCutsCount > 0 ? "text-blue-600 bg-blue-50" : "text-gray-600 bg-gray-50";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl mx-auto mb-10">
      {/* Card Météo */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-full ${vigilanceColorClass} shadow-sm`}>
           <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vigilance Météo</p>
          <p className="text-lg font-bold text-gray-800">{vigilanceLabel}</p>
          {vigilance?.department_name && <p className="text-xs text-gray-500">{vigilance.department_name}</p>}
        </div>
      </div>

      {/* Card Air */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-full ${airColorClass} shadow-sm`}>
           <Wind className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Qualité de l'Air</p>
          <p className="text-lg font-bold text-gray-800">{airGlobalStatus}</p>
          <p className="text-xs text-gray-500">Sur l'ensemble de l'archipel</p>
        </div>
      </div>

      {/* Card Eau */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-full ${waterColorClass} shadow-sm`}>
           <Droplets className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Eau Potable</p>
          <p className="text-lg font-bold text-gray-800">{waterStatus}</p>
          <p className="text-xs text-gray-500">Coupures programmées ce jour</p>
        </div>
      </div>
    </div>
  );
};
