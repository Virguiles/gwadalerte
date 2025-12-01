import { VigilanceLevelInfo } from './types';

// Extension de l'interface pour inclure les caractéristiques
// Note: Il faudrait idéalement mettre à jour types.ts, mais on peut le faire ici ou caster
interface ExtendedVigilanceLevelInfo extends VigilanceLevelInfo {
  characteristics?: string[];
}


export const VIGILANCE_LEVEL_DETAILS: Record<number, VigilanceLevelInfo> = {
  [-1]: {
    level: -1,
    label: 'Indisponible',
    color: '#CCCCCC',
    description: 'Information momentanément indisponible',
    advice: 'Les détails de vigilance ne sont pas fournis. Consultez les bulletins officiels pour confirmation.',
    icon: '⚪️',
    highlight: 'rgba(204, 204, 204, 0.25)',
  },
  0: {
    level: 0,
    label: 'Vert',
    color: '#28d761',
    description: 'Pas de vigilance particulière',
    advice: 'Restez informé des bulletins réguliers et poursuivez vos activités normalement.',
    icon: '🟢',
    highlight: 'rgba(40, 215, 97, 0.15)',
  },
  1: {
    level: 1,
    label: 'Vert',
    color: '#28d761',
    description: 'Pas de vigilance particulière',
    advice: 'Restez informé des bulletins réguliers et poursuivez vos activités normalement.',
    icon: '🟢',
    highlight: 'rgba(40, 215, 97, 0.15)',
  },
  2: {
    level: 2,
    label: 'Jaune',
    color: '#f0d53c',
    description: 'Soyez attentifs',
    advice: 'Informez-vous de la situation météorologique et soyez particulièrement prudents si vous pratiquez des sports à risque en extérieur, si vos activités de plein air sont situées dans une zone exposée, ou si vous devez circuler dans des zones inondables (franchissement de gués ou de passages bas encaissés). En cas d\'orage : évitez l\'utilisation des téléphones et des appareils électriques. Ne vous abritez pas dans une zone boisée, tout près de pylônes ou poteaux.',
    icon: '🟡',
    highlight: 'rgba(240, 213, 60, 0.18)',
  },
  3: {
    level: 3,
    label: 'Orange',
    color: '#FF9900',
    description: 'Soyez très vigilants',
    advice: 'Limitez vos déplacements au strict nécessaire et suivez les consignes des autorités.',
    icon: '🟠',
    highlight: 'rgba(255, 153, 0, 0.18)',
  },
  4: {
    level: 4,
    label: 'Rouge',
    color: '#FF0000',
    description: 'Vigilance absolue',
    advice: 'Restez en sécurité, tenez-vous informé en permanence et appliquez les consignes officielles.',
    icon: '🔴',
    highlight: 'rgba(255, 0, 0, 0.18)',
    characteristics: [
      'Phénomènes dangereux d\'intensité exceptionnelle',
      'Menace directe pour la sécurité des personnes et des biens',
      'Sorties fortement déconseillées'
    ]
  },
  5: {
    level: 5,
    label: 'Violet',
    color: '#A020F0',
    description: 'Confinement',
    advice: 'Danger imminent. Restez à l\'abri et ne sortez sous aucun prétexte. Écoutez les médias.',
    icon: '🟣',
    highlight: 'rgba(160, 32, 240, 0.18)',
    characteristics: [
      'Cyclone tropical intense représentant un danger imminent',
      'Effets majeurs attendus dans les 3 à 6 heures',
      'Interdiction totale de circuler',
      'Confinement strict obligatoire'
    ]
  },
  6: {
    level: 6,
    label: 'Gris',
    color: '#808080',
    description: 'Phase de sauvegarde',
    advice: 'Restez prudents. Dangers subsistants (inondations, fils à terre). Limitez les déplacements.',
    icon: '⚪',
    highlight: 'rgba(128, 128, 128, 0.18)',
    characteristics: [
      'Menace cyclonique écartée mais dangers persistants',
      'Risques d\'inondations, éboulements, fils électriques à terre',
      'Équipes de secours et de déblaiement à l\'œuvre',
      'Retour progressif à la normale'
    ]
  }
};

// Add characteristics to other levels
VIGILANCE_LEVEL_DETAILS[-1].characteristics = ['Données non disponibles'];
VIGILANCE_LEVEL_DETAILS[0].characteristics = ['Situation météorologique normale', 'Pas de vigilance particulière'];
VIGILANCE_LEVEL_DETAILS[1].characteristics = ['Situation météorologique normale', 'Pas de vigilance particulière'];
VIGILANCE_LEVEL_DETAILS[2].characteristics = [
  'Phénomènes habituels dans la région mais occasionnellement dangereux',
  'Vents violents possibles',
  'Fortes pluies et orages prévus',
  'Risques de vagues-submersion sur le littoral',
  'Perturbation locale des activités possible',
  'Zones à risque : montagne, cours d\'eau, mer, zones inondables'
];
VIGILANCE_LEVEL_DETAILS[3].characteristics = [
  'Phénomènes dangereux prévus',
  'Conséquences possibles sur la vie collective',
  'Perturbations de la circulation et des réseaux',
  'Tenez-vous au courant de l\'évolution de la situation'
];


export const DEFAULT_VIGILANCE_INFO = VIGILANCE_LEVEL_DETAILS[1];

export const PHENOMENON_DETAILS: Record<
  string,
  { icon: string; description: string; advice: string }
> = {
  Vent: {
    icon: '💨',
    description: 'Rafales fortes ou vent turbulent.',
    advice: 'Sécurisez les objets sensibles au vent et limitez les activités en hauteur.',
  },
  'Pluie-inondation': {
    icon: '🌧️',
    description: 'Précipitations soutenues pouvant provoquer des ruissellements ou inondations.',
    advice: 'Éloignez-vous des zones inondables et ne vous engagez pas sur une route submergée.',
  },
  Orages: {
    icon: '⛈️',
    description: "Activité orageuse marquée avec risque d'éclairs et de rafales.",
    advice: "Abritez-vous et évitez l'utilisation d'appareils électriques durant l'orage.",
  },
  Crues: {
    icon: '🌊',
    description: 'Montée rapide des niveaux des rivières et ravines.',
    advice: "Surveillez les cours d'eau et préparez un itinéraire de repli si nécessaire.",
  },
  'Vagues-submersion': {
    icon: '🌊',
    description: 'Vagues puissantes pouvant submerger le littoral.',
    advice: "Éloignez-vous du bord de mer et respectez les interdictions d'accès.",
  },
  'Mer-houle': {
    icon: '🌊',
    description: 'Houle importante en mer et sur le littoral.',
    advice: 'Limitez les sorties en mer et surveillez le littoral.',
  },
};

export const ALL_COMMUNES: { [code: string]: string } = {
  '97101': 'Les Abymes',
  '97102': 'Anse-Bertrand',
  '97103': 'Baie-Mahault',
  '97104': 'Baillif',
  '97105': 'Basse-Terre',
  '97106': 'Bouillante',
  '97107': 'Capesterre-Belle-Eau',
  '97108': 'Capesterre-de-Marie-Galante',
  '97109': 'Gourbeyre',
  '97110': 'La Désirade',
  '97111': 'Deshaies',
  '97112': 'Grand-Bourg',
  '97113': 'Le Gosier',
  '97114': 'Goyave',
  '97115': 'Lamentin',
  '97116': 'Morne-à-l\'Eau',
  '97117': 'Le Moule',
  '97118': 'Petit-Bourg',
  '97119': 'Petit-Canal',
  '97120': 'Pointe-à-Pitre',
  '97121': 'Pointe-Noire',
  '97122': 'Port-Louis',
  '97124': 'Saint-Claude',
  '97125': 'Saint-François',
  '97126': 'Saint-Louis',
  '97128': 'Sainte-Anne',
  '97129': 'Sainte-Rose',
  '97130': 'Terre-de-Bas',
  '97131': 'Terre-de-Haut',
  '97132': 'Trois-Rivières',
  '97133': 'Vieux-Fort',
  '97134': 'Vieux-Habitants',
  '97801': 'Saint-Martin',
};
