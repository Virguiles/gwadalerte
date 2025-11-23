import { VigilanceLevelInfo } from './types';

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
    advice: 'Restez attentif aux évolutions et préparez-vous à adapter vos activités si nécessaire.',
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
  },
};

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
