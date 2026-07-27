'use client';

import React from 'react';
import { geoArea, geoMercator, geoPath } from 'd3-geo';
import type { VigilanceData } from '@/app/(site)/meteo/types';
import {
  modeColor,
  modeLabel,
  type CommuneRecord,
  type CommunesGeo,
  type Mode,
} from '../lib/model';

type Props = {
  geo: CommunesGeo | null;
  geoError: string | null;
  byCode: Map<string, CommuneRecord>;
  mode: Mode;
  vigilance: VigilanceData | null;
  selected: string | null;
  onSelect: (code: string) => void;
  /** Vrai en vue d'ensemble : la carte se recadre à droite du readout. */
  home: boolean;
  /** Éléments à ne jamais recouvrir. */
  readoutRef: React.RefObject<HTMLDivElement | null>;
  controlsRef: React.RefObject<HTMLDivElement | null>;
};

type Shape = {
  code: string;
  nom: string;
  d: string;
  /** Centroïde projeté, seulement pour les communes assez grandes. */
  label: [number, number] | null;
};

type Hover = { x: number; y: number; code: string };

const RESIZE_DEBOUNCE_MS = 180;
/** En deçà de cette surface sphérique, l'étiquette ne tient pas. */
const MIN_LABEL_AREA = 1.7e-6;
/** Seuil du repli mobile — identique à la bascule CSS. */
const COMPACT_WIDTH = 1320;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function MapStage({
  geo,
  geoError,
  byCode,
  mode,
  vigilance,
  selected,
  onSelect,
  home,
  readoutRef,
  controlsRef,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState<{ w: number; h: number; viewport: number } | null>(null);
  const [shapes, setShapes] = React.useState<Shape[]>([]);
  const [hover, setHover] = React.useState<Hover | null>(null);

  // Le redimensionnement est amorti : reprojeter 32 communes à chaque pixel
  // de largeur ne sert à rien.
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      // `viewport` sert à détecter le repli mobile : la largeur du stage seule
      // ne suffit pas, le panneau lui prend déjà 460 px en mode bureau.
      setSize({ w: rect.width, h: rect.height, viewport: window.innerWidth });
    };

    measure();
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(measure, RESIZE_DEBOUNCE_MS);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(node);
    window.addEventListener('resize', schedule);

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, []);

  // Projection : la bande de cadrage laisse libres la légende (en haut) et le
  // bloc de lecture (en bas à gauche), pour que la carte ne passe jamais
  // derrière le texte.
  React.useEffect(() => {
    const node = containerRef.current;
    if (!geo || !size || size.w === 0 || size.h === 0 || !node) return;

    const base = node.getBoundingClientRect();
    const relative = (el: Element | null) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { right: rect.right - base.left, bottom: rect.bottom - base.top };
    };

    const controls = relative(controlsRef.current);
    const readout = relative(readoutRef.current);

    const top = Math.max(size.h * 0.06, (controls?.bottom ?? 0) + 22);
    const right = size.w * 0.98;

    // Sous 1320 px, le readout passe sous la carte plutôt qu'à sa gauche :
    // la bande occupe alors toute la largeur, jusqu'au haut du readout.
    const compact = size.viewport < COMPACT_WIDTH;
    const left = compact
      ? size.w * 0.04
      : home
        ? clamp((readout?.right ?? size.w * 0.4) + 56, size.w * 0.44, size.w * 0.62)
        : size.w * 0.2;
    const bottom = compact
      ? size.h - 20
      : home
        ? size.h - 40
        : size.h * 0.6;

    if (right <= left || bottom <= top) return;

    const projection = geoMercator().fitExtent(
      [
        [left, top],
        [right, bottom],
      ],
      geo,
    );
    const path = geoPath(projection);

    setShapes(
      geo.features.map((feature) => ({
        code: feature.properties.code,
        nom: feature.properties.nom,
        d: path(feature) ?? '',
        label: geoArea(feature) > MIN_LABEL_AREA ? path.centroid(feature) : null,
      })),
    );
  }, [geo, size, home, readoutRef, controlsRef]);

  const hovered = hover ? byCode.get(hover.code) : null;

  const handleMove = (event: React.MouseEvent<SVGPathElement>, code: string) => {
    const base = containerRef.current?.getBoundingClientRect();
    if (!base) return;
    setHover({ x: event.clientX - base.left, y: event.clientY - base.top, code });
  };

  return (
    <div ref={containerRef} className="map-holder">
      {geoError && <p className="map-error">{geoError}</p>}

      <svg
        className="map-svg"
        viewBox={size ? `0 0 ${size.w} ${size.h}` : undefined}
        role="img"
        aria-label="Carte des 32 communes de Guadeloupe"
      >
        <g>
          {shapes.map((shape) => {
            const commune = byCode.get(shape.code);
            return (
              <path
                key={shape.code}
                className={`commune-path${shape.code === selected ? ' is-selected' : ''}`}
                d={shape.d}
                fill={commune ? modeColor(commune, mode, vigilance) : 'rgba(241,245,244,.12)'}
                onMouseMove={(event) => handleMove(event, shape.code)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(shape.code)}
              >
                <title>
                  {shape.nom}
                  {commune ? ` — ${modeLabel(commune, mode, vigilance)}` : ''}
                </title>
              </path>
            );
          })}
        </g>
        <g>
          {shapes.map((shape) =>
            shape.label ? (
              <text
                key={`label-${shape.code}`}
                className="commune-label"
                x={shape.label[0]}
                y={shape.label[1]}
                textAnchor="middle"
              >
                {shape.nom}
              </text>
            ) : null,
          )}
        </g>
      </svg>

      {hover && hovered && (
        <div className="map-tooltip" style={{ left: hover.x, top: hover.y }}>
          <strong>{hovered.nom}</strong>
          <span className="mono">{modeLabel(hovered, mode, vigilance)}</span>
        </div>
      )}
    </div>
  );
}
