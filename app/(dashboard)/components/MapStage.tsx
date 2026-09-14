'use client';

import React from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { layerColor, layerLabel, type CommuneRecord, type CommunesGeo, type Layer } from '../lib/model';
import { NO_DATA } from '../lib/palette';

type Props = {
  geo: CommunesGeo | null;
  geoError: string | null;
  byCode: Map<string, CommuneRecord>;
  layer: Layer;
  selected: string | null;
  /** Commune survolée, ici ou dans la liste : la mise en évidence est partagée. */
  hovered: string | null;
  onHover: (code: string | null) => void;
  onSelect: (code: string) => void;
  /** Clic sur la mer ou le fond : la sélection tombe. */
  onClear: () => void;
};

type Shape = { code: string; nom: string; d: string };

const RESIZE_DEBOUNCE_MS = 180;
/** Seuil du repli mobile — identique à la bascule CSS. Partagé avec DashboardClient. */
export const COMPACT_WIDTH = 1100;

/**
 * Marges de la projection, en fraction du conteneur.
 *
 * Elles sont fixes, et c'est tout l'intérêt : la carte se cadre pareil qu'une
 * commune soit choisie ou non, quelle que soit la couche affichée. Auparavant
 * l'étendue était mesurée sur les blocs posés par-dessus (readout, légende,
 * bandeau) — ils changeaient de taille à chaque clic et la carte sautait d'une
 * sélection à l'autre.
 *
 * Le bord gauche laisse la colonne du rail des archipels, le bord haut
 * l'en-tête, le bord bas la légende. En repli, ces blocs passent hors de la
 * carte : elle reprend toute la place.
 */
const INSETS = { top: 0.1, right: 0.97, bottom: 0.87, left: 0.17 };
const COMPACT_INSETS = { top: 0.04, right: 0.97, bottom: 0.97, left: 0.03 };

export function MapStage({
  geo,
  geoError,
  byCode,
  layer,
  selected,
  hovered,
  onHover,
  onSelect,
  onClear,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState<{ w: number; h: number; viewport: number } | null>(null);
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; code: string } | null>(null);
  const tooltipFrameRef = React.useRef<number | null>(null);

  // Un seul rAF en vol : une souris rapide n'en accumule plus plusieurs qui
  // finiraient tous par déclencher setTooltip coup sur coup.
  React.useEffect(() => {
    return () => {
      if (tooltipFrameRef.current !== null) cancelAnimationFrame(tooltipFrameRef.current);
    };
  }, []);

  // Le redimensionnement est amorti : reprojeter 32 communes à chaque pixel
  // de largeur ne sert à rien.
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      // Un conteneur momentanément replié (transition CSS, onglet caché) ne
      // doit pas effacer la carte : la mesure est ignorée, la dernière taille
      // valable reste en place.
      if (rect.width === 0 || rect.height === 0) return;
      // `viewport` sert à détecter le repli mobile : la largeur du stage seule
      // ne suffit pas, le panneau lui prend déjà 420 px en mode bureau.
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

  /*
   * La projection ne dépend que du contour et de la taille du conteneur : ni la
   * sélection ni la couche n'entrent ici, donc la carte ne bouge plus.
   *
   * Calculée au rendu plutôt que posée dans un état par un effet : c'est une
   * fonction pure de ses deux entrées, et la version en effet reprojetait dans
   * un second rendu — une carte vide était peinte entre les deux.
   */
  const shapes = React.useMemo<Shape[]>(() => {
    if (!geo || !size) return [];

    const inset = size.viewport < COMPACT_WIDTH ? COMPACT_INSETS : INSETS;
    const left = size.w * inset.left;
    const right = size.w * inset.right;
    const top = size.h * inset.top;
    const bottom = size.h * inset.bottom;

    const path = geoPath(
      geoMercator().fitExtent(
        [
          [left, top],
          [right, bottom],
        ],
        geo,
      ),
    );

    return geo.features.map((feature) => ({
      code: feature.properties.code,
      nom: feature.properties.nom,
      d: path(feature) ?? '',
    }));
  }, [geo, size]);

  const tooltipCommune = tooltip ? byCode.get(tooltip.code) : null;

  const handleMove = (event: React.MouseEvent<SVGPathElement>, code: string) => {
    const base = containerRef.current?.getBoundingClientRect();
    if (!base) return;
    // Évite un setState par pixel de souris : le tooltip suit en rAF.
    const x = event.clientX - base.left;
    const y = event.clientY - base.top;
    if (tooltipFrameRef.current !== null) cancelAnimationFrame(tooltipFrameRef.current);
    tooltipFrameRef.current = requestAnimationFrame(() => {
      tooltipFrameRef.current = null;
      setTooltip({ x, y, code });
    });
  };

  const leave = () => {
    setTooltip(null);
    onHover(null);
  };

  const activate = (code: string) => (event: React.KeyboardEvent<SVGPathElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(code);
    }
  };

  return (
    <div ref={containerRef} className="map-holder">
      {geoError && (
        <p className="map-error" role="alert">
          {geoError}
        </p>
      )}

      {!geo && !geoError && (
        <div className="map-loading" role="status">
          <span className="map-loading-orb" aria-hidden="true" />
          <span className="mono">Chargement des contours…</span>
        </div>
      )}

      <svg
        className="map-svg"
        viewBox={size ? `0 0 ${size.w} ${size.h}` : undefined}
        role="img"
        aria-label={`Carte de la Guadeloupe continentale — ${shapes.length} communes`}
      >
        {/*
          Fond cliquable, posé sous les communes : cliquer la mer désélectionne.
          Un `<rect>` plutôt qu'un gestionnaire sur le conteneur — le SVG ne
          délivre l'événement qu'à la forme du dessus, donc un clic sur une
          commune ne l'atteint jamais et n'a rien à stopper.
        */}
        <rect
          className="map-backdrop"
          width="100%"
          height="100%"
          onClick={onClear}
          aria-hidden="true"
          focusable="false"
        />

        {shapes.map((shape) => {
          const commune = byCode.get(shape.code);
          const state = shape.code === selected ? ' is-selected' : '';
          const highlight = shape.code === hovered ? ' is-hovered' : '';
          /*
           * Le remplissage passe par `style` et non par l'attribut `fill` :
           * `NO_DATA` vaut désormais `var(--no-data)`, et les attributs de
           * présentation SVG ne substituent pas les variables CSS. Une commune
           * sans mesure prend en outre le contour tireté de `.is-no-data` —
           * aucun aplat ne tient 3:1 contre la scène *et* contre les
           * remplissages ATMO de ses voisines.
           */
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
              onMouseMove={(event) => handleMove(event, shape.code)}
              onMouseEnter={() => onHover(shape.code)}
              onMouseLeave={leave}
              onFocus={() => onHover(shape.code)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(shape.code)}
              onKeyDown={activate(shape.code)}
            >
              {/* Les noms ne sont plus écrits sur la carte : à trente-deux
                  étiquettes, elle devenait un pavé de texte. Ils restent
                  accessibles au survol et dans la liste. */}
              <title>
                {shape.nom}
                {commune ? ` — ${layerLabel(commune, layer)}` : ''}
              </title>
            </path>
          );
        })}
      </svg>

      {/* Infobulle purement visuelle : aucun `aria-describedby` ne la
          référence, et le `<title>` du tracé porte déjà l'information au
          clavier et aux lecteurs d'écran. `role="tooltip"` n'y ajoutait rien. */}
      {tooltip && tooltipCommune && (
        <div className="map-tooltip" style={{ left: tooltip.x, top: tooltip.y }} aria-hidden="true">
          <strong>{tooltipCommune.nom}</strong>
          <span className="mono">{layerLabel(tooltipCommune, layer)}</span>
        </div>
      )}
    </div>
  );
}
