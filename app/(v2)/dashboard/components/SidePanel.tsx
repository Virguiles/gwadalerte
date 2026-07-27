'use client';

import React from 'react';
import type { VigilanceData } from '@/app/(site)/meteo/types';
import { atmoColor, atmoLabel, vigilanceLabel } from '../lib/palette';
import { num, temp, windDirection } from '../lib/format';
import {
  modeColor,
  modeLabel,
  territorySummary,
  type CommuneRecord,
  type Mode,
} from '../lib/model';
import { shortSector } from '../lib/water';

type Props = {
  communes: CommuneRecord[];
  selected: CommuneRecord | null;
  mode: Mode;
  vigilance: VigilanceData | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (code: string) => void;
  onOpenSheet: (code: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
};

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function Pair({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pair">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Barre d'un sous-indice ATMO, sur l'échelle 1–6 publiée par Gwad'Air. */
function PollutantBar({ label, index }: { label: string; index: number | null }) {
  return (
    <div className="bar-row">
      <div className="bar-head">
        <span className="label">{label}</span>
        <span className="value mono">{index ? `${index}/6 · ${atmoLabel(index)}` : 'Non mesuré'}</span>
      </div>
      <div className="bar-track">
        <div
          className="bar-fill"
          style={{ width: `${((index ?? 0) / 6) * 100}%`, background: atmoColor(index) }}
        />
      </div>
    </div>
  );
}

export function SidePanel({
  communes,
  selected,
  mode,
  vigilance,
  query,
  onQueryChange,
  onSelect,
  onOpenSheet,
  searchRef,
}: Props) {
  const filtered = React.useMemo(() => {
    const needle = normalize(query.trim());
    return needle ? communes.filter((c) => c.search.includes(needle)) : communes;
  }, [communes, query]);

  const summary = React.useMemo(() => territorySummary(communes), [communes]);

  return (
    <aside className="panel">
      <div className="search">
        <input
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

      <div className="commune-list scroll-thin" role="listbox" aria-label="Communes de Guadeloupe">
        {filtered.length === 0 && <p className="list-empty">Aucune commune ne correspond.</p>}
        {filtered.map((commune) => (
          <button
            key={commune.code}
            type="button"
            role="option"
            aria-selected={commune.code === selected?.code}
            className="commune-row"
            onClick={() => onSelect(commune.code)}
          >
            <span className="name">{commune.nom}</span>
            <span className="value mono">
              {temp(commune.weather?.temperature)}° · {modeLabel(commune, mode, vigilance)}
            </span>
            <span className="dot" style={{ background: modeColor(commune, mode, vigilance) }} />
          </button>
        ))}
      </div>

      <div className="panel-detail scroll-thin">
        {selected ? (
          <>
            <section className="section">
              <h2 className="section-title">Météo</h2>
              <dl>
                <Pair label="Température">{temp(selected.weather?.temperature)} °C</Pair>
                <Pair label="Ressenti">{temp(selected.weather?.feels_like)} °C</Pair>
                <Pair label="Conditions">{selected.weather?.weather_description ?? '—'}</Pair>
                <Pair label="Humidité">{num(selected.weather?.humidity, ' %')}</Pair>
                <Pair label="Vent">
                  {num(selected.weather?.wind_speed, ' km/h')} {windDirection(selected.weather?.wind_deg)}
                </Pair>
                <Pair label="Rafales">{num(selected.weather?.wind_gust, ' km/h')}</Pair>
                <Pair label="Indice UV">{num(selected.weather?.uv_index, '', 1)}</Pair>
              </dl>
            </section>

            <section className="section">
              <h2 className="section-title">Qualité de l&apos;air</h2>
              {selected.air.pollutants.map((pollutant) => (
                <PollutantBar key={pollutant.key} label={pollutant.label} index={pollutant.index} />
              ))}
            </section>

            <section className="section">
              <h2 className="section-title">Réseau d&apos;eau</h2>
              <dl>
                <Pair label="Jours de coupure (7 j)">{selected.water.label}</Pair>
                <Pair label="Secteurs au planning">{selected.water.raw?.details.length ?? 0}</Pair>
              </dl>
              <button type="button" className="link-btn mono" onClick={() => onOpenSheet(selected.code)}>
                Fiche complète →
              </button>
            </section>
          </>
        ) : (
          <>
            <section className="section">
              <h2 className="section-title">Synthèse du territoire</h2>
              <dl>
                <Pair label="ATMO moyen">
                  {summary.avgAir ? `${summary.avgAir.toFixed(1)} / 6` : '—'}
                </Pair>
                <Pair label="Communes mesurées">{summary.measured} / {communes.length}</Pair>
                <Pair label="Vigilance (971)">{vigilanceLabel(vigilance?.level ?? null)}</Pair>
                <Pair label="Communes en tour d'eau">{summary.communesWithCuts}</Pair>
              </dl>
            </section>

            <section className="section">
              <h2 className="section-title">Air le plus dégradé</h2>
              {summary.worstAir.length === 0 && (
                <p className="empty-note">Aucune mesure disponible pour l&apos;instant.</p>
              )}
              {summary.worstAir.map((commune) => (
                <button
                  key={commune.code}
                  type="button"
                  className="rank-row"
                  onClick={() => onOpenSheet(commune.code)}
                >
                  <span className="dot" style={{ background: commune.air.color }} />
                  <span className="name">{commune.nom}</span>
                  <span className="value mono">
                    {commune.air.index} · {commune.air.label}
                  </span>
                </button>
              ))}
            </section>

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
                  onClick={() => onOpenSheet(commune.code)}
                >
                  <span className="dot" style={{ background: commune.water.color }} />
                  <span className="name">{commune.nom}</span>
                  <span className="value mono">
                    {commune.water.raw?.details[0]
                      ? shortSector(commune.water.raw.details[0].secteur)
                      : commune.water.label}
                  </span>
                </button>
              ))}
            </section>
          </>
        )}
      </div>
    </aside>
  );
}
