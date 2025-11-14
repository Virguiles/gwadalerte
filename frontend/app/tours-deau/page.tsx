'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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

// Type pour les filtres de date
type DateFilter = 'today' | 'tomorrow' | 'week';

// Fonction pour parser les jours de la semaine depuis le texte
function parseDaysFromHoraires(horaires: string): number[] {
  const days: number[] = [];
  const lowerHoraires = horaires.toLowerCase();

  if (lowerHoraires.includes('tous les jours')) {
    return [0, 1, 2, 3, 4, 5, 6]; // Tous les jours
  }

  // Map des jours français vers les numéros (0 = dimanche)
  const dayMap: { [key: string]: number } = {
    'dimanche': 0,
    'lundi': 1,
    'mardi': 2,
    'mercredi': 3,
    'jeudi': 4,
    'vendredi': 5,
    'samedi': 6
  };

  Object.entries(dayMap).forEach(([dayName, dayNumber]) => {
    if (lowerHoraires.includes(dayName)) {
      days.push(dayNumber);
    }
  });

  return days;
}

// Fonction pour vérifier si une commune a des coupures pour un jour donné
function hasCutsOnDay(communeData: WaterCutData, targetDate: Date): boolean {
  const targetDay = targetDate.getDay(); // 0 = dimanche, 1 = lundi, etc.

  return communeData.details.some(detail => {
    const days = parseDaysFromHoraires(detail.horaires);
    return days.includes(targetDay);
  });
}

export default function WaterMapPage() {
  const [waterData, setWaterData] = useState<WaterDataMap>({});
  const [tooltip, setTooltip] = useState<HoverInfo | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

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

  // Calculer la date cible selon le filtre
  const getTargetDate = (): Date => {
    const today = new Date();
    if (dateFilter === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return today;
  };

  // 2. Logique de couleur (différente de la qualité de l'air)
  const getCommuneColor = (code_zone: string): string => {
    const commune = waterData[code_zone];
    if (!commune || commune.details.length === 0) {
      return '#B9B9B9'; // Gris (par défaut pour communes non concernées)
    }

    // Si on filtre par jour, vérifier si la commune est concernée
    if (dateFilter !== 'week') {
      const targetDate = getTargetDate();
      if (!hasCutsOnDay(commune, targetDate)) {
        return '#B9B9B9'; // Gris si pas de coupure ce jour-là
      }
    }

    const colors = getCommuneColors(commune.commune);
    return colors.primary;
  };

  // Fonction pour calculer la position optimale du tooltip
  const calculateTooltipPosition = useCallback((mouseX: number, mouseY: number) => {
    if (typeof window === 'undefined') return { left: mouseX, top: mouseY };

    // Calculer la largeur du tooltip en fonction de la taille de l'écran (responsive)
    let tooltipWidth = 384; // Par défaut (md et plus, w-96 = 384px)
    if (window.innerWidth < 640) {
      tooltipWidth = 320; // Petit écran
    } else if (window.innerWidth < 768) {
      tooltipWidth = 350; // Écran moyen
    }

    const tooltipHeight = 500; // Estimation de la hauteur approximative (avec scroll si nécessaire)
    const margin = 20; // Marge de sécurité par rapport aux bords
    const offset = 15; // Décalage par rapport au curseur

    let left = mouseX + offset;
    let top = mouseY + offset;

    // Vérifier si le tooltip dépasse à droite
    if (left + tooltipWidth + margin > window.innerWidth) {
      left = mouseX - tooltipWidth - offset; // Placer à gauche du curseur
    }

    // Vérifier si le tooltip dépasse toujours (cas extrême gauche)
    if (left < margin) {
      left = margin;
    }

    // Vérifier si le tooltip dépasse en bas
    if (top + tooltipHeight + margin > window.innerHeight) {
      top = mouseY - tooltipHeight - offset; // Placer au-dessus du curseur
    }

    // Vérifier si le tooltip dépasse toujours (cas extrême haut)
    if (top < margin) {
      top = margin;
    }

    // S'assurer que le tooltip ne dépasse pas à droite même après ajustement
    if (left + tooltipWidth > window.innerWidth - margin) {
      left = window.innerWidth - tooltipWidth - margin;
    }

    return { left, top };
  }, []);

  // Effet pour mettre à jour la position du tooltip quand il change
  useEffect(() => {
    if (tooltip) {
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
      requestAnimationFrame(() => {
        const position = calculateTooltipPosition(tooltip.x, tooltip.y);
        setTooltipPosition(position);
      });
    }
  }, [tooltip, calculateTooltipPosition]);

  // Effet pour recalculer la position après le rendu initial avec les dimensions réelles
  useEffect(() => {
    if (tooltip && tooltipRef.current) {
      // Attendre que le tooltip soit rendu pour obtenir ses dimensions réelles
      const timeoutId = setTimeout(() => {
        const position = calculateTooltipPosition(tooltip.x, tooltip.y);
        setTooltipPosition(position);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [tooltip, calculateTooltipPosition]);

  // Effet pour recalculer la position lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (tooltip) {
        const position = calculateTooltipPosition(tooltip.x, tooltip.y);
        setTooltipPosition(position);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tooltip, calculateTooltipPosition]);

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
  // Utiliser useMemo pour recalculer quand waterData ou dateFilter change
  const mapDataForComponent = useMemo(() => {
    const targetDate = getTargetDate();

    const result = Object.keys(waterData).reduce((acc, code) => {
      const commune = waterData[code];
      if (commune) {
        // Calculer la couleur directement ici
        let coul_qual = '#B9B9B9'; // Gris par défaut

        if (commune.details.length > 0) {
          // Si on filtre par jour, vérifier si la commune est concernée
          if (dateFilter !== 'week') {
            if (hasCutsOnDay(commune, targetDate)) {
              const colors = getCommuneColors(commune.commune);
              coul_qual = colors.primary;
            }
          } else {
            // Vue semaine : afficher toutes les communes avec coupures
            const colors = getCommuneColors(commune.commune);
            coul_qual = colors.primary;
          }
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
    return result;
  }, [waterData, dateFilter]);


  // Fonction pour obtenir le label de date
  const getDateLabel = (): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

    if (dateFilter === 'today') {
      return new Date().toLocaleDateString('fr-FR', options);
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toLocaleDateString('fr-FR', options);
    }
    return 'Planning du 10 au 16 Novembre 2025';
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8 relative bg-gray-50">
      <div className="w-full max-w-7xl">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-800">Tours d&apos;eau en Guadeloupe</h1>
          <p className="text-base text-gray-600 mb-2">{getDateLabel()}</p>
          <p className="text-sm text-gray-500">Source: SMGEAG</p>
        </div>

        {/* Onglets de filtrage */}
        <div className="flex flex-col items-center mb-6 gap-3">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
                dateFilter === 'today'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Aujourd&apos;hui
            </button>
            <button
              onClick={() => setDateFilter('tomorrow')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
                dateFilter === 'tomorrow'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Demain
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-6 py-2.5 text-sm font-semibold rounded-md transition-all ${
                dateFilter === 'week'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Semaine
            </button>
          </div>

          {/* Compteur de communes concernées */}
          {(() => {
            const targetDate = getTargetDate();
            const affectedCommunes = Object.values(waterData).filter(commune => {
              if (!commune.details || commune.details.length === 0) return false;
              if (dateFilter === 'week') return true;
              return hasCutsOnDay(commune, targetDate);
            }).length;

            return affectedCommunes > 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">{affectedCommunes}</span> commune{affectedCommunes > 1 ? 's' : ''} concernée{affectedCommunes > 1 ? 's' : ''}
                  {dateFilter !== 'week' && ` ${dateFilter === 'today' ? "aujourd'hui" : 'demain'}`}
                </p>
              </div>
            ) : null;
          })()}
        </div>

        {/* Carte avec meilleure visibilité */}
        <div className="w-full bg-white shadow-xl rounded-xl overflow-hidden border-2 border-gray-200 flex flex-col" style={{ height: '700px' }}>
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex-shrink-0">
            <p className="text-sm text-gray-700 font-medium">
              💧 <span className="font-semibold">
                {dateFilter === 'week'
                  ? 'Chaque commune concernée par des tours d\'eau a sa propre couleur'
                  : `Les communes en couleur ont des coupures d'eau ${dateFilter === 'today' ? 'aujourd\'hui' : 'demain'}`
                }
              </span> - Survolez une commune pour voir les détails
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

        // Filtrer les détails selon le jour sélectionné
        const filteredDetails = dateFilter !== 'week'
          ? communeData.details.filter(detail => {
              const days = parseDaysFromHoraires(detail.horaires);
              const targetDay = getTargetDate().getDay();
              return days.includes(targetDay);
            })
          : communeData.details;

        return (
          <div
            ref={tooltipRef}
            className="fixed bg-white rounded-xl shadow-2xl pointer-events-auto transition-all w-[320px] sm:w-[350px] md:w-96 border-2 overflow-hidden z-50"
            style={{
              left: `${tooltipPosition.left}px`,
              top: `${tooltipPosition.top}px`,
              borderColor: colors.border,
              maxHeight: 'calc(100vh - 40px)', // Limiter la hauteur pour éviter de dépasser l'écran
              overflowY: 'auto', // Ajouter un scroll si nécessaire
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
              {(filteredDetails.length > 0) ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {filteredDetails.length} secteur{filteredDetails.length > 1 ? 's' : ''}
                      {dateFilter !== 'week' && ' concerné' + (filteredDetails.length > 1 ? 's' : '')}
                    </span>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredDetails.map((d: WaterCutDetail, index: number) => (
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
                    {dateFilter === 'week'
                      ? "Aucun tour d'eau programmé pour cette commune dans ce planning."
                      : `Aucun tour d'eau programmé pour cette commune ${dateFilter === 'today' ? "aujourd'hui" : "demain"}.`
                    }
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
