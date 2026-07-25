import React from 'react';

interface MapPanelProps {
  /**
   * Vrai quand le panneau est accolé sous une barre d'onglets : les coins
   * hauts et la bordure supérieure sont alors supprimés pour se raccorder.
   */
  underTabs?: boolean;
  children: React.ReactNode;
}

/** Cadre de la carte interactive, identique sur les trois pages thématiques. */
export const MapPanel: React.FC<MapPanelProps> = ({ underTabs = false, children }) => (
  <div
    className={`relative h-[500px] md:h-[700px] min-h-[400px] md:min-h-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden ${
      underTabs ? 'border-x border-b rounded-b-lg' : 'border rounded-lg'
    }`}
  >
    {children}
  </div>
);
