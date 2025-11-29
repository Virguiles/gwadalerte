import React from 'react';
import { CommuneData } from '../../components/GuadeloupeMap';
import { Activity, Wind } from 'lucide-react';

interface AirSidebarProps {
  data: CommuneData | null;
  lastUpdate: Date | null;
  formatDateTime: (date: Date) => string;
}

// Fonction locale pour convertir un code de qualité en libellé et couleur (API Gwad'Air)
function getQualityFromCode(code: number | undefined): { label: string; color: string } {
  const qualityMap: Record<number, { label: string; color: string }> = {
    1: { label: 'Bon', color: '#50F0E6' },
    2: { label: 'Moyen', color: '#50CCAA' },
    3: { label: 'Dégradé', color: '#F0E641' },
    4: { label: 'Mauvais', color: '#FF5050' },
    5: { label: 'Très Mauvais', color: '#960032' },
    6: { label: 'Extrêmement Mauvais', color: '#803399' },
    0: { label: 'Absent', color: '#DDDDDD' },
  };

  if (code === undefined || code === null) {
    return { label: 'N/A', color: '#b9b9b9' };
  }
  return qualityMap[code] || { label: 'Inconnu', color: '#b9b9b9' };
}

// Descriptions optimisées
function getQualityDescription(libQual: string): string {
  const descriptions: Record<string, string> = {
    'Bon': 'Qualité de l\'air idéale. Profitez-en pour aérer et bouger !',
    'Moyen': 'Qualité acceptable. Aucun risque pour la majorité de la population.',
    'Dégradé': 'Qualité moyenne. Les personnes sensibles peuvent ressentir une gêne.',
    'Mauvais': 'Air pollué. Risques accrus pour les personnes fragiles.',
    'Très Mauvais': 'Forte pollution. Effets possibles sur la santé de tous.',
    'Extrêmement Mauvais': 'Situation critique. Risques sanitaires importants pour toute la population.',
    // Compatibilité
    'Très bon': 'Qualité de l\'air excellente.',
    'Médiocre': 'Qualité de l\'air préoccupante.',
    'Très mauvais': 'Forte pollution.',
  };
  return descriptions[libQual] || 'Données indisponibles.';
}

export const AirSidebar: React.FC<AirSidebarProps> = ({
  data,
  lastUpdate,
  formatDateTime
}) => {
  const qualityLevels = [
    { label: 'Bon', color: '#50F0E6' },
    { label: 'Moyen', color: '#50CCAA' },
    { label: 'Dégradé', color: '#F0E641' },
    { label: 'Mauvais', color: '#FF5050' },
    { label: 'Très Mauvais', color: '#960032' },
    { label: 'Extrêmement Mauvais', color: '#803399' },
  ];

  // Fonction pour formater la date de mise à jour de manière claire et précise
  const formatLastUpdate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    // Si moins de 1 minute
    if (diffMinutes < 1) {
      return 'à l\'instant';
    }
    // Si moins d'1 heure
    if (diffMinutes < 60) {
      return `il y a ${diffMinutes} min`;
    }
    // Si moins de 24 heures
    if (diffHours < 24) {
      return `il y a ${diffHours}h`;
    }
    // Sinon, afficher la date complète avec l'heure
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Rendu par défaut : Vue globale (Synthèse Archipel)
  if (!data) {
    // Calculer l'indice majoritaire sur l'archipel (simplifié pour l'exemple, on pourrait passer toutes les data en props si besoin précis)
    // Ici on garde la légende mais présentée comme une synthèse
    return (
      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-slate-100 dark:border-gray-700 p-6 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Wind className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            Qualité de l&apos;Air
          </h2>

          <div className="p-4 bg-teal-50 dark:bg-teal-900/30 rounded-xl border border-teal-100 dark:border-teal-800">
             <h3 className="font-semibold text-teal-900 dark:text-teal-300 mb-2 text-lg">Synthèse Régionale</h3>
             <p className="text-slate-700 dark:text-gray-300 leading-relaxed text-sm">
                La qualité de l&apos;air est surveillée en permanence sur l&apos;ensemble de l&apos;archipel par les stations de mesure de Gwad&apos;Air.
             </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Échelle ATMO</h3>
            <div className="space-y-2">
                {qualityLevels.map((level) => (
                <div key={level.label} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    <div
                    className="w-8 h-8 rounded-lg border-2 flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: level.color, borderColor: level.color + '80' }}
                    ></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{level.label}</span>
                </div>
                ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-gray-700">
            {lastUpdate && (
              <div className="mb-3 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400 font-bold mb-1">Dernière mise à jour</p>
                <p className="text-sm text-slate-700 dark:text-gray-300 font-medium">{formatDateTime(lastUpdate)}</p>
              </div>
            )}
            <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-700 text-xs font-medium text-slate-600 dark:text-gray-300">
                    Source: Gwad&apos;Air (AASQA)
                </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendu Commune Sélectionnée
  return (
    <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700 overflow-hidden flex flex-col h-full">

            {/* En-tête */}
            <div
              className="px-6 py-5 text-white font-bold text-lg flex flex-col justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${data.coul_qual} 0%, ${data.coul_qual}ee 100%)`,
              }}
            >
              <div className="relative z-10">
                <span className="text-xs font-medium uppercase tracking-wider opacity-90 block mb-1">Commune de</span>
                <span className="text-2xl font-bold truncate leading-tight block">{data.lib_zone}</span>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Indice Principal */}
              <div className="bg-slate-50 dark:bg-gray-700 rounded-xl p-4 border border-slate-100 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Indice ATMO</span>
                  <span
                    className="px-3 py-1.5 rounded-full text-sm font-bold border transition-colors"
                    style={{
                      backgroundColor: (() => {
                        const hex = data.coul_qual || '#50F0E6';
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, 0.15)`;
                      })(),
                      color: data.coul_qual || '#50F0E6',
                      borderColor: data.coul_qual || '#50F0E6'
                    }}
                  >
                    {data.lib_qual}
                  </span>
                </div>
                {getQualityDescription(data.lib_qual || '') && (
                  <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                    {getQualityDescription(data.lib_qual || '')}
                  </p>
                )}
              </div>

              {/* Détails Polluants */}
              {(data.code_no2 !== undefined ||
                data.code_so2 !== undefined ||
                data.code_o3 !== undefined ||
                data.code_pm10 !== undefined ||
                data.code_pm25 !== undefined) && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 dark:text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Détails par polluant
                    </p>
                    <div className="space-y-2">
                      {[
                        { code: data.code_no2, label: 'NO₂', name: 'Dioxyde d\'azote' },
                        { code: data.code_so2, label: 'SO₂', name: 'Dioxyde de soufre' },
                        { code: data.code_o3, label: 'O₃', name: 'Ozone' },
                        { code: data.code_pm10, label: 'PM10', name: 'Particules < 10µm' },
                        { code: data.code_pm25, label: 'PM2.5', name: 'Particules < 2.5µm' },
                      ].map((polluant) => (
                        polluant.code !== undefined && (
                          <div key={polluant.label} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-700 border border-slate-100 dark:border-gray-600 rounded-xl hover:border-slate-200 dark:hover:border-gray-500 transition-colors shadow-sm">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700 dark:text-white">{polluant.label}</span>
                              <span className="text-[10px] text-slate-400 dark:text-gray-500">{polluant.name}</span>
                            </div>
                            <div className="flex items-center gap-2">

                                <span
                                  className="px-3 py-1.5 rounded-full text-sm font-bold border transition-colors"
                                  style={{
                                    backgroundColor: (() => {
                                      const hex = getQualityFromCode(polluant.code as number | undefined).color || '#50F0E6';
                                      const r = parseInt(hex.slice(1, 3), 16);
                                      const g = parseInt(hex.slice(3, 5), 16);
                                      const b = parseInt(hex.slice(5, 7), 16);
                                      return `rgba(${r}, ${g}, ${b}, 0.15)`;
                                    })(),
                                    color: getQualityFromCode(polluant.code as number | undefined).color || '#50F0E6',
                                    borderColor: getQualityFromCode(polluant.code as number | undefined).color || '#50F0E6'
                                  }}
                                >
                                  {getQualityFromCode(polluant.code as number | undefined).label}
                                </span>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-gray-700 border-t border-slate-100 dark:border-gray-600 flex justify-between items-center text-xs text-slate-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <span>Données Gwad&apos;Air</span>
                </div>
                {lastUpdate && (
                  <span className="font-medium">
                    MAJ {formatLastUpdate(lastUpdate)}
                  </span>
                )}
            </div>
        </div>
    </div>
  );
};
