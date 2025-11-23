import React, { useRef } from 'react';
import { WaterCutData, DateFilter } from '../types';
import { getCommuneColors, parseDaysFromHoraires, getTargetDate } from '../utils';

export type TooltipAnchor = 'center' | 'left' | 'right' | 'none';

interface WaterTooltipProps {
  data: WaterCutData;
  position: { left: number; top: number };
  dateFilter: DateFilter;
  onClose: () => void;
  anchor?: TooltipAnchor;
}

export const WaterTooltip: React.FC<WaterTooltipProps> = ({
  data,
  position,
  dateFilter,
  onClose,
  anchor = 'none'
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const colors = getCommuneColors(data.commune);

  // Filtrer les détails
  const filteredDetails = dateFilter !== 'week'
    ? data.details.filter(detail => {
        const days = parseDaysFromHoraires(detail.horaires);
        const targetDay = getTargetDate(dateFilter).getDay();
        return days.includes(targetDay);
      })
    : data.details;

  // Calcul du transform CSS selon l'ancrage
  let transform = 'none';
  const gap = 20; // Ecart entre le point cible et le tooltip

  if (anchor === 'center') {
    transform = 'translate(-50%, -50%)'; // Centré parfait (mobile)
  } else if (anchor === 'left') {
    // Le tooltip est à GAUCHE du point cible
    // On le décale vers la gauche de 100% de sa largeur + le gap
    // Et on le centre verticalement (-50%)
    transform = `translate(calc(-100% - ${gap}px), -50%)`;
  } else if (anchor === 'right') {
    // Le tooltip est à DROITE du point cible
    // On le décale vers la droite du gap
    // Et on le centre verticalement (-50%)
    transform = `translate(${gap}px, -50%)`;
  }

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 flex flex-col bg-white/95 backdrop-blur-md rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border transition-all duration-200 pointer-events-auto"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        borderColor: colors.border,
        width: '340px',
        maxHeight: 'min(500px, calc(100vh - 40px))',
        animation: 'tooltip-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: transform
      }}
    >
      {/* En-tête Premium */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-xl text-white shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.border} 100%)`,
        }}
      >
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-medium uppercase tracking-wider opacity-90">Commune de</span>
          <span className="text-lg font-bold truncate leading-tight">{data.commune}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="ml-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white/50 flex-shrink-0"
          aria-label="Fermer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      {/* Barre d'info contextuelle */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
        <span className="font-medium text-gray-600 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gray-400">
             <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4h.25V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
          </svg>
          {dateFilter === 'week' ? 'Planning hebdomadaire' : (dateFilter === 'today' ? "Aujourd'hui" : 'Demain')}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${filteredDetails.length > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
          {filteredDetails.length > 0 ? `${filteredDetails.length} perturbation${filteredDetails.length > 1 ? 's' : ''}` : 'Aucune coupure'}
        </span>
      </div>

      {/* Liste des coupures */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
        {filteredDetails.length > 0 ? (
          <div className="space-y-3">
            {filteredDetails.map((detail, idx) => (
              <div key={idx} className="group relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: colors.primary }}></div>

                <div className="p-3 pl-4">
                  {/* Horaires */}
                  <div className="flex items-start gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.primary }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-bold text-gray-800 leading-tight">
                      {detail.horaires}
                    </span>
                  </div>

                  {/* Secteurs */}
                  <div className="flex items-start gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0">
                      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19.02 10.197 18.934l.004-.001.005-.002a.75.75 0 00.276-.15c.083-.076.168-.17.26-.276.396-.472 2.262-2.822 3.764-5.732C15.895 10.27 16.5 8.053 16.5 6.25a6.5 6.5 0 10-13 0c0 1.803.606 4.02 1.994 6.524 1.502 2.91 3.368 5.26 3.764 5.732.092.106.177.2.26.276a.75.75 0 00.275.15l.005.002.004.001zM10 9.25a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-600 leading-relaxed">
                      {detail.secteur}
                    </span>
                  </div>

                  {/* Zones favorables */}
                  {detail.zones_alimentation_favorables && (
                    <div className="mt-2 ml-6 bg-green-50/50 rounded border border-green-100 p-2">
                      <div className="flex items-start gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-0.5">Zones épargnées</p>
                          <p className="text-[11px] text-green-800 leading-relaxed">{detail.zones_alimentation_favorables}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-medium text-sm mb-1">Aucune perturbation signalée</h3>
            <p className="text-xs text-gray-500 max-w-[200px]">
               {dateFilter === 'week'
                ? "Cette commune ne figure pas dans le planning des tours d'eau cette semaine."
                : `L'eau devrait couler normalement ${dateFilter === 'today' ? "aujourd'hui" : "demain"}.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 rounded-b-xl flex justify-between items-center text-[10px] text-gray-500">
         <span>Données SMGEAG</span>
         <span className="font-medium">Mis à jour récemment</span>
      </div>
    </div>
  );
};
