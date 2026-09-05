'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAirDataSource, type AirDataValue } from '../hooks/useAirData';
import { useWaterDataSource, type WaterDataValue } from '../hooks/useWaterData';
import { useMeteoDataSource, type MeteoDataValue } from '@/app/data/useMeteoData';

/**
 * Source unique des données environnementales.
 *
 * Avant ce provider, chaque composant appelait les hooks de données pour son
 * propre compte : sur /meteo, `useMeteoData` était instancié quatre fois
 * (deux widgets de la Navbar, la carte, le guide cyclonique), soit quatre
 * états, quatre lectures de localStorage, quatre minuteurs et autant d'appels
 * réseau concurrents. Les données sont désormais chargées une fois ici et
 * diffusées par contexte.
 */

type EnableFn = () => void;

const AirContext = createContext<AirDataValue | null>(null);
const WaterContext = createContext<WaterDataValue | null>(null);
const MeteoContext = createContext<MeteoDataValue | null>(null);

// Les données air / eau ne sont chargées qu'à partir du moment où un composant
// les consomme : inutile de les appeler sur /credits ou /mentions-legales.
const EnableAirContext = createContext<EnableFn>(() => {});
const EnableWaterContext = createContext<EnableFn>(() => {});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [airEnabled, setAirEnabled] = useState(false);
  const [waterEnabled, setWaterEnabled] = useState(false);

  const enableAir = useMemo(() => () => setAirEnabled(true), []);
  const enableWater = useMemo(() => () => setWaterEnabled(true), []);

  const air = useAirDataSource(airEnabled);
  const water = useWaterDataSource(waterEnabled);
  // La vigilance est affichée par la Navbar sur toutes les pages : toujours active.
  const meteo = useMeteoDataSource();

  return (
    <EnableAirContext.Provider value={enableAir}>
      <EnableWaterContext.Provider value={enableWater}>
        <AirContext.Provider value={air}>
          <WaterContext.Provider value={water}>
            <MeteoContext.Provider value={meteo}>{children}</MeteoContext.Provider>
          </WaterContext.Provider>
        </AirContext.Provider>
      </EnableWaterContext.Provider>
    </EnableAirContext.Provider>
  );
}

function useRequiredContext<T>(context: React.Context<T | null>, hookName: string): T {
  const value = useContext(context);
  if (value === null) {
    throw new Error(`${hookName} doit être utilisé à l'intérieur de <DataProvider>`);
  }
  return value;
}

/** Qualité de l'air (indice ATMO par commune) */
export function useAirData(): AirDataValue {
  const enable = useContext(EnableAirContext);
  useEffect(enable, [enable]);
  return useRequiredContext(AirContext, 'useAirData');
}

/** Tours d'eau (planning SMGEAG) */
export function useWaterData(): WaterDataValue {
  const enable = useContext(EnableWaterContext);
  useEffect(enable, [enable]);
  return useRequiredContext(WaterContext, 'useWaterData');
}

/** Météo actuelle et vigilance Météo-France */
export function useMeteoData(): MeteoDataValue {
  return useRequiredContext(MeteoContext, 'useMeteoData');
}
