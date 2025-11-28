import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Leaf, Info, AlertTriangle, AlertOctagon, Activity, HeartPulse, BookOpen } from 'lucide-react';

// Données des niveaux ATMO
const ATMO_LEVELS = [
  {
    level: 1,
    label: 'Bon',
    color: '#50F0E6',
    textColor: 'text-teal-900',
    icon: ShieldCheck,
    description: "Qualité de l'air idéale. Profitez-en pour aérer et bouger !",
    recommendations: "Idéal pour toutes les activités de plein air. Aérez votre logement sans restriction."
  },
  {
    level: 2,
    label: 'Moyen',
    color: '#50CCAA',
    textColor: 'text-teal-900',
    icon: Leaf,
    description: "Qualité acceptable. Aucun risque pour la majorité de la population.",
    recommendations: "Activités habituelles. Aérez votre logement tôt le matin ou tard le soir."
  },
  {
    level: 3,
    label: 'Dégradé',
    color: '#F0E641',
    textColor: 'text-yellow-900',
    icon: Info,
    description: "Qualité moyenne. Les personnes sensibles peuvent ressentir une gêne.",
    recommendations: "Envisagez de réduire les efforts intenses si vous êtes sensible (asthme, allergies)."
  },
  {
    level: 4,
    label: 'Mauvais',
    color: '#FF5050',
    textColor: 'text-red-900',
    icon: AlertTriangle,
    description: "Air pollué. Risques accrus pour les personnes fragiles.",
    recommendations: "Limitez les activités physiques intenses en extérieur. Privilégiez les sorties courtes."
  },
  {
    level: 5,
    label: 'Très Mauvais',
    color: '#960032',
    textColor: 'text-white',
    icon: AlertOctagon,
    description: "Forte pollution. Effets possibles sur la santé de tous.",
    recommendations: "Évitez le sport en extérieur. Consultez un médecin en cas de symptômes."
  },
  {
    level: 6,
    label: 'Extrêmement Mauvais',
    color: '#803399',
    textColor: 'text-white',
    icon: Activity,
    description: "Situation critique. Risques sanitaires importants pour toute la population.",
    recommendations: "Restez à l'intérieur, fenêtres fermées. Évitez tout effort physique."
  }
];

export const AirQualityGuide = () => {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const selectedInfo = ATMO_LEVELS.find(l => l.level === selectedLevel) || ATMO_LEVELS[0];
  const Icon = selectedInfo.icon;

  return (
    <section className="w-full max-w-7xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-3 mb-10">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-teal-500" />
          Comprendre l&apos;indice ATMO
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          L&apos;échelle de qualité de l&apos;air et les recommandations sanitaires associées pour la Guadeloupe.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Left: List of Levels */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {ATMO_LEVELS.map((info) => (
            <button
              key={info.level}
              onClick={() => setSelectedLevel(info.level)}
              className={`group relative w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedLevel === info.level
                ? 'bg-white dark:bg-slate-800 shadow-lg scale-[1.02] z-10'
                : 'bg-white/50 dark:bg-slate-800/50 border-transparent hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                }`}
              style={{
                borderColor: selectedLevel === info.level ? info.color : 'transparent'
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-lg shadow-sm transition-transform duration-300 flex items-center justify-center font-bold text-sm ${selectedLevel === info.level ? 'scale-110' : 'group-hover:scale-105'}`}
                  style={{ backgroundColor: info.color, color: info.level >= 5 ? 'white' : 'black' }}
                >
                  {info.level}
                </div>
                <span className={`font-bold text-lg ${selectedLevel === info.level ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {info.label}
                </span>
              </div>

              <div className={`text-slate-400 dark:text-slate-500 ${selectedLevel === info.level ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                <info.icon className="w-5 h-5" />
              </div>
            </button>
          ))}
        </div>

        {/* Right: Card Details */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLevel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden relative min-h-[400px] flex flex-col"
            >
              {/* Decorative background element */}
              <div
                className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"
                style={{ backgroundColor: selectedInfo.color }}
              />

              <div className="flex flex-col gap-8 relative z-10 flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-700/50">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                    style={{ backgroundColor: selectedInfo.color }}
                  >
                    <Icon className={`w-10 h-10 ${selectedInfo.level >= 5 ? 'text-white' : 'text-slate-900'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Indice ATMO</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Niveau {selectedInfo.level}/6</span>
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {selectedInfo.label}
                    </h3>
                    <p className="text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {selectedInfo.description}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300" style={{ backgroundColor: selectedInfo.color }}></div>

                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2.5 text-lg mb-4">
                      <HeartPulse className="w-5 h-5 text-rose-500" />
                      Recommandations sanitaires
                    </h4>

                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                      {selectedInfo.recommendations}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
