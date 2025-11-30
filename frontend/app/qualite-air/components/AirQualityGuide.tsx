import { ShieldCheck, Leaf, Info, AlertTriangle, AlertOctagon, Activity, HeartPulse, BookOpen } from 'lucide-react';
import { InteractiveGuide, GuideItem } from '../../components/shared/InteractiveGuide';

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

export const AirQualityGuide = () => {
  const guideItems: GuideItem[] = ATMO_LEVELS_DATA.map(item => ({
    id: item.level,
    label: item.label,
    color: item.color,
    icon: item.icon,
    headerDescription: item.description,
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

  return (
    <InteractiveGuide
      title="Comprendre l'indice ATMO"
      description="L'échelle de qualité de l'air et les recommandations sanitaires associées pour la Guadeloupe."
      mainIcon={BookOpen}
      mainIconColorClass="text-teal-500"
      items={guideItems}
    />
  );
};
