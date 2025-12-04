import React from 'react';
import { AlertTriangle, Droplets, Wind } from 'lucide-react';
import { VigilanceData } from '../../meteo/types';
import { AirData } from '../../components/GuadeloupeMap';
import { WaterDataMap } from '../../tours-deau/types';
import { hasCutsOnDay } from '../../tours-deau/utils';

const DEFAULT_VIGILANCE_COLOR = '#28d761';
const NAMED_VIGILANCE_COLORS: Record<string, string> = {
  vert: '#28d761',
  jaune: '#f0d53c',
  orange: '#FF9900',
  rouge: '#FF0000',
};

const normalizeVigilanceColor = (value?: string): string => {
  if (!value) {
    return DEFAULT_VIGILANCE_COLOR;
  }

  const trimmed = value.trim();
  const named = NAMED_VIGILANCE_COLORS[trimmed.toLowerCase()];
  if (named) {
    return named;
  }

  const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  if (!hexRegex.test(hex)) {
    return DEFAULT_VIGILANCE_COLOR;
  }

  if (hex.length === 4) {
    const [, r, g, b] = hex;
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return hex;
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;

  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return { r, g, b };
};

const getContrastTextColor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? '#1f2937' : '#ffffff';
};

const getHighlightColor = (hex: string, alpha = 0.18) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
  const vigilanceColor = normalizeVigilanceColor(vigilance?.color);
  const vigilanceBadgeBg = getHighlightColor(vigilanceColor);
  const vigilanceIconTextColor = getContrastTextColor(vigilanceColor);

  const vigilanceLabel = vigilance?.label || 'Aucune vigilance';

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
      <div
        className="bg-white rounded-xl p-6 shadow-md border flex items-center gap-4"
        style={{ borderColor: vigilanceBadgeBg }}
      >
        <div
          className="p-3 rounded-full shadow-sm"
          style={{ backgroundColor: vigilanceColor }}
        >
           <AlertTriangle className="w-6 h-6" style={{ color: vigilanceIconTextColor }} />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vigilance Météo</p>
          <span
            className="inline-flex w-fit items-center px-2.5 py-1 text-xs font-semibold rounded-full border"
            style={{
              backgroundColor: vigilanceBadgeBg,
              borderColor: vigilanceColor,
              color: vigilanceColor,
            }}
          >
            {vigilanceLabel}
          </span>
          {vigilance?.department_name && (
            <p className="text-xs text-gray-500">{vigilance.department_name}</p>
          )}
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
