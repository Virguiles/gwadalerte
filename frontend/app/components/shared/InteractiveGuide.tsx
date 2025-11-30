import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface GuideSection {
  title: string;
  icon: LucideIcon;
  iconColorClass?: string;
  content: React.ReactNode;
}

export interface GuideItem {
  id: string | number;
  label: string;
  subLabel?: string;
  color: string;
  icon: LucideIcon | React.FC<any>;
  headerDescription?: string;
  sections: GuideSection[];
  isCurrent?: boolean; // To display "Niveau actuel" badge
}

interface InteractiveGuideProps {
  title: string;
  description: string;
  mainIcon: LucideIcon;
  mainIconColorClass?: string;
  items: GuideItem[];
  defaultSelectedId?: string | number;
  onSelectionChange?: (id: string | number) => void;
}

export const InteractiveGuide: React.FC<InteractiveGuideProps> = ({
  title,
  description,
  mainIcon: MainIcon,
  mainIconColorClass = "text-blue-500",
  items,
  defaultSelectedId,
  onSelectionChange
}) => {
  const [selectedId, setSelectedId] = useState<string | number>(
    defaultSelectedId ?? (items[0]?.id)
  );

  // Update internal state if defaultSelectedId changes (useful for Cyclonic guide initialization)
  useEffect(() => {
    if (defaultSelectedId !== undefined) {
      setSelectedId(defaultSelectedId);
    }
  }, [defaultSelectedId]);

  const handleSelect = (id: string | number) => {
    setSelectedId(id);
    if (onSelectionChange) {
      onSelectionChange(id);
    }
  };

  const selectedInfo = items.find(i => i.id === selectedId) || items[0];
  if (!selectedInfo) return null;

  const Icon = selectedInfo.icon;

  return (
    <section className="w-full max-w-7xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-3 mb-10">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <MainIcon className={`w-8 h-8 ${mainIconColorClass}`} />
          {title}
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Left: List of Items */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {items.map((info) => (
            <button
              key={info.id}
              onClick={() => handleSelect(info.id)}
              className={`group relative w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedId === info.id
                  ? 'bg-white dark:bg-slate-800 shadow-lg scale-[1.02] z-10'
                  : 'bg-white/50 dark:bg-slate-800/50 border-transparent hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
              }`}
              style={{
                borderColor: selectedId === info.id ? info.color : 'transparent'
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg shadow-sm transition-transform duration-300 flex items-center justify-center ${
                    selectedId === info.id ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                  style={{ backgroundColor: `${info.color}20`, color: info.color }}
                >
                  <info.icon className="w-5 h-5" />
                </div>
                <div>
                  <span
                    className={`font-bold text-lg block ${
                      selectedId === info.id
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {info.label}
                  </span>
                  {info.subLabel && (
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block">
                      {info.subLabel}
                    </span>
                  )}
                  {info.isCurrent && (
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 block mt-0.5">
                      Niveau actuel
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Card Details */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden relative min-h-[400px] flex flex-col"
            >
              {/* Decorative background element */}
              <div
                className="absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"
                style={{ backgroundColor: selectedInfo.color }}
              />

              <div className="flex flex-col gap-8 relative z-10 flex-1">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-700/50">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                    style={{ backgroundColor: selectedInfo.color }}
                  >
                    <div className="text-white flex items-center justify-center">
                      <Icon className="w-10 h-10" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {selectedInfo.label}
                    </h3>
                    {selectedInfo.headerDescription && (
                      <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
                        {selectedInfo.headerDescription}
                      </p>
                    )}
                    {selectedInfo.subLabel && !selectedInfo.headerDescription && (
                       <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
                        {selectedInfo.subLabel}
                       </p>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  {selectedInfo.sections.map((section, idx) => (
                    <div key={idx} className="space-y-4 flex flex-col">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2.5 text-lg">
                        <section.icon className={`w-5 h-5 ${section.iconColorClass || 'text-blue-500'}`} />
                        {section.title}
                      </h4>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex-1 min-h-fit">
                        {typeof section.content === 'string' ? (
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {section.content}
                            </p>
                        ) : (
                            section.content
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
