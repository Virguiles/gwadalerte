'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { useAirData, useMeteoData, useWaterData } from '@/app/providers/DataProvider';
import type { WeatherData, VigilanceData } from '@/app/(site)/meteo/types';
import type { WaterCutData } from '@/app/(site)/tours-deau/types';
import { atmoColor, atmoLabel, vigilanceColor, vigilanceLabel, waterColor, waterLabel } from './palette';
import { countCutDays, upcomingCuts, type CommuneCut } from './water';

/** Contour officiel d'une commune (source : geo.api.gouv.fr, IGN). */
export type CommuneFeature = Feature<Polygon | MultiPolygon, { code: string; nom: string }>;
export type CommunesGeo = FeatureCollection<Polygon | MultiPolygon, { code: string; nom: string }>;

const GEO_LOCAL = '/geo/communes-971.geojson';
const GEO_REMOTE =
  'https://geo.api.gouv.fr/departements/971/communes?format=geojson&geometry=contour&fields=nom,code,contour';

/** Les trois lectures possibles de la carte. */
export type Mode = 'air' | 'vigilance' | 'water';

export const MODES: { id: Mode; label: string }[] = [
  { id: 'air', label: "Qualité de l'air" },
  { id: 'vigilance', label: 'Vigilance' },
  { id: 'water', label: "Tours d'eau" },
];

/** Sous-indices ATMO publiés par Gwad'Air, sur la même échelle 1–6 que l'indice global. */
export const POLLUTANTS = [
  { key: 'code_pm10', label: 'PM10' },
  { key: 'code_pm25', label: 'PM2.5' },
  { key: 'code_no2', label: 'NO₂' },
  { key: 'code_o3', label: 'O₃' },
  { key: 'code_so2', label: 'SO₂' },
] as const;

export type Pollutant = { key: string; label: string; index: number | null };

export type CommuneRecord = {
  code: string;
  nom: string;
  /** Nom sans accent ni casse, pour la recherche. */
  search: string;
  air: {
    index: number | null;
    label: string;
    color: string;
    pollutants: Pollutant[];
  };
  weather: WeatherData | undefined;
  water: {
    raw: WaterCutData | undefined;
    cuts: CommuneCut[];
    /** Nombre de jours touchés sur les sept prochains. */
    cutDays: number;
    color: string;
    label: string;
  };
};

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function toIndex(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 6 ? n : null;
}

/**
 * Charge les contours réels des 32 communes.
 * La copie locale évite un aller-retour réseau au premier rendu ; l'API
 * geo.api.gouv.fr sert de repli si le fichier venait à manquer.
 */
export function useCommunesGeo() {
  const [geo, setGeo] = useState<CommunesGeo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      for (const url of [GEO_LOCAL, GEO_REMOTE]) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          const data = (await response.json()) as CommunesGeo;
          if (!data.features?.length) continue;
          if (!cancelled) setGeo(data);
          return;
        } catch {
          // On tente la source suivante.
        }
      }
      if (!cancelled) setError('Contours des communes indisponibles.');
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { geo, error };
}

export type DashboardData = {
  communes: CommuneRecord[];
  byCode: Map<string, CommuneRecord>;
  vigilance: VigilanceData | null;
  loading: boolean;
  error: string | null;
  /** Date de relevé du planning SMGEAG (saisie manuelle). */
  waterSourceDate: Date | null;
  lastUpdate: Date | null;
};

/**
 * Assemble les trois sources (Gwad'Air, Météo-France, SMGEAG) en un
 * enregistrement par commune. Les contours font foi pour la liste et
 * l'orthographe des noms.
 */
export function useDashboardData(geo: CommunesGeo | null): DashboardData {
  const air = useAirData();
  const water = useWaterData();
  const meteo = useMeteoData();

  const communes = useMemo<CommuneRecord[]>(() => {
    if (!geo) return [];

    return geo.features
      .map((feature) => {
        const { code, nom } = feature.properties;
        const airRow = air.data?.[code];
        const index = toIndex(airRow?.code_qual);
        const waterRow = water.data?.[code];
        const cuts = upcomingCuts(waterRow);
        const cutDays = countCutDays(waterRow);

        return {
          code,
          nom,
          search: normalize(nom),
          air: {
            index,
            label: atmoLabel(index),
            color: atmoColor(index),
            pollutants: POLLUTANTS.map((p) => ({
              key: p.key,
              label: p.label,
              index: toIndex(airRow?.[p.key]),
            })),
          },
          weather: meteo.weatherData?.[code],
          water: {
            raw: waterRow,
            cuts,
            cutDays,
            color: waterColor(cutDays),
            label: waterLabel(cutDays),
          },
        };
      })
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  }, [geo, air.data, water.data, meteo.weatherData]);

  const byCode = useMemo(() => new Map(communes.map((c) => [c.code, c])), [communes]);

  return {
    communes,
    byCode,
    vigilance: meteo.vigilanceData,
    loading: air.loading || water.loading || meteo.loading,
    error: air.error?.message ?? water.error?.message ?? null,
    waterSourceDate: water.sourceDate,
    lastUpdate: air.lastUpdate ?? water.lastUpdate ?? null,
  };
}

/** Couleur portée par une commune dans le mode courant. */
export function modeColor(commune: CommuneRecord, mode: Mode, vigilance: VigilanceData | null): string {
  if (mode === 'air') return commune.air.color;
  if (mode === 'water') return commune.water.color;
  return vigilanceColor(vigilance?.level ?? null);
}

/** Libellé accompagnant la pastille — jamais de couleur seule. */
export function modeLabel(commune: CommuneRecord, mode: Mode, vigilance: VigilanceData | null): string {
  if (mode === 'air') return commune.air.label;
  if (mode === 'water') return commune.water.label;
  return `Vigilance ${vigilanceLabel(vigilance?.level ?? null).toLowerCase()}`;
}

/** Synthèse territoriale affichée sur la vue d'ensemble. */
export function territorySummary(communes: CommuneRecord[]) {
  const indices = communes.map((c) => c.air.index).filter((i): i is number => i !== null);
  const temperatures = communes
    .map((c) => c.weather?.temperature)
    .filter((t): t is number => typeof t === 'number');

  const avgAir = indices.length ? indices.reduce((a, b) => a + b, 0) / indices.length : null;
  const avgTemp = temperatures.length
    ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length
    : null;

  const worstAir = [...communes]
    .filter((c) => c.air.index !== null)
    .sort((a, b) => (b.air.index ?? 0) - (a.air.index ?? 0))
    .slice(0, 4);

  const mostCut = [...communes]
    .filter((c) => c.water.cutDays > 0)
    .sort((a, b) => b.water.cutDays - a.water.cutDays || a.nom.localeCompare(b.nom, 'fr'))
    .slice(0, 4);

  const communesWithCuts = communes.filter((c) => c.water.cutDays > 0).length;

  return { avgAir, avgTemp, worstAir, mostCut, communesWithCuts, measured: indices.length };
}
