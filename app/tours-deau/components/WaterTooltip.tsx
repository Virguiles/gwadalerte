import React, { useMemo } from 'react';
import { Clock, MapPin, ShieldCheck, Info, CheckCircle, Inbox, RefreshCw } from 'lucide-react';
import { WaterCutData, DateFilter } from '../types';
import { getCommuneColors, parseDaysFromHoraires, getTargetDate } from '../utils';
import { TooltipContainer, TooltipAnchor, TooltipHeader } from '../../components/shared/TooltipContainer';

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
  const colors = getCommuneColors(data.commune);

  // Filtrer les détails
  const filteredDetails = useMemo(() => {
    return dateFilter !== 'week'
    ? data.details.filter(detail => {
        const days = parseDaysFromHoraires(detail.horaires);
        const targetDay = getTargetDate(dateFilter).getDay();
        return days.includes(targetDay);
      })
    : data.details;
  }, [data.details, dateFilter]);

  const getDateLabel = () => {
    if (dateFilter === 'week') return 'Planning hebdomadaire';
    if (dateFilter === 'today') return "Aujourd'hui";
    return 'Demain';
  };

  return (
    <TooltipContainer
      position={position}
      onClose={onClose}
      anchor={anchor}
      width="340px"
      style={{ borderColor: colors.border }}
    >
      {/* En-tête Premium */}
      <TooltipHeader
        title={data.commune}
        subtitle="Commune de"
        onClose={onClose}
        style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.border} 100%)`,
            color: 'white'
        }}
      />

      {/* Barre d'info contextuelle */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs">
        <span className="font-medium text-gray-600 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-gray-400" />
          {getDateLabel()}
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
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} />
                    <span className="text-sm font-bold text-gray-800 leading-tight">
                      {detail.horaires}
                    </span>
                  </div>

                  {/* Secteurs */}
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      {detail.secteur}
                    </span>
                  </div>

                  {/* Zones favorables */}
                  {detail.zones_alimentation_favorables && (
                    <div className="mt-2 ml-6 bg-green-50/50 rounded border border-green-100 p-2">
                      <div className="flex items-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
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
              <Inbox className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
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
         <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Données SMGEAG</span>
         </div>
         <div className="flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            <span className="font-medium">Mis à jour récemment</span>
         </div>
      </div>
    </TooltipContainer>
  );
};
