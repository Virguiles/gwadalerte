'use client';

import React from 'react';
import { LAYER_NOTES } from '../lib/glossary';
import {
  LAYERS,
  layerColor,
  layerLabel,
  normalize,
  territorySummary,
  type CommuneRecord,
  type Layer,
} from '../lib/model';
import { sectorSummary } from '../lib/water';
import { ATMO_COLORS, ATMO_LABELS, waterColor, waterStatusColor, waterStatusLabel } from '../lib/palette';
import { CommuneDetail } from './CommuneDetail';
import { HelpButton } from '@/app/components/HelpButton';

type Props = {
  communes: CommuneRecord[];
  selected: CommuneRecord | null;
  layer: Layer;
  query: string;
  /**
   * Décidé par DashboardClient, qui bascule au même moment son `h1` en `p`.
   * Calculé des deux côtés, il divergeait : commune choisie *et* recherche en
   * cours, la page se retrouvait sans aucun titre de niveau 1.
   */
  showDetail: boolean;
  loading: boolean;
  now: Date | null;
  hovered: string | null;
  onHover: (code: string | null) => void;
  onLayerChange: (layer: Layer) => void;
  onQueryChange: (value: string) => void;
  onSelect: (code: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  detailRef: React.RefObject<HTMLDivElement | null>;
};

const SKELETON_ROWS = 8;

export function SidePanel({
  communes,
  selected,
  layer,
  query,
  showDetail,
  loading,
  now,
  hovered,
  onHover,
  onLayerChange,
  onQueryChange,
  onSelect,
  searchRef,
  detailRef,
}: Props) {
  const filtered = React.useMemo(() => {
    const needle = normalize(query.trim());
    return needle ? communes.filter((c) => c.search.includes(needle)) : communes;
  }, [communes, query]);

  const summary = React.useMemo(() => territorySummary(communes), [communes]);

  const searching = query.trim().length > 0;
  const note = LAYER_NOTES[layer];
  /* La légende accompagne toujours la couleur d'un libellé — jamais de
     couleur seule. Elle suit la couche et vit dans le panneau, en flux
     normal : posée sur la carte, elle recouvrait les chiffres du readout
     dès que la fenêtre faisait moins de ~1460 px. */
  const legend =
    layer === 'air'
      ? ATMO_COLORS.slice(1).map((color, position) => ({
          color,
          label: ATMO_LABELS[position + 1],
        }))
      : [
          { color: waterStatusColor('ongoing'), label: waterStatusLabel('ongoing') },
          { color: waterStatusColor('upcoming'), label: waterStatusLabel('upcoming') },
          { color: waterColor(0), label: 'Aucune coupure aujourd’hui' },
          { color: waterColor(1), label: '1 jour sur 7' },
          { color: waterColor(2), label: '2 jours et plus sur 7' },
        ];

  return (
    <aside className="panel" ref={detailRef} tabIndex={-1} aria-label="Panneau des communes">
      <div className="search">
        <input
          id="commune-search"
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Rechercher une commune"
          aria-label="Rechercher une commune"
        />
        <div className="search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.6-3.6" />
          </svg>
        </div>
      </div>

      {/*
        Le filtre commande la carte, la liste, le classement et le texte
        d'explication à la fois. C'est ce qui en fait un filtre et non trois
        onglets interchangeables : sans ça, en changer ne recolorait que les
        communes et laissait le même texte à l'écran.
      */}
      <div className="panel-guide">
        <span className="panel-guide-label">Guide du tableau de bord</span>
        <HelpButton title="Comment utiliser Gwad'Alerte">
          <p>Le site affiche deux données : la qualité de l&apos;air (indice ATMO) et les coupures d&apos;eau (Orisk).</p>
          <p>Cliquez une commune sur la carte, ou cherchez son nom. Utilisez la touche <kbd>/</kbd> pour chercher, <kbd>Échap</kbd> pour revenir.</p>
        </HelpButton>
      </div>

      {/*
        Deux boutons à bascule, et non un `tablist` : il n'y a pas de
        `tabpanel` en face, donc l'annonce « onglet 1 sur 2 » désignait un
        panneau introuvable. `aria-pressed` dit exactement ce que fait le
        contrôle — il filtre ce que montrent la carte, la liste et le
        classement.
      */}
      <div className="layer-tabs" role="group" aria-label="Donnée affichée">
        {LAYERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="mono"
            aria-pressed={layer === entry.id}
            aria-label={`${entry.label} — ${entry.desc}`}
            onClick={() => onLayerChange(entry.id)}
            title={entry.desc}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {/* `role="note"` désignait un aparté rédactionnel ; c'est une liste de
          correspondances couleur → libellé. */}
      <ul className="legend" aria-label="Légende des couleurs de la carte">
        {legend.map((entry) => (
          <li key={entry.label} className="legend-item mono">
            <span className="legend-swatch" style={{ background: entry.color }} aria-hidden="true" />
            {entry.label}
          </li>
        ))}
      </ul>

      {showDetail && selected ? (
        <CommuneDetail commune={selected} layer={layer} now={now} />
      ) : (
        <>
          {/* Ce que veut dire la couleur, avant les valeurs qu'elle prend :
              un indice ATMO de 3 ne dit rien à qui n'a pas le barème en tête.
              En tête de panneau et non sous la liste — en repli, les
              trente-deux communes s'y déroulent et l'auraient enterré. */}
          <div className="panel-note">
            <p className="explainer">{note.summary}</p>
            <p className="explainer explainer-source">{note.source}</p>
          </div>

          {/*
            `<ul>`/`<li>` plutôt que `role="list"` posé sur un conteneur de
            `<button>` : les enfants d'une liste ARIA doivent être des
            `listitem`, et la navigation aux flèches qui accompagnait ce rôle
            n'était promise par rien. Les boutons se parcourent à la
            tabulation, comme n'importe quelle liste de commandes — le lien
            d'évitement mène directement à la recherche pour ceux qui ne
            veulent pas la traverser.
          */}
          <div className="commune-list scroll-thin">
            {searching && (
              <p role="status" className="sr-only">
                {filtered.length} commune{filtered.length > 1 ? 's' : ''} trouvée
                {filtered.length > 1 ? 's' : ''}
              </p>
            )}
            {loading && communes.length === 0 && (
              <div role="status" aria-label="Chargement des communes">
                {Array.from({ length: SKELETON_ROWS }, (_, position) => (
                  <div key={position} className="commune-row is-skeleton" aria-hidden="true">
                    <span className="skeleton-bar" style={{ width: `${52 + ((position * 13) % 34)}%` }} />
                    <span className="skeleton-bar skeleton-bar-sm" />
                  </div>
                ))}
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="list-empty" role="status">
                <p style={{ margin: '0 0 12px' }}>Aucune commune ne correspond.</p>
                <button
                  type="button"
                  className="btn-ghost btn"
                  onClick={() => onQueryChange('')}
                >
                  Effacer la recherche
                </button>
              </div>
            )}

            <ul aria-label="Communes de Guadeloupe">
              {filtered.map((commune) => (
                <li key={commune.code}>
                  <button
                    type="button"
                    aria-current={commune.code === selected?.code ? 'true' : undefined}
                    aria-label={`${commune.nom} — ${layerLabel(commune, layer)}`}
                    className={`commune-row${commune.code === hovered ? ' is-hovered' : ''}`}
                    onClick={() => onSelect(commune.code)}
                    onMouseEnter={() => onHover(commune.code)}
                    onMouseLeave={() => onHover(null)}
                  >
                    <span className="name">{commune.nom}</span>
                    <span className="value mono">{layerLabel(commune, layer)}</span>
                    <span
                      className="dot"
                      style={{ background: layerColor(commune, layer) }}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel-detail scroll-thin">
            {layer === 'air' ? (
              <section className="section">
                <h2 className="section-title">
                  {summary.airUniform ? "Qualité de l'air" : 'Air le plus dégradé'}
                </h2>
                {summary.airUniform ? (
                  <p className="uniform-note">
                    <span className="dot" style={{ background: summary.airUniformColor ?? undefined }} />
                    Indice <strong>{summary.airUniformLabel?.toLowerCase()}</strong> sur les{' '}
                    {summary.measured} communes mesurées : aucun écart à signaler aujourd&apos;hui.
                  </p>
                ) : (
                  summary.worstAir.length === 0 && (
                    <p className="empty-note">Aucune mesure disponible pour l&apos;instant.</p>
                  )
                )}
                {summary.worstAir.map((commune) => (
                  <button
                    key={commune.code}
                    type="button"
                    className="rank-row"
                    onClick={() => onSelect(commune.code)}
                    onMouseEnter={() => onHover(commune.code)}
                    onMouseLeave={() => onHover(null)}
                  >
                    <span className="dot" style={{ background: commune.air.color }} />
                    <span className="name">{commune.nom}</span>
                    <span className="value mono">
                      {commune.air.index} · {commune.air.label}
                    </span>
                  </button>
                ))}
              </section>
            ) : (
              <section className="section">
                <h2 className="section-title">Tours d&apos;eau les plus impactés</h2>
                {summary.mostCut.length === 0 && (
                  <p className="empty-note">Aucune coupure planifiée sur les sept prochains jours.</p>
                )}
                {summary.mostCut.map((commune) => (
                  <button
                    key={commune.code}
                    type="button"
                    className="rank-row"
                    onClick={() => onSelect(commune.code)}
                    onMouseEnter={() => onHover(commune.code)}
                    onMouseLeave={() => onHover(null)}
                  >
                    <span className="dot" style={{ background: commune.water.color }} />
                    <span className="name">{commune.nom}</span>
                    <span className="value mono">
                      {(commune.water.raw?.details[0] &&
                        sectorSummary(commune.water.raw.details[0].secteur)) ??
                        commune.water.label}
                    </span>
                  </button>
                ))}
              </section>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
