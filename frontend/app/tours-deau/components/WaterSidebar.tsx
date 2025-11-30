import React from 'react';
import { WaterCutData, DateFilter } from '../types';
import { WaterGlobalView } from './WaterGlobalView';
import { WaterCommuneView } from './WaterCommuneView';

interface WaterSidebarProps {
  data: WaterCutData | null;
  dateFilter: DateFilter;
  archipelInfo?: {
    affectedCommunes: number;
  };
  onClose?: () => void;
}

export const WaterSidebar: React.FC<WaterSidebarProps> = ({
  data,
  dateFilter,
  archipelInfo,
  onClose
}) => {
  // Rendu par défaut : Vue globale de l'archipel (quand aucune commune n'est sélectionnée)
  if (!data) {
    return <WaterGlobalView archipelInfo={archipelInfo} dateFilter={dateFilter} />;
  }

  // Rendu Commune Sélectionnée
  return <WaterCommuneView data={data} dateFilter={dateFilter} onClose={onClose} />;
};
