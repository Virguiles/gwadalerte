import React from 'react';
import { WaterCutData, DateFilter } from '../types';
import { getCommuneColors, parseDaysFromHoraires, getTargetDate } from '../utils';

interface WaterSidebarProps {
  data: WaterCutData | null;
  dateFilter: DateFilter;
  archipelInfo?: {
    affectedCommunes: number;
  }
}

export const WaterSidebar: React.FC<WaterSidebarProps> = ({
  data,
  dateFilter,
  archipelInfo
}) => {
  // Rendu par défaut : Vue globale de l'archipel (quand aucune commune n'est sélectionnée)
  if (!data) {
    return (
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg
                    fill="currentColor"
                    height="42"
                    width="42"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512.000000 512.000000"
                    preserveAspectRatio="xMidYMid meet"
                    className="shrink-0"
                  >
                    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
                      <path d="M1913 4193 c-12 -2 -34 -18 -48 -34 -29 -35 -33 -83 -9 -118 32 -46
66 -51 319 -51 l235 0 0 -175 0 -174 -657 -3 c-544 -3 -662 -5 -679 -17 -47
-31 -49 -43 -52 -293 -4 -270 2 -309 51 -338 31 -19 59 -20 1120 -20 l1087 0
0 -196 c0 -121 4 -203 11 -216 23 -43 62 -48 344 -48 283 0 321 5 345 49 8 15
10 141 8 429 -3 405 -3 407 -27 452 -54 105 -151 173 -268 190 -37 5 -296 10
-575 10 l-508 0 0 175 0 175 236 0 c256 0 288 6 314 55 16 29 16 76 0 105 -26
49 -38 50 -652 49 -315 -1 -583 -4 -595 -6z m1806 -781 c69 -37 71 -50 71
-394 l0 -308 -155 0 -155 0 0 199 c0 185 -1 200 -20 224 -12 15 -38 31 -58 37
-24 6 -404 10 -1104 10 l-1068 0 0 125 0 125 1228 0 c1170 0 1229 -1 1261 -18z"/>
                      <path d="M3590 2343 c-29 -15 -39 -30 -61 -88 -37 -102 -59 -141 -189 -340
-182 -280 -214 -356 -213 -505 4 -334 349 -570 671 -459 210 72 343 250 345
459 1 148 -33 231 -200 483 -114 172 -184 298 -204 364 -23 80 -87 117 -149
86z m150 -513 c57 -85 123 -198 149 -250 42 -87 46 -101 46 -170 -1 -86 -20
-132 -81 -192 -63 -63 -115 -83 -219 -83 -73 0 -99 4 -136 23 -95 46 -157 134
-166 232 -6 65 4 105 54 205 32 63 244 397 249 392 1 -1 48 -72 104 -157z"/>
                    </g>
                  </svg>
                  Tours d&apos;eau
                </h2>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-lg">Situation Générale</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {archipelInfo && archipelInfo.affectedCommunes > 0 ? (
                            <>
                                <span className="font-bold text-blue-600 text-xl">{archipelInfo.affectedCommunes}</span> commune{archipelInfo.affectedCommunes > 1 ? 's' : ''} concernée{archipelInfo.affectedCommunes > 1 ? 's' : ''} par des tours d&apos;eau {dateFilter === 'today' ? "aujourd&apos;hui" : dateFilter === 'tomorrow' ? "demain" : "cette semaine"}.
                            </>
                        ) : (
                            "Aucune perturbation majeure signalée sur le réseau d'eau potable pour la période sélectionnée."
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
  }

  const colors = getCommuneColors(data.commune);

  // Filtrer les détails
  const filteredDetails = dateFilter !== 'week'
    ? data.details.filter(detail => {
        const days = parseDaysFromHoraires(detail.horaires);
        const targetDay = getTargetDate(dateFilter).getDay();
        return days.includes(targetDay);
      })
    : data.details;

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
        </div>

        {/* Barre d'info contextuelle */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600 flex items-center justify-between text-xs shrink-0">
            <span className="font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500">
                    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4h.25V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                </svg>
                {dateFilter === 'week' ? 'Planning hebdomadaire' : (dateFilter === 'today' ? "Aujourd'hui" : 'Demain')}
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
                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                                    </svg>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19.02 10.197 18.934l.004-.001.005-.002a.75.75 0 00.276-.15c.083-.076.168-.17.26-.276.396-.472 2.262-2.822 3.764-5.732C15.895 10.27 16.5 8.053 16.5 6.25a6.5 6.5 0 10-13 0c0 1.803.606 4.02 1.994 6.524 1.502 2.91 3.368 5.26 3.764 5.732.092.106.177.2.26.276a.75.75 0 00.275.15l.005.002.004.001zM10 9.25a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                        </svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400 dark:text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
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
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 <span>Données SMGEAG</span>
            </div>
            <span className="font-medium">Mis à jour récemment</span>
        </div>
      </div>
    </div>
  );
};
