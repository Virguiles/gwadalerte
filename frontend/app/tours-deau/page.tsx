'use client';

import { useState, useEffect, useMemo } from 'react';
// On RÉUTILISE nos composants et types !
import GuadeloupeMap, { HoverInfo, AirData } from '../components/GuadeloupeMap';

// Nouveau Type pour les données d'eau
type WaterCutDetail = {
  secteur: string;
  horaires: string;
  zones_alimentation_favorables?: string;
};

type WaterCutData = {
  commune: string;
  details: WaterCutDetail[];
};

type WaterDataMap = {
  [code_zone: string]: WaterCutData;
};

// Palette de couleurs prédéfinies par commune (en dehors du composant)
const communeColors: { [key: string]: { primary: string; light: string; border: string } } = {
  'LES ABYMES': { primary: '#3B82F6', light: '#DBEAFE', border: '#2563EB' }, // Bleu
  'SAINTE-ANNE': { primary: '#10B981', light: '#D1FAE5', border: '#059669' }, // Vert
  'SAINT-FRANÇOIS': { primary: '#F59E0B', light: '#FEF3C7', border: '#D97706' }, // Orange
  'LE GOSIER': { primary: '#8B5CF6', light: '#EDE9FE', border: '#7C3AED' }, // Violet
  'GOYAVE': { primary: '#EC4899', light: '#FCE7F3', border: '#DB2777' }, // Rose
  'SAINTE-ROSE': { primary: '#06B6D4', light: '#CFFAFE', border: '#0891B2' }, // Cyan
  'CAPESTERRE-BELLE-EAU': { primary: '#F97316', light: '#FFEDD5', border: '#EA580C' }, // Orange foncé
  'TERRE-DE-HAUT (LES SAINTES)': { primary: '#14B8A6', light: '#CCFBF1', border: '#0D9488' }, // Turquoise
  'TERRE-DE-BAS (LES SAINTES)': { primary: '#14B8A6', light: '#CCFBF1', border: '#0D9488' },
  'TROIS-RIVIÈRES': { primary: '#EF4444', light: '#FEE2E2', border: '#DC2626' }, // Rouge
  'GOURBEYRE': { primary: '#84CC16', light: '#ECFCCB', border: '#65A30D' }, // Vert lime
  'SAINT-CLAUDE': { primary: '#A855F7', light: '#F3E8FF', border: '#9333EA' }, // Violet foncé
  'LA DÉSIRADE': { primary: '#0EA5E9', light: '#E0F2FE', border: '#0284C7' }, // Bleu ciel
};

// Palette de couleurs supplémentaires pour générer des couleurs uniques
const colorPalette = [
  { primary: '#22C55E', light: '#DCFCE7', border: '#16A34A' }, // Vert émeraude
  { primary: '#FBBF24', light: '#FEF3C7', border: '#F59E0B' }, // Jaune
  { primary: '#FB7185', light: '#FFE4E6', border: '#F43F5E' }, // Rose foncé
  { primary: '#34D399', light: '#D1FAE5', border: '#10B981' }, // Vert menthe
  { primary: '#F472B6', light: '#FCE7F3', border: '#EC4899' }, // Rose
  { primary: '#60A5FA', light: '#DBEAFE', border: '#3B82F6' }, // Bleu clair
  { primary: '#A78BFA', light: '#EDE9FE', border: '#8B5CF6' }, // Violet clair
  { primary: '#F87171', light: '#FEE2E2', border: '#EF4444' }, // Rouge clair
  { primary: '#4ADE80', light: '#D1FAE5', border: '#22C55E' }, // Vert clair
  { primary: '#38BDF8', light: '#E0F2FE', border: '#0EA5E9' }, // Bleu ciel clair
];

// Fonction pour générer une couleur unique basée sur le nom de la commune
function generateColorFromName(communeName: string): { primary: string; light: string; border: string } {
  // Hash simple pour convertir le nom en nombre
  let hash = 0;
  for (let i = 0; i < communeName.length; i++) {
    hash = communeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Utiliser le hash pour sélectionner une couleur de la palette
  const colorIndex = Math.abs(hash) % colorPalette.length;
  return colorPalette[colorIndex];
}

// Fonction pour obtenir toutes les couleurs d'une commune (avec génération automatique si nécessaire)
function getCommuneColors(communeName: string) {
  if (communeColors[communeName]) {
    return communeColors[communeName];
  }
  // Générer une couleur unique pour les communes non dans la liste
  return generateColorFromName(communeName);
}

export default function WaterMapPage() {
  const [waterData, setWaterData] = useState<WaterDataMap>({});
  const [tooltip, setTooltip] = useState<HoverInfo | null>(null);

  // 1. Récupérer les données de notre NOUVELLE API
  useEffect(() => {
    // On appelle le nouveau endpoint
    fetch('http://127.0.0.1:8000/api/water-cuts')
      .then((res) => res.json())
      .then((data) => {
        setWaterData(data);
      })
      .catch(console.error);
  }, []);

  // 2. Logique de couleur (différente de la qualité de l'air)
  const getCommuneColor = (code_zone: string): string => {
    const commune = waterData[code_zone];
    if (commune && commune.details.length > 0) {
      const colors = getCommuneColors(commune.commune);
      return colors.primary;
    }
    return '#B9B9B9'; // Gris (par défaut pour communes non concernées)
  };

  // 3. Logique d'infobulle (différente)
  const handleCommuneHover = (info: HoverInfo) => {
    const code_zone = info.data.code_zone; // On a besoin du code
    if (!code_zone) return;

    const communeData = waterData[code_zone];

    if (communeData) {
      setTooltip({
        x: info.x,
        y: info.y,
        data: {
          ...communeData,
          lib_zone: communeData.commune,
          lib_qual: '',
          coul_qual: getCommuneColor(code_zone),
        } as HoverInfo['data'],
      });
    }
  };

  // On transforme nos données d'eau au format attendu par la carte
  // La carte a besoin de 'coul_qual' pour la couleur
  // Utiliser useMemo pour recalculer quand waterData change
  const mapDataForComponent = useMemo(() => {
    const result = Object.keys(waterData).reduce((acc, code) => {
      const commune = waterData[code];
      if (commune) {
        // Calculer la couleur directement ici
        let coul_qual = '#B9B9B9'; // Gris par défaut
        if (commune.details.length > 0) {
          const colors = getCommuneColors(commune.commune);
          coul_qual = colors.primary;
          // Debug: vérifier les couleurs
          console.log(`Commune: ${commune.commune}, Code: ${code}, Couleur: ${coul_qual}`);
        }

        acc[code] = {
          ...commune, // Garde les infos (commune, details)
          coul_qual: coul_qual, // Ajoute la couleur dynamique
          lib_zone: commune.commune, // Utilise commune comme lib_zone
          lib_qual: '', // Propriété requise mais non utilisée
        };
      }
      return acc;
    }, {} as AirData);
    console.log('mapDataForComponent:', result);
    return result;
  }, [waterData]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gray-50">
      <div className="w-full max-w-7xl">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-800">Tours d&apos;eau en Guadeloupe</h1>
          <p className="text-base text-gray-600 mb-2">Planning du 10 au 16 Novembre 2025</p>
          <p className="text-sm text-gray-500">Source: SMGEAG</p>
        </div>

        {/* Carte avec meilleure visibilité */}
        <div className="w-full bg-white shadow-xl rounded-xl overflow-hidden border-2 border-gray-200 flex flex-col" style={{ height: '700px' }}>
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex-shrink-0">
            <p className="text-sm text-gray-700 font-medium">
              💧 <span className="font-semibold">Chaque commune concernée par des tours d&apos;eau a sa propre couleur</span> - Survolez une commune pour voir les détails du planning
            </p>
          </div>
          <div className="w-full flex justify-center items-center p-6 bg-white flex-1 min-h-0">
            {/* On utilise le MÊME composant, mais on lui passe des données différentes */}
            <GuadeloupeMap
              data={mapDataForComponent}
              onCommuneHover={handleCommuneHover}
              onCommuneLeave={() => setTooltip(null)}
            />
          </div>
        </div>
      </div>

      {/* 4. L'infobulle (Tooltip) - Personnalisée pour l'eau avec couleurs par commune */}
      {tooltip && (() => {
        const communeData = tooltip.data as unknown as WaterCutData;
        const colors = getCommuneColors(communeData.commune);

        return (
          <div
            className="absolute bg-white rounded-xl shadow-2xl pointer-events-none transition-all w-96 border-2 overflow-hidden z-50"
            style={{
              left: tooltip.x + 15,
              top: tooltip.y + 15,
              borderColor: colors.border,
            }}
          >
            {/* En-tête avec couleur de la commune */}
            <div
              className="px-5 py-3 font-bold text-lg text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">💧</span>
                <span>{communeData.commune}</span>
              </div>
            </div>

            {/* Corps du tooltip */}
            <div className="p-5">
              {((communeData.details?.length ?? 0) > 0) ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {communeData.details.length} secteur{communeData.details.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {communeData.details.map((d: WaterCutDetail, index: number) => (
                      <div
                        key={`${d.secteur}-${index}`}
                        className="border-l-4 pl-4 pb-4 last:pb-0"
                        style={{ borderColor: colors.primary }}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span
                            className="text-xs font-bold px-2 py-1 rounded text-white mt-0.5"
                            style={{ backgroundColor: colors.primary }}
                          >
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <div
                              className="text-sm font-semibold mb-1"
                              style={{ color: colors.primary }}
                            >
                              {d.horaires}
                            </div>
                            <div className="text-xs text-gray-700 leading-relaxed">
                              {d.secteur}
                            </div>
                            {d.zones_alimentation_favorables && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-xs font-semibold text-gray-600 mb-1">
                                  Zones d&apos;alimentation favorables :
                                </div>
                                <div className="text-xs text-gray-600 italic">
                                  {d.zones_alimentation_favorables}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">🚫</div>
                  <p className="text-sm text-gray-600">
                    Aucun tour d&apos;eau programmé pour cette commune dans ce planning.
                  </p>
                </div>
              )}
            </div>

            {/* Footer avec couleur subtile */}
            <div
              className="px-5 py-2 text-xs text-gray-600"
              style={{ backgroundColor: colors.light }}
            >
              Source: SMGEAG • Planning du 10 au 16 Novembre 2025
            </div>
          </div>
        );
      })()}
    </main>
  );
}
