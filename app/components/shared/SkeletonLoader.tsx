import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'badge' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text' }) => {
  const baseClass = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'h-4 rounded',
    card: 'h-32 rounded-xl',
    badge: 'h-8 w-24 rounded-full',
    circle: 'h-12 w-12 rounded-full'
  };

  return <div className={`${baseClass} ${variantClasses[variant]} ${className}`} />;
};

export const WidgetSkeleton: React.FC = () => (
  <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="h-5 w-5" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Main content */}
      <Skeleton variant="badge" className="w-28" />

      {/* Details */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  </div>
);

export const MapSkeleton: React.FC = () => (
  <div className="relative w-full h-full min-h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto animate-spin-slow flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Chargement de la carte interactive...
        </p>
      </div>
    </div>
  </div>
);

export const CommuneDetailsSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton variant="circle" className="h-10 w-10" />
    </div>

    {/* Weather Section */}
    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>

    {/* Water Section */}
    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 border border-cyan-100 dark:border-cyan-800">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton variant="badge" className="w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>

    {/* Air Section */}
    <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-100 dark:border-green-800">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton variant="badge" className="w-24" />
    </div>
  </div>
);
