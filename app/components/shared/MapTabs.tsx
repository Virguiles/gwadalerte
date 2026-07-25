import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface MapTab<T extends string> {
  id: T;
  /** Libellé complet, affiché à partir de `sm` */
  label: string;
  /** Libellé court pour les petits écrans (sinon le libellé complet est masqué) */
  labelShort?: string;
  /** Icône optionnelle, qui reçoit l'état actif */
  getIcon?: (isActive: boolean) => React.ReactNode;
}

interface MapTabsProps<T extends string> {
  tabs: MapTab<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Étiquette du groupe d'onglets pour les lecteurs d'écran */
  ariaLabel: string;
  /** Contenu affiché sous les onglets (le panneau de carte) */
  children: React.ReactNode;
}

/**
 * Barre d'onglets accolée au panneau de carte.
 *
 * Les trois pages à carte déclinaient ce bloc à l'identique, avec des
 * variations d'accessibilité selon l'endroit ; cette version reprend la plus
 * complète (anneau de focus visible et panneau associé aux onglets).
 */
export function MapTabs<T extends string>({
  tabs,
  value,
  onValueChange,
  ariaLabel,
  children,
}: MapTabsProps<T>) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next as T)} className="w-full gap-0">
      <TabsList
        className="relative flex h-auto w-full gap-0 bg-transparent p-0"
        aria-label={ariaLabel}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            title={tab.label}
            aria-controls={`${tab.id}-panel`}
            className="flex-1 overflow-hidden rounded-b-none border border-gray-200 dark:border-gray-700 bg-muted py-3 -ml-px first:ml-0 transition-colors data-[state=active]:z-10 data-[state=active]:shadow-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:data-[state=active]:text-white data-[state=active]:border-b-0 data-[state=active]:mb-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {tab.getIcon?.(value === tab.id)}
            {tab.labelShort ? (
              <>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.labelShort}</span>
              </>
            ) : (
              <span className="hidden sm:inline">{tab.label}</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <div role="tabpanel" id={`${value}-panel`}>
        {children}
      </div>
    </Tabs>
  );
}
