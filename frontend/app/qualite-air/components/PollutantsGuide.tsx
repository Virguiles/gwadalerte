import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Sun, Factory, Activity, Stethoscope } from 'lucide-react';
import type { SVGProps } from 'react';

// Composant SVG pour l'icône de fumée
const SmokeIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    className={className}
    fill="currentColor"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 256 256"
    enableBackground="new 0 0 256 256"
    xmlSpace="preserve"
    {...props}
  >
    <path d="M220.37,102.96c1.66-4.58,2.5-9.39,2.5-14.34c0-23.29-18.95-42.24-42.24-42.24c-2.36,0-4.71,0.19-7.01,0.58
	c-5.67-13.22-16.76-23.52-30.54-28.11C116.59,10.02,87.85,24.39,79,50.9c-0.06,0.16-0.11,0.33-0.17,0.49
	c-7.15,2.98-12.97,8.1-16.84,14.46C46.56,63,30.46,68.32,19.83,80.13c-8.14,9.04-12.28,20.71-11.64,32.85
	c0.63,12.14,5.96,23.31,14.99,31.45c2.91,2.62,6.09,4.83,9.5,6.6c-2.21,8.11-1.14,16.84,3.16,24.28
	c4.26,7.37,11.13,12.65,19.35,14.85c2.75,0.74,5.54,1.1,8.31,1.1c5.52,0,10.97-1.45,15.88-4.28c3.85-2.23,7.22-5.3,9.88-8.98H137
	c3.31,0,6-2.69,6-6s-2.69-6-6-6H86c-2.16,0-4.15,1.16-5.21,3.03c-1.8,3.15-4.43,5.83-7.41,7.56c-4.6,2.65-9.95,3.35-15.08,1.98
	s-9.41-4.66-12.07-9.26c-3.34-5.79-3.545-12.817-0.56-18.81c0.872-1.75,0.927-3.81,0.247-5.25c-0.68-1.45-2.097-2.55-3.597-3.09
	c-4.1-1.46-7.83-3.69-11.1-6.64c-6.66-6-10.58-14.22-11.05-23.17c-0.47-8.94,2.58-17.53,8.58-24.19c7.3-8.1,18.1-12.04,28.73-10.83
	c-0.48,2.36-0.75,4.8-0.75,7.29c0,17.5,12.31,32.05,28.93,35.33C86.54,136.94,99.99,150,117,150h45c12.17,0,22.06,9.89,22.06,22.04
	V178h12v-5.96c0-18.77-15.28-34.04-34.06-34.04h-45c-10.87,0-19.39-8.71-19.39-19.83v-3.55c0-3.23-2.55-5.88-5.77-6
	c-12.96-0.48-23.11-11.02-23.11-24c0-10.55,6.76-19.76,16.82-22.91c1.99-0.63,3.51-2.24,4.02-4.26c0.22-0.88,0.5-1.82,0.82-2.77
	c6.75-20.22,28.68-31.18,48.9-24.44c11.89,3.96,21.16,13.49,24.78,25.51c0.46,1.54,1.52,2.82,2.93,3.57
	c1.42,0.75,3.08,0.91,4.61,0.42c2.89-0.9,5.93-1.36,9.02-1.36c16.68,0,30.24,13.56,30.24,30.24c0,2.78-0.37,5.5-1.1,8.12
	c-4.54-1.79-9.49-2.77-14.7-2.77h-5.67c-5.54-14.74-21.4-23.38-37.09-19.53c-6.82,1.69-12.73,5.47-17.09,10.94
	c-2.06,2.59-1.63,6.37,0.96,8.43c2.59,2.07,6.37,1.64,8.43-0.95c2.69-3.38,6.35-5.72,10.58-6.77
	c10.48-2.57,21.132,3.852,23.67,14.35c0.921,3.81,3.328,5.53,6.2,5.53h10.01c16.22,0,28.93,13.63,28.93,31.03v41h12v-41
	C236,123,229.94,110.77,220.37,102.96z M172.044,188.062L248,188v26h-12v24h-52v-24h-12L172.044,188.062z"/>
  </svg>
);

// Données des polluants
const POLLUTANTS = [
  {
    id: 'pm',
    label: 'Particules Fines',
    subLabel: '(PM10, PM2.5)',
    icon: Wind,
    color: '#f97316', // Orange
    origin: "Brumes de sable (Sahara), combustion de biomasse, trafic routier, activités industrielles.",
    healthImpact: "Pénètrent profondément dans les poumons. Peuvent causer des irritations, de l'asthme et gêner la respiration. Les plus fines (PM2.5) passent dans le sang."
  },
  {
    id: 'no2',
    label: 'Dioxyde d\'azote',
    subLabel: '(NO₂)',
    icon: SmokeIcon,
    color: '#ef4444', // Red
    origin: "Principalement lié au trafic routier (moteurs diesel) et à la production d'énergie (centrales électriques).",
    healthImpact: "Gaz irritant pour les bronches. Augmente la fréquence et la gravité des crises d'asthme et favorise les infections pulmonaires chez l'enfant."
  },
  {
    id: 'o3',
    label: 'Ozone',
    subLabel: '(O₃)',
    icon: Sun,
    color: '#eab308', // Yellow
    origin: "Polluant secondaire formé par réaction chimique entre d'autres polluants (NOx, COV) sous l'effet d'un fort ensoleillement.",
    healthImpact: "Gaz agressif pour les muqueuses oculaires et respiratoires. Provoque toux, inconfort thoracique et essoufflement."
  },
  {
    id: 'so2',
    label: 'Dioxyde de Soufre',
    subLabel: '(SO₂)',
    icon: Factory,
    color: '#a855f7', // Purple
    origin: "Combustion de fioul lourd (centrales thermiques, transport maritime), raffineries et volcanisme naturel (La Soufrière).",
    healthImpact: "Irritation immédiate des yeux, du nez et de la gorge. Peut provoquer des spasmes bronchiques chez les asthmatiques."
  }
];

export const PollutantsGuide = () => {
  const [selectedId, setSelectedId] = useState<string>('pm');
  const selectedInfo = POLLUTANTS.find(p => p.id === selectedId) || POLLUTANTS[0];
  const Icon = selectedInfo.icon;

  return (
    <section className="w-full max-w-7xl mx-auto space-y-8 py-12">
      <div className="text-center space-y-3 mb-10">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <Factory className="w-8 h-8 text-blue-500" />
          Guide des polluants
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Comprendre l&apos;origine et les effets des principaux polluants atmosphériques surveillés en Guadeloupe.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Left: List of Pollutants */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {POLLUTANTS.map((info) => (
            <button
              key={info.id}
              onClick={() => setSelectedId(info.id)}
              className={`group relative w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedId === info.id
                ? 'bg-white dark:bg-slate-800 shadow-lg scale-[1.02] z-10'
                : 'bg-white/50 dark:bg-slate-800/50 border-transparent hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                }`}
              style={{
                borderColor: selectedId === info.id ? info.color : 'transparent'
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg shadow-sm transition-transform duration-300 flex items-center justify-center ${selectedId === info.id ? 'scale-110' : 'group-hover:scale-105'}`}
                  style={{ backgroundColor: `${info.color}20`, color: info.color }}
                >
                  <info.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className={`font-bold text-lg block ${selectedId === info.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    {info.label}
                  </span>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {info.subLabel}
                  </span>
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
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {selectedInfo.label}
                    </h3>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
                      {selectedInfo.subLabel}
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  {/* Origin */}
                  <div className="space-y-4 flex flex-col">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2.5 text-lg">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Origine
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex-1 min-h-fit">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedInfo.origin}
                      </p>
                    </div>
                  </div>

                  {/* Health Impact */}
                  <div className="space-y-4 flex flex-col">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2.5 text-lg">
                      <Stethoscope className="w-5 h-5 text-rose-500" />
                      Impact Santé
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex-1 min-h-fit">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {selectedInfo.healthImpact}
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
