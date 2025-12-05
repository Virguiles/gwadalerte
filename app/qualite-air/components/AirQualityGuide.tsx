import { ShieldCheck, Leaf, Info, AlertTriangle, AlertOctagon, Activity, HeartPulse, BookOpen } from 'lucide-react';
import { InteractiveGuide, GuideItem } from '../../components/shared/InteractiveGuide';
import { AirData } from '../../components/GuadeloupeMap';
import { useMemo } from 'react';

// Données des niveaux ATMO
const ATMO_LEVELS_DATA = [
  {
    level: 1,
    label: 'Bon',
    color: '#50F0E6',
    icon: ShieldCheck,
    description: "Qualité de l'air idéale. Profitez-en pour aérer et bouger !",
    recommendations: "Idéal pour toutes les activités de plein air. Aérez votre logement sans restriction."
  },
  {
    level: 2,
    label: 'Moyen',
    color: '#50CCAA',
    icon: Leaf,
    description: "Qualité acceptable. Aucun risque pour la majorité de la population.",
    recommendations: "Activités habituelles. Aérez votre logement tôt le matin ou tard le soir."
  },
  {
    level: 3,
    label: 'Dégradé',
    color: '#F0E641',
    icon: Info,
    description: "Qualité moyenne. Les personnes sensibles peuvent ressentir une gêne.",
    recommendations: "Envisagez de réduire les efforts intenses si vous êtes sensible (asthme, allergies)."
  },
  {
    level: 4,
    label: 'Mauvais',
    color: '#FF5050',
    icon: AlertTriangle,
    description: "Air pollué. Risques accrus pour les personnes fragiles.",
    recommendations: "Limitez les activités physiques intenses en extérieur. Privilégiez les sorties courtes."
  },
  {
    level: 5,
    label: 'Très Mauvais',
    color: '#960032',
    icon: AlertOctagon,
    description: "Forte pollution. Effets possibles sur la santé de tous.",
    recommendations: "Évitez le sport en extérieur. Consultez un médecin en cas de symptômes."
  },
  {
    level: 6,
    label: 'Extrêmement Mauvais',
    color: '#803399',
    icon: Activity,
    description: "Situation critique. Risques sanitaires importants pour toute la population.",
    recommendations: "Restez à l'intérieur, fenêtres fermées. Évitez tout effort physique."
  }
];

// Mapping des labels de qualité vers les niveaux ATMO
const LABEL_TO_LEVEL: Record<string, number> = {
  'Bon': 1,
  'Moyen': 2,
  'Dégradé': 3,
  'Mauvais': 4,
  'Très Mauvais': 5,
  'Extrêmement Mauvais': 6,
  // Variantes possibles
  'Très bon': 1,
  'Médiocre': 4,
  'Très mauvais': 5,
};

interface AirQualityGuideProps {
  airData?: AirData;
  selectedCommune?: string;
}

export const AirQualityGuide = ({ airData = {}, selectedCommune = '' }: AirQualityGuideProps) => {
  // Calcul du niveau ATMO actuel
  const currentLevel = useMemo(() => {
    if (!airData || Object.keys(airData).length === 0) {
      return null;
    }

    // Si une commune est sélectionnée, utiliser ses données
    if (selectedCommune && airData[selectedCommune]) {
      const communeData = airData[selectedCommune];
      const libQual = communeData.lib_qual;
      if (libQual && LABEL_TO_LEVEL[libQual]) {
        return LABEL_TO_LEVEL[libQual];
      }
    }

    // Sinon, calculer une moyenne pour l'archipel
    const levels: number[] = [];
    Object.values(airData).forEach(commune => {
      const libQual = commune.lib_qual;
      if (libQual && LABEL_TO_LEVEL[libQual]) {
        levels.push(LABEL_TO_LEVEL[libQual]);
      }
    });

    if (levels.length === 0) {
      return null;
    }

    // Calculer la moyenne arrondie (arrondi vers le haut pour être prudent)
    const average = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    return Math.ceil(average);
  }, [airData, selectedCommune]);

  // Obtenir le nom de la zone (commune ou archipel)
  const zoneName = useMemo(() => {
    if (selectedCommune && airData[selectedCommune]) {
      return airData[selectedCommune].lib_zone || 'Commune sélectionnée';
    }
    return "Archipel";
  }, [airData, selectedCommune]);

  const guideItems: GuideItem[] = ATMO_LEVELS_DATA.map(item => ({
    id: item.level,
    label: item.label,
    color: item.color,
    icon: item.icon,
    headerDescription: item.description,
    isCurrent: currentLevel === item.level,
    subLabel: currentLevel === item.level ? zoneName : undefined,
    sections: [
      {
        title: "Description",
        icon: Info,
        iconColorClass: "text-blue-500",
        content: item.description
      },
      {
        title: "Recommandations sanitaires",
        icon: HeartPulse,
        iconColorClass: "text-rose-500",
        content: item.recommendations
      }
    ]
  }));

  const description = currentLevel
    ? `L'échelle de qualité de l'air et les recommandations sanitaires associées pour la Guadeloupe. Qualité actuelle : ${ATMO_LEVELS_DATA.find(item => item.level === currentLevel)?.label || 'N/A'} sur ${zoneName}.`
    : "L'échelle de qualité de l'air et les recommandations sanitaires associées pour la Guadeloupe.";

  return (
    <InteractiveGuide
      title="Comprendre l'indice ATMO"
      description={description}
      mainIcon={BookOpen}
      mainIconColorClass="text-teal-500"
      items={guideItems}
      defaultSelectedId={currentLevel || undefined}
    />
  );
};
