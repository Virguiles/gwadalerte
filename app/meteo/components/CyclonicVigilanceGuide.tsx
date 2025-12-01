import { useMemo } from 'react';
import { VIGILANCE_LEVEL_DETAILS } from '../constants';
import { AlertTriangle, Info, Shield, Home, CheckCircle } from 'lucide-react';
import { useMeteoData } from '../hooks/useMeteoData';
import { InteractiveGuide, GuideItem } from '../../components/shared/InteractiveGuide';

export const CyclonicVigilanceGuide = () => {
  const { vigilanceData, mounted } = useMeteoData();
  const currentLevel = vigilanceData?.level;

  const defaultLevel = useMemo(() => {
    return (currentLevel !== undefined && currentLevel >= 1) ? currentLevel : 1;
  }, [currentLevel]);

  // Filter levels to show (1 to 6)
  const visibleLevels = useMemo(() => Object.values(VIGILANCE_LEVEL_DETAILS)
    .filter(v => v.level >= 1 && v.level <= 6)
    .sort((a, b) => a.level - b.level), []);

  const getIconComponent = (level: number) => {
    switch (level) {
      case 1: return CheckCircle;
      case 2: return Info;
      case 3: return AlertTriangle;
      case 4: return AlertTriangle;
      case 5: return Home;
      case 6: return Shield;
      default: return Info;
    }
  };

  if (!mounted) return null;

  const guideItems: GuideItem[] = visibleLevels.map(info => ({
    id: info.level,
    label: info.label,
    color: info.color,
    icon: getIconComponent(info.level),
    headerDescription: info.description,
    isCurrent: currentLevel === info.level,
    sections: [
      {
        title: "Phénomènes surveillés",
        icon: AlertTriangle,
        iconColorClass: "text-amber-500",
        content: (
          <ul className="space-y-3">
            {info.characteristics?.map((char, idx) => (
              <li key={idx} className="flex items-start gap-3.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-2.5 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {char}
                </span>
              </li>
            ))}
          </ul>
        )
      },
      {
        title: "Comportements à adopter",
        icon: Shield,
        iconColorClass: "text-blue-500",
        content: info.advice
      }
    ]
  }));

  return (
    <InteractiveGuide
      title="Comprendre la vigilance"
      description="Découvrez la signification des couleurs de vigilance et les comportements à adopter pour votre sécurité."
      mainIcon={AlertTriangle}
      mainIconColorClass="text-blue-500"
      items={guideItems}
      defaultSelectedId={defaultLevel}
    />
  );
};
