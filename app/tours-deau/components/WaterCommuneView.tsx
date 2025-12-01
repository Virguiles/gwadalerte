import React, { useMemo } from 'react';
import { Clock, MapPin, ShieldCheck, Info, CheckCircle, Inbox, RefreshCw } from 'lucide-react';
import { WaterCutData, DateFilter } from '../types';
import { getCommuneColors, parseDaysFromHoraires, getTargetDate } from '../utils';

interface WaterCommuneViewProps {
  data: WaterCutData;
  dateFilter: DateFilter;
  onClose?: () => void;
}

export const WaterCommuneView: React.FC<WaterCommuneViewProps> = ({
  data,
  dateFilter,
  onClose,
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
    <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full max-h-[800px]">

        {/* En-tête Premium */}
        <div
            className="flex items-center justify-between px-6 py-5 bg-gradient-to-br text-white shadow-sm shrink-0"
            style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.border} 100%)`,
            }}
        >
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium uppercase tracking-wider opacity-90">Commune de</span>
                <span className="text-2xl font-bold truncate leading-tight">{data.commune}</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-1 hover:bg-white/20 rounded transition-colors ml-2 flex-shrink-0"
                aria-label="Fermer"
              >
                ✕
              </button>
            )}
        </div>

        {/* Barre d'info contextuelle */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 flex items-center justify-between text-xs shrink-0">
            <span className="font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                {getDateLabel()}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${filteredDetails.length > 0 ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800'}`}>
                {filteredDetails.length > 0 ? `${filteredDetails.length} perturbation${filteredDetails.length > 1 ? 's' : ''}` : 'Aucune coupure'}
            </span>
        </div>

        {/* Liste des coupures */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-gray-100 dark:scrollbar-track-gray-700 scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 space-y-4">
            {filteredDetails.length > 0 ? (
                filteredDetails.map((detail, idx) => (
                    <div key={idx} className="group relative bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: colors.primary }}></div>

                        <div className="p-4 pl-5">
                            {/* Horaires */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="mt-0.5 p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 shrink-0">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Horaires</p>
                                    <span className="text-base font-bold text-gray-900 dark:text-white leading-tight block">
                                        {detail.horaires}
                                    </span>
                                </div>
                            </div>

                            {/* Secteurs */}
                            <div className="flex items-start gap-3 mb-3">
                                 <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Secteurs impactés</p>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed block">
                                        {detail.secteur}
                                    </span>
                                </div>
                            </div>

                            {/* Zones favorables */}
                            {detail.zones_alimentation_favorables && (
                                <div className="mt-4 ml-0 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800 p-3">
                                    <div className="flex items-start gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Zones épargnées</p>
                                            <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">{detail.zones_alimentation_favorables}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                    <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-4">
                        <Inbox className="w-10 h-10 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">Aucune perturbation signalée</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[260px] leading-relaxed">
                        {dateFilter === 'week'
                            ? "Cette commune ne figure pas dans le planning des tours d'eau cette semaine."
                            : `L'eau devrait couler normalement ${dateFilter === 'today' ? "aujourd'hui" : "demain"}.`
                        }
                    </p>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 shrink-0">
            <div className="flex items-center gap-2">
                 <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                 <span>Données SMGEAG</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
                <RefreshCw className="w-3 h-3" />
                <span>Mis à jour récemment</span>
            </div>
        </div>
      </div>
    </div>
  );
};
