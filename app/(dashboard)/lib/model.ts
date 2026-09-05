'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import { useAirData, useMeteoData, useWaterData } from '@/app/providers/DataProvider';
import type { AirDataValue } from '@/app/hooks/useAirData';
import type { WaterDataValue } from '@/app/hooks/useWaterData';
import type { MeteoDataValue } from '@/app/data/useMeteoData';
import type { WeatherData, VigilanceData } from '@/app/data/weather-types';
import type { WaterCutData } from '@/app/data/water-types';
import { atmoColor, atmoLabel, waterColor, waterLabel } from './palette';
import { countCutDays, upcomingCuts, type CommuneCut } from './water';

/** Contour officiel d'une commune (source : geo.api.gouv.fr, IGN). */
export type CommuneFeature = Feature<Polygon | MultiPolygon, { code: string; nom: string }>;
export type CommunesGeo = FeatureCollection<Polygon | MultiPolygon, { code: string; nom: string }>;

const GEO_LOCAL = '/geo/communes-971.geojson';
const GEO_REMOTE =
  'https://geo.api.gouv.fr/departements/971/communes?format=geojson&geometry=contour&fields=nom,code,contour';

const SAINT_MARTIN_LOCAL = '/geo/commune-97801.geojson';
const SAINT_MARTIN_REMOTE =
  'https://geo.api.gouv.fr/departements/978/communes?format=geojson&geometry=contour&fields=nom,code,contour';

/**
 * Les quatre îles qui n'apparaissent pas — ou à peine — sur la carte
 * principale : trop petites ou trop loin pour qu'une projection commune les
 * rende lisibles. Reprise de la présentation de gwadair.fr : chacune sur sa
 * propre carte, dans le même ordre, et retirées de la carte principale — pas
 * question de les montrer deux fois.
 */
export type ArchipelagoGroup = { key: string; label: string; codes: string[] };

export const ARCHIPELAGOS: ArchipelagoGroup[] = [
  { key: 'saint-martin', label: 'Saint-Martin', codes: ['97801'] },
  { key: 'saintes', label: 'Les Saintes', codes: ['97130', '97131'] },
  { key: 'marie-galante', label: 'Marie-Galante', codes: ['97108', '97112', '97126'] },
  { key: 'desirade', label: 'La Désirade', codes: ['97110'] },
];

/** Union des codes déjà couverts par le rail des archipels. */
export const ARCHIPELAGO_CODES = new Set(ARCHIPELAGOS.flatMap((group) => group.codes));

/**
 * Les deux lectures de la carte.
 *
 * Ce sont des filtres, pas des pages : la carte, la liste, le classement et le
 * texte d'explication suivent tous la couche choisie. Sans ça, changer d'onglet
 * ne recolorait que les communes et laissait le même texte à l'écran.
 *
 * La météo n'est pas une couche : elle n'a pas de seuil qui vaille la peine
 * d'être cartographié sur trente kilomètres d'île, et elle se lit commune par
 * commune dans la fiche. La vigilance non plus : Météo-France la publie à
 * l'échelle du département, colorier les 32 communes d'une même teinte
 * laisserait croire à une donnée communale.
 */
export type Layer = 'air' | 'water';

export const LAYERS: { id: Layer; label: string; desc: string }[] = [
  { id: 'air', label: "Qualité de l'air", desc: "Indice ATMO et polluants" },
  { id: 'water', label: "Tours d'eau", desc: "Coupures planifiées SMGEAG" },
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

/** Sans accent ni casse \u2014 pour comparer une saisie \u00e0 un nom de commune. */
export function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function toIndex(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 6 ? n : null;
}

/** Charge une copie locale d'abord ; l'API geo.api.gouv.fr sert de repli. */
function useGeoJSON(localUrl: string, remoteUrl: string, notFoundMessage: string) {
  const [geo, setGeo] = useState<CommunesGeo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      for (const url of [localUrl, remoteUrl]) {
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
      if (!cancelled) setError(notFoundMessage);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [localUrl, remoteUrl, notFoundMessage]);

  return { geo, error };
}

/** Charge les contours réels des 32 communes de Guadeloupe (971). */
export function useCommunesGeo() {
  return useGeoJSON(GEO_LOCAL, GEO_REMOTE, 'Contours des communes indisponibles.');
}

/**
 * Charge le contour de Saint-Martin (978) — hors carte principale : sa seule
 * commune vit à 250 km au nord, sur sa propre petite carte dans le rail des
 * archipels.
 */
export function useSaintMartinGeo() {
  return useGeoJSON(
    SAINT_MARTIN_LOCAL,
    SAINT_MARTIN_REMOTE,
    'Contour de Saint-Martin indisponible.',
  );
}

function buildCommuneRecord(
  feature: CommuneFeature,
  air: AirDataValue,
  water: WaterDataValue,
  meteo: MeteoDataValue,
): CommuneRecord {
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
}

export type DashboardData = {
  communes: CommuneRecord[];
  byCode: Map<string, CommuneRecord>;
  /**
   * Saint-Martin n'est pas une commune de Guadeloupe (département 978, pas
   * 971) : elle ne compte pas dans les 32 communes ni dans la synthèse du
   * territoire, mais partage la même fiche une fois choisie dans le rail des
   * archipels.
   */
  saintMartin: CommuneRecord | null;
  vigilance: VigilanceData | null;
  loading: boolean;
  error: string | null;
  /** Relance les chargements air/eau (utilisé par le bandeau d'erreur). */
  retry: () => void;
  /** Date de relevé du planning SMGEAG (saisie manuelle). */
  waterSourceDate: Date | null;
  lastUpdate: Date | null;
};

/**
 * Assemble les trois sources (Gwad'Air, Météo-France, SMGEAG) en un
 * enregistrement par commune. Les contours font foi pour la liste et
 * l'orthographe des noms.
 */
export function useDashboardData(
  geo: CommunesGeo | null,
  saintMartinFeature?: CommuneFeature | null,
): DashboardData {
  const air = useAirData();
  const water = useWaterData();
  const meteo = useMeteoData();

  const communes = useMemo<CommuneRecord[]>(() => {
    if (!geo) return [];
    return geo.features
      .map((feature) => buildCommuneRecord(feature, air, water, meteo))
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, air.data, water.data, meteo.weatherData]);

  const byCode = useMemo(() => new Map(communes.map((c) => [c.code, c])), [communes]);

  const saintMartin = useMemo(
    () => (saintMartinFeature ? buildCommuneRecord(saintMartinFeature, air, water, meteo) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saintMartinFeature, air.data, water.data, meteo.weatherData],
  );

  return {
    communes,
    byCode,
    saintMartin,
    vigilance: meteo.vigilanceData,
    loading: air.loading || water.loading || meteo.loading,
    error: air.error?.message ?? water.error?.message ?? null,
    retry: () => {
      air.retry();
      water.retry();
    },
    waterSourceDate: water.sourceDate,
    lastUpdate: air.lastUpdate ?? water.lastUpdate ?? null,
  };
}

/** Couleur portée par une commune dans la couche courante. */
export function layerColor(commune: CommuneRecord, layer: Layer): string {
  return layer === 'air' ? commune.air.color : commune.water.color;
}

/** Libellé accompagnant la pastille — jamais de couleur seule. */
export function layerLabel(commune: CommuneRecord, layer: Layer): string {
  return layer === 'air' ? commune.air.label : commune.water.label;
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
  const measuredAir = communes.filter((c) => c.air.index !== null);

  // Quatre communes ex æquo ne forment pas un classement. Tant que tout le
  // territoire partage le même indice, on annonce l'état plutôt qu'un palmarès.
  const airUniform = indices.length > 0 && new Set(indices).size === 1;
  const airUniformLabel = airUniform ? atmoLabel(indices[0]) : null;
  const airUniformColor = airUniform ? atmoColor(indices[0]) : null;

  const worstAir = airUniform
    ? []
    : [...measuredAir].sort((a, b) => (b.air.index ?? 0) - (a.air.index ?? 0)).slice(0, 4);

  const mostCut = [...communes]
    .filter((c) => c.water.cutDays > 0)
    .sort((a, b) => b.water.cutDays - a.water.cutDays || a.nom.localeCompare(b.nom, 'fr'))
    .slice(0, 4);

  const communesWithCuts = communes.filter((c) => c.water.cutDays > 0).length;

  return {
    avgAir,
    avgTemp,
    worstAir,
    airUniform,
    airUniformLabel,
    airUniformColor,
    mostCut,
    communesWithCuts,
    measured: indices.length,
  };
}
