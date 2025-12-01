import React from 'react';
import { createPortal } from 'react-dom';
import { HoverInfo } from '../GuadeloupeMap';
import { ALL_COMMUNES } from '../../meteo/constants';

interface CommuneTooltipProps {
  hoveredInfo: HoverInfo | null;
}

export const CommuneTooltip: React.FC<CommuneTooltipProps> = ({ hoveredInfo }) => {
  if (!hoveredInfo || typeof document === 'undefined') return null;

  const communeName = ALL_COMMUNES[hoveredInfo.data.code_zone || ''] || hoveredInfo.data.lib_zone || hoveredInfo.data.code_zone;

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9999] bg-black/80 text-white text-xs px-2 py-1 rounded shadow-lg transform -translate-x-1/2 -translate-y-full"
      style={{ left: hoveredInfo.x, top: hoveredInfo.y - 10 }}
    >
      {communeName}
    </div>,
    document.body
  );
};
