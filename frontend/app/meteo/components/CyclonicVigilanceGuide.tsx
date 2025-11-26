import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VIGILANCE_LEVEL_DETAILS } from '../constants';
import { AlertTriangle, Info, Shield, Home, Wind, CloudRain, Zap, Waves, CheckCircle } from 'lucide-react';
import { useMeteoData } from '../hooks/useMeteoData';

export const CyclonicVigilanceGuide = () => {
  const { vigilanceData, mounted } = useMeteoData();
  const currentLevel = vigilanceData?.level;
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  useEffect(() => {
    if (currentLevel !== undefined && currentLevel >= 1) {
      setSelectedLevel(currentLevel);
    } else {
      setSelectedLevel(1);
    }
  }, [currentLevel]);

  const selectedInfo = VIGILANCE_LEVEL_DETAILS[selectedLevel] || VIGILANCE_LEVEL_DETAILS[1];

  const getIcon = (level: number) => {
    switch (level) {
      case 1: return <CheckCircle className="w-8 h-8" />;
      case 2: return <Info className="w-8 h-8" />;
      case 3: return <AlertTriangle className="w-8 h-8" />;
      case 4: return <AlertTriangle className="w-8 h-8" />;
      case 5: return <Home className="w-8 h-8" />;
      case 6: return <Shield className="w-8 h-8" />;
      default: return <Info className="w-8 h-8" />;
    }
  };

  // Filter levels to show (1 to 6)
  const visibleLevels = Object.values(VIGILANCE_LEVEL_DETAILS)
    .filter(v => v.level >= 1 && v.level <= 6)
    .sort((a, b) => a.level - b.level);

  if (!mounted) return null;

  return (
    <section className="w-full max-w-7xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-3 mb-10">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Comprendre la vigilance</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Découvrez la signification des couleurs de vigilance et les comportements à adopter pour votre sécurité.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Left: List of Levels */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {visibleLevels.map((info) => (
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
                  className={`w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${selectedLevel === info.level ? 'scale-125' : 'group-hover:scale-110'}`}
                  style={{ backgroundColor: info.color }}
                />
                <span className={`font-bold text-lg ${selectedLevel === info.level ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {info.label}
                </span>
              </div>

              {currentLevel === info.level && (
                <span className="px-3 py-1 text-xs font-bold text-white rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 shadow-sm animate-pulse">
                  ACTUEL
                </span>
              )}
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
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden relative"
            >
              {/* Decorative background element */}
              <div
                className="absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"
                style={{ backgroundColor: selectedInfo.color }}
              />

              <div className="flex flex-col gap-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-700/50">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                    style={{ backgroundColor: selectedInfo.color }}
                  >
                    <div className="text-white">
                      {getIcon(selectedInfo.level)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      Vigilance {selectedInfo.label}
                    </h3>
                    <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
                      {selectedInfo.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  {/* Characteristics */}
                  <div className="space-y-5">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2.5 text-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Phénomènes surveillés
                    </h4>
                    <ul className="space-y-4">
                      {selectedInfo.characteristics?.map((char, idx) => (
                        <li key={idx} className="flex items-start gap-3.5 group">
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-2.5 shrink-0 group-hover:bg-amber-500 transition-colors" />
                          <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {char}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Advice */}
                  <div className="space-y-5">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2.5 text-lg">
                      <Shield className="w-5 h-5 text-blue-500" />
                      Comportements à adopter
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 h-full">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {selectedInfo.advice}
                      </p>
                    </div>
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
