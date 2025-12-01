'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMeteoData } from '../meteo/hooks/useMeteoData';
import { getVigilanceLevelInfo } from '../meteo/utils';

export const NavbarVigilanceWidget = () => {
  const { vigilanceData, mounted } = useMeteoData();

  const currentVigilanceInfo = useMemo(
    () => getVigilanceLevelInfo(vigilanceData?.level),
    [vigilanceData?.level]
  );

  if (!mounted) return null;

  return (
    <Link
      href="/meteo"
      className="hidden md:flex items-center justify-center p-1 rounded-lg transition-all active:scale-95 mx-2"
      title={`Vigilance Météo : ${currentVigilanceInfo.label}\n${currentVigilanceInfo.description}`}
    >
      <div
        className="w-12 h-12"
        style={{
          maskImage: 'url(/gwadavigilance.svg)',
          WebkitMaskImage: 'url(/gwadavigilance.svg)',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          backgroundColor: currentVigilanceInfo.color,
          transition: 'background-color 0.3s ease',
          filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.5))'
        }}
      />
    </Link>
  );
};
