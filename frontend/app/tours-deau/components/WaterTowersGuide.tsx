import {
  Droplets,
  AlertTriangle,
  FileWarning,
  Activity,
  Info,
  Clock,
  Construction,
  FileQuestion,
  MapPin,
  ClipboardList,
  Map
} from 'lucide-react';
import { InteractiveGuide, GuideItem } from '../../components/shared/InteractiveGuide';

// Données basées sur l'Analyse Systémique fournie
const WATER_GUIDE_DATA = [
  {
    id: 1,
    label: 'Le Système',
    color: '#3B82F6', // Bleu
    icon: Droplets,
    description: "Comprendre pourquoi l'eau est coupée : une crise structurelle au-delà de la sécheresse.",
    sections: [
      {
        title: "Mode dégradé permanent",
        icon: Info,
        iconColorClass: "text-blue-500",
        content: "Le système d'eau en Guadeloupe ne fonctionne plus selon les normes standards. Le « tour d'eau », initialement prévu pour les sécheresses (carême), est devenu le mode de fonctionnement par défaut pour gérer la pénurie structurelle."
      },
      {
        title: "Gestion de la pénurie",
        icon: Construction,
        iconColorClass: "text-orange-500",
        content: "Les coupures sont organisées pour répartir la ressource. On ferme un secteur pour permettre aux réservoirs de se remplir la nuit et alimenter un autre secteur le lendemain."
      }
    ]
  },
  {
    id: 2,
    label: 'Types de Coupures',
    color: '#F59E0B', // Orange
    icon: AlertTriangle,
    description: "Distinction cruciale entre ce qui est prévu et ce qui est subi.",
    sections: [
      {
        title: "Tours d'Eau « Solidaires »",
        icon: Clock,
        iconColorClass: "text-blue-500",
        content: "Ce sont les coupures planifiées sur le PDF. Elles sont prévisibles (théoriquement) et visent une rotation équitable."
      },
      {
        title: "Coupures Techniques (Inopinées)",
        icon: AlertTriangle,
        iconColorClass: "text-red-500",
        content: "Elles surviennent suite à des incidents : casses (25 par jour !), pannes de pompes ou obstructions. Elles rendent le planning caduc instantanément. Si une casse survient le lundi, le tour d'eau du mardi devient sans objet."
      }
    ]
  },
  {
    id: 3,
    label: 'Fiabilité Planning',
    color: '#EF4444', // Rouge
    icon: FileWarning,
    description: "Pourquoi le PDF du SMGEAG ne correspond pas toujours à votre réalité.",
    sections: [
      {
        title: "Prévision Théorique",
        icon: FileQuestion,
        iconColorClass: "text-orange-500",
        content: "Le planning est une « Prévision Théorique » ou « Sous Réserve Technique ». Il ne constitue pas une vérité absolue, car les aléas (casses, pannes) survenus après sa publication le rendent souvent caduc."
      },
      {
        title: "Flou géographique",
        icon: MapPin,
        iconColorClass: "text-gray-500",
        content: "Les zones comme « Gosier 1 » ou « Mare-Gaillard » sont parfois floues. De plus, les « Flashs Infos » (Facebook) contredisent souvent le PDF quelques heures après sa sortie."
      }
    ]
  },
  {
    id: 4,
    label: 'Inertie Physique',
    color: '#8B5CF6', // Violet
    icon: Activity,
    description: "L'eau n'est pas de l'électricité : elle met du temps à arriver.",
    sections: [
      {
        title: "Remplissage et Purge",
        icon: Droplets,
        iconColorClass: "text-blue-500",
        content: "À la réouverture, l'eau doit remplir des kilomètres de conduites vides. L'air accumulé doit être chassé (risque de casse si mal fait). Cela crée un décalage important."
      },
      {
        title: "Latence hydraulique",
        icon: Clock,
        iconColorClass: "text-purple-500",
        content: "Si l'horaire indique 6h00, cela signifie l'ouverture de la vanne principale. L'eau peut mettre plusieurs heures à atteindre votre robinet selon la distance et la pression."
      }
    ]
  },
  {
    id: 6,
    label: 'État des Lieux',
    color: '#64748B', // Slate
    icon: ClipboardList,
    description: "Ce n'est pas un manque d'eau à la source, mais une incapacité à la transporter (Source: CRC 2025).",
    sections: [
      {
        title: "Un réseau passoire (71% de pertes)",
        icon: Droplets,
        iconColorClass: "text-blue-500",
        content: "Pour 100 litres produits, seuls 29 arrivent au robinet. Le rendement est de 29,1%. Chaque km de tuyau perd 52 000 litres par jour."
      },

      {
        title: "Gestion « à l'aveugle »",
        icon: FileWarning,
        iconColorClass: "text-orange-500",
        content: "Faute de moyens, le système d'information géographique (SIG) et la télégestion (capteurs connectés sur le réseau) ne sont pas déployés de manière optimale. Le SMGEAG gère donc le réseau « à l'aveugle » ou presque, ce qui explique pourquoi les plannings sont basés sur des estimations humaines plutôt que sur des données télémétriques précises."
      }
    ]
  },
  {
    id: 5,
    label: 'Zones Blanches (DSP)',
    color: '#0EA5E9', // Sky blue
    icon: Map,
    description: "Certaines communes (Bouillante, Lamentin...) ne sont pas gérées par le SMGEAG.",
    sections: [
      {
        title: "Gestion par la SAUR",
        icon: Info,
        iconColorClass: "text-sky-500",
        content: "Les communes en Délégation de Service Public (DSP) comme Bouillante ou Lamentin dépendent de la SAUR. Elles ne figurent pas sur les plannings SMGEAG traités ici."
      },
      {
        title: "Qui contacter ?",
        icon: MapPin,
        iconColorClass: "text-gray-500",
        content: "Pour ces zones, référez-vous directement aux communications de la SAUR ou de votre mairie. Notre carte signale ces zones pour éviter toute confusion."
      }
    ]
  }
];

export const WaterTowersGuide = () => {
  const guideItems: GuideItem[] = WATER_GUIDE_DATA.map(item => ({
    id: item.id,
    label: item.label,
    color: item.color,
    icon: item.icon,
    headerDescription: item.description,
    sections: item.sections
  }));

  return (
    <InteractiveGuide
      title="Comprendre les Tours d'Eau"
      description="Pourquoi le planning n'est pas toujours fiable ? Analyse du fonctionnement hydraulique et des contraintes du réseau en Guadeloupe."
      mainIcon={Info}
      mainIconColorClass="text-blue-500"
      items={guideItems}
    />
  );
};
