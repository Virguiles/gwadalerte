import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { VigilanceLevelInfo } from '../types';

interface VigilanceBannerProps {
  currentVigilanceInfo: VigilanceLevelInfo;
  relativeLastUpdate: string | null;
  onScrollToDetails: () => void;
}

export const VigilanceBanner: React.FC<VigilanceBannerProps> = ({
  currentVigilanceInfo,
  relativeLastUpdate,
  onScrollToDetails,
}) => {
  return (
    <div className="w-full mb-4">
      <div
        className="rounded-xl border-2 p-4 transition-all duration-300 shadow-lg"
        style={{
          borderColor: `${currentVigilanceInfo.color}80`,
          backgroundColor: currentVigilanceInfo.highlight,
          boxShadow: `0 4px 12px ${currentVigilanceInfo.color}20`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md"
              style={{ backgroundColor: currentVigilanceInfo.color }}
            >
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Vigilance actuelle : <span style={{ color: currentVigilanceInfo.color }}>{currentVigilanceInfo.label}</span> – {currentVigilanceInfo.description}
              </p>
              {relativeLastUpdate && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Mis à jour {relativeLastUpdate}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onScrollToDetails}
            className="px-4 py-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 border-2 rounded-lg font-semibold text-gray-800 dark:text-white transition-all shadow-sm hover:shadow-md"
            style={{ borderColor: currentVigilanceInfo.color }}
          >
            Comprendre ce niveau
          </button>
        </div>
      </div>
    </div>
  );
};
