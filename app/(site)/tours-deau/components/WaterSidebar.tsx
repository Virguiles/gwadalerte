import React from 'react';
import { WaterCutData, DateFilter } from '../types';
import { WaterGlobalView } from './WaterGlobalView';
import { WaterCommuneView } from './WaterCommuneView';

interface WaterSidebarProps {
  data: WaterCutData | null;
  dateFilter: DateFilter;
  archipelInfo?: {
    affectedCommunes: number;
    affectedCommunesList?: string[];
  };
  /** Date de relevé du planning SMGEAG */
  sourceDate?: Date | null;
  onClose?: () => void;
}

export const WaterSidebar: React.FC<WaterSidebarProps> = ({
  data,
  dateFilter,
  archipelInfo,
  sourceDate = null,
  onClose
}) => {
  // Rendu par défaut : Vue globale de l'archipel (quand aucune commune n'est sélectionnée)
  if (!data) {
    return <WaterGlobalView archipelInfo={archipelInfo} dateFilter={dateFilter} sourceDate={sourceDate} />;
  }

  // Rendu Commune Sélectionnée
  return <WaterCommuneView data={data} dateFilter={dateFilter} sourceDate={sourceDate} onClose={onClose} />;
};
