import React from 'react';
import { CommuneData } from '../../components/GuadeloupeMap';
import { AirGlobalView } from './AirGlobalView';
import { AirCommuneView } from './AirCommuneView';

interface AirSidebarProps {
  data: CommuneData | null;
  lastUpdate: Date | null;
  formatDateTime: (date: Date) => string;
  onClose?: () => void;
}

export const AirSidebar: React.FC<AirSidebarProps> = ({
  data,
  lastUpdate,
  formatDateTime,
  onClose
}) => {

  // Fonction pour formater la date de mise à jour de manière claire et précise
  const formatLastUpdate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    // Si moins de 1 minute
    if (diffMinutes < 1) {
      return 'à l\'instant';
    }
    // Si moins d'1 heure
    if (diffMinutes < 60) {
      return `il y a ${diffMinutes} min`;
    }
    // Si moins de 24 heures
    if (diffHours < 24) {
      return `il y a ${diffHours}h`;
    }
    // Sinon, afficher la date complète avec l'heure
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Rendu par défaut : Vue globale (Synthèse Archipel)
  if (!data) {
    return <AirGlobalView lastUpdate={lastUpdate} formatDateTime={formatDateTime} />;
  }

  // Rendu Commune Sélectionnée
  return <AirCommuneView data={data} lastUpdate={lastUpdate} formatLastUpdate={formatLastUpdate} onClose={onClose} />;
};
