'use client';

import React from 'react';
import { geoArea, geoMercator, geoPath } from 'd3-geo';
import {
  layerColor,
  layerLabel,
  type ArchipelagoGroup,
  type CommuneFeature,
  type CommuneRecord,
  type Layer,
} from '../lib/model';
import { NO_DATA } from '../lib/palette';

export type ArchipelagoData = ArchipelagoGroup & { features: CommuneFeature[] };

/**
 * La Désirade est une commune MultiPolygon : elle inclut les îlets de
 * Petite-Terre, à 10 km au large. Sur la mini-carte, les garder gonflerait
 * l'étendue projetée et réduirait l'île principale à un filet — on ne garde
 * donc que le plus grand polygone.
 */
function mainPolygon(feature: CommuneFeature): CommuneFeature {
  if (feature.geometry.type !== 'MultiPolygon') return feature;
  const largest = feature.geometry.coordinates.reduce((best, coords) => {
    const area = Math.abs(geoArea({ type: 'Polygon', coordinates: coords }));
    return area > best.area ? { coords, area } : best;
  }, { coords: feature.geometry.coordinates[0], area: 0 });
  return {
    ...feature,
    geometry: { type: 'Polygon', coordinates: largest.coords },
  };
}

type Props = {
  groups: ArchipelagoData[];
  byCode: Map<string, CommuneRecord>;
  layer: Layer;
  selected: string | null;
  hovered: string | null;
  onHover: (code: string | null) => void;
  onSelect: (code: string) => void;
  /** `null` = pas de limite (mobile, où le rail devient une rangée). */
  maxHeight?: number | null;
};

/** Boîte de dessin interne à chaque carte, en coordonnées SVG. */
const VIEW_W = 100;
const VIEW_H = 46;
const PAD = 4;

function ArchipelagoCard({
  group,
  byCode,
  layer,
  selected,
  hovered,
  onHover,
  onSelect,
}: {
  group: ArchipelagoData;
} & Omit<Props, 'groups' | 'maxHeight'>) {
  const shapes = React.useMemo(() => {
    const features = group.features.map(mainPolygon);
    const collection = { type: 'FeatureCollection' as const, features };
    const projection = geoMercator().fitExtent(
      [
        [PAD, PAD],
        [VIEW_W - PAD, VIEW_H - PAD],
      ],
      collection,
    );
    const path = geoPath(projection);
    return features.map((feature) => ({
      code: feature.properties.code,
      nom: feature.properties.nom,
      d: path(feature) ?? '',
    }));
  }, [group.features]);

  return (
    <div className="archipelago-card">
      <span className="archipelago-card-label mono">{group.label}</span>
      <svg
        className="archipelago-card-map"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={`Carte de ${group.label}`}
      >
        {shapes.map((shape) => {
          const commune = byCode.get(shape.code);
          const state = shape.code === selected ? ' is-selected' : '';
          const highlight = shape.code === hovered ? ' is-hovered' : '';
          // Voir MapStage : `fill` en `style` pour que `var(--no-data)` soit
          // substituée, et contour tireté quand la mesure manque.
          const fill = commune ? layerColor(commune, layer) : NO_DATA;
          const missing = fill === NO_DATA ? ' is-no-data' : '';
          return (
            <path
              key={shape.code}
              className={`commune-path${state}${highlight}${missing}`}
              d={shape.d}
              style={{ fill }}
              tabIndex={0}
              role="button"
              aria-label={
                commune
                  ? `${shape.nom} — ${layerLabel(commune, layer)}. Entrée pour voir la fiche.`
                  : `${shape.nom}. Entrée pour voir la fiche.`
              }
              aria-pressed={shape.code === selected}
              onMouseEnter={() => onHover(shape.code)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(shape.code)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(shape.code)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(shape.code);
                }
              }}
            >
              <title>
                {shape.nom}
                {commune ? ` — ${layerLabel(commune, layer)}` : ''}
              </title>
            </path>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Les Saintes, Marie-Galante, La Désirade et Saint-Martin sur leur propre
 * petite carte plutôt qu'un point sur la carte principale — reprise de la
 * présentation de gwadair.fr, qui affiche l'archipel entier de cette façon.
 * Aucune projection commune ne peut à la fois montrer la Guadeloupe en
 * grand et rendre ces îles cliquables : Saint-Martin est à 250 km au nord.
 */
export function ArchipelagoRail({
  groups,
  byCode,
  layer,
  selected,
  hovered,
  onHover,
  onSelect,
  maxHeight,
}: Props) {
  if (groups.length === 0) return null;

  return (
    <div
      className={`archipelago-rail${maxHeight != null ? ' scroll-thin' : ''}`}
      style={maxHeight != null ? { maxHeight, overflowY: 'auto' } : undefined}
    >
      {groups.map((group) => (
        <ArchipelagoCard
          key={group.key}
          group={group}
          byCode={byCode}
          layer={layer}
          selected={selected}
          hovered={hovered}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
