import React, { forwardRef } from 'react';
import { VIGILANCE_LEVEL_DETAILS, PHENOMENON_DETAILS } from '../constants';
import { Info, ShieldAlert, Umbrella, Wind, Waves, CheckCircle2, AlertTriangle, Siren, Megaphone } from 'lucide-react';

interface VigilanceDetailsProps {
  currentLevel: number;
  mounted: boolean;
}

const getPhenomenonIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('pluie') || lowerType.includes('orage')) return <Umbrella className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
  if (lowerType.includes('vent')) return <Wind className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
  if (lowerType.includes('mer')) return <Waves className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
  return <Info className="w-6 h-6 text-slate-600 dark:text-gray-400" />;
};

export const VigilanceDetails = forwardRef<HTMLDivElement, VigilanceDetailsProps>(({ currentLevel, mounted }, ref) => {
  return (
    <section
      ref={ref}
      className="w-full mt-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 dark:border-gray-700 overflow-hidden"
      aria-labelledby="vigilance-details-title"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-8 h-8 text-slate-700 dark:text-gray-300" />
          <h2 id="vigilance-details-title" className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Comprendre les Niveaux de Vigilance
          </h2>
        </div>
        <p className="text-slate-600 dark:text-gray-300 mb-8 max-w-3xl pl-11 text-lg">
          Guide officiel des comportements à adopter selon le niveau de vigilance en cours en Guadeloupe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[VIGILANCE_LEVEL_DETAILS[1], VIGILANCE_LEVEL_DETAILS[2], VIGILANCE_LEVEL_DETAILS[3], VIGILANCE_LEVEL_DETAILS[4]].map((level) => {
            const isActive = mounted && currentLevel === level.level;

            // Déterminer les styles dynamiques basés sur la couleur
            let borderColor = 'border-slate-200';
            let bgColor = 'bg-white';
            let titleColor = 'text-slate-800';

            if (isActive) {
              // Styles spécifiques quand la carte est active
              if (level.level === 1) { borderColor = 'border-green-500'; bgColor = 'bg-green-50'; }
              else if (level.level === 2) { borderColor = 'border-yellow-400'; bgColor = 'bg-yellow-50'; }
              else if (level.level === 3) { borderColor = 'border-orange-500'; bgColor = 'bg-orange-50'; }
              else if (level.level === 4) { borderColor = 'border-red-600'; bgColor = 'bg-red-50'; titleColor = 'text-red-900'; }
            }

            return (
              <article
                key={level.level}
                className={`
                  relative rounded-xl p-5 transition-all duration-300 flex flex-col h-full border-2
                  ${isActive ? `${borderColor} ${bgColor} shadow-lg scale-[1.02] z-10 ring-2 ring-offset-2 ring-transparent` : 'border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-slate-300 dark:hover:border-gray-600 hover:shadow-md'}
                `}
              >
                {isActive && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1 whitespace-nowrap z-20">
                    <CheckCircle2 className="w-3 h-3" />
                    Niveau Actuel
                  </div>
                )}

                <header className="flex items-center gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-xl shadow-sm flex items-center justify-center text-2xl font-bold border-2 border-white/50 dark:border-gray-800/50"
                    style={{ backgroundColor: level.color }}
                    aria-hidden="true"
                  >
                    {level.level}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg leading-tight ${titleColor} dark:text-white`} style={{ color: !isActive && level.color === '#f0d53c' ? '#B8860B' : (!isActive ? level.color : undefined) }}>
                      {level.label}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Vigilance
                    </span>
                  </div>
                </header>

                <div className="flex-grow space-y-4">
                  <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                    {level.description}
                  </p>

                  {level.advice && (
                    <div className={`rounded-lg p-3 text-xs leading-relaxed flex gap-2 ${isActive ? 'bg-white/60 dark:bg-gray-700/60' : 'bg-slate-50 dark:bg-gray-700'}`}>
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isActive ? 'text-slate-700 dark:text-gray-300' : 'text-slate-500 dark:text-gray-400'}`} />
                      <span className="text-slate-700 dark:text-gray-300 font-medium">{level.advice}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Section Phénomènes */}
      <div className="bg-slate-50/50 dark:bg-gray-900/50 border-t border-slate-100 dark:border-gray-700 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <Megaphone className="w-6 h-6 text-slate-600 dark:text-gray-400" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Phénomènes Surveillés</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PHENOMENON_DETAILS).map(([type, info]) => (
            <div
              key={type}
              className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-5 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-slate-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                  {getPhenomenonIcon(type)}
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {type}
                </h4>
              </div>

              <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed mb-4">
                {info.description}
              </p>

              {info.advice && (
                <div className="flex items-start gap-2 pt-3 border-t border-slate-100 dark:border-gray-700">
                  <Siren className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 dark:text-gray-300">
                    <span className="font-semibold text-blue-700 dark:text-blue-400 block mb-0.5">Recommandation :</span>
                    {info.advice}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

VigilanceDetails.displayName = 'VigilanceDetails';
