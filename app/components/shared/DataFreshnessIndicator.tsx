import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface DataFreshnessIndicatorProps {
  lastUpdated: Date | null;
  autoRefresh?: boolean;
  className?: string;
}

export const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  lastUpdated,
  autoRefresh = false,
  className = ''
}) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diffMs = now.getTime() - lastUpdated.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) {
        setTimeAgo("À l'instant");
      } else if (diffMinutes < 60) {
        setTimeAgo(`il y a ${diffMinutes} min`);
      } else if (diffHours < 24) {
        setTimeAgo(`il y a ${diffHours}h`);
      } else {
        setTimeAgo(`il y a ${diffDays}j`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (!lastUpdated) {
    return null;
  }

  const isRecent = new Date().getTime() - lastUpdated.getTime() < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
      isRecent
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
    } ${className}`}>
      {isRecent ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <Clock className="w-3.5 h-3.5" />
      )}
      <span>
        {autoRefresh && isRecent ? '✓ À jour' : `Mis à jour ${timeAgo}`}
      </span>
    </div>
  );
};
