'use client';

import React from 'react';
import { WeatherIcon } from '@/app/(site)/meteo/components/WeatherIcon';
import type { VigilanceData } from '@/app/(site)/meteo/types';
import { vigilanceColor, vigilanceLabel } from '../lib/palette';
import { formatLongDate, formatTime, temp, windDirection } from '../lib/format';
import type { CommuneRecord } from '../lib/model';
import { territorySummary } from '../lib/model';

type Props = {
  commune: CommuneRecord | null;
  communes: CommuneRecord[];
  vigilance: VigilanceData | null;
  now: Date | null;
  onOpenSheet: () => void;
  onBackHome: () => void;
  onFocusSearch: () => void;
  readoutRef: React.RefObject<HTMLDivElement | null>;
};

function Chip({ color, children }: { color?: string; children: React.ReactNode }) {
  return (
    <span className="chip mono">
      {color && <span className="dot" style={{ background: color }} />}
      {children}
    </span>
  );
}

export function Readout({
  commune,
  communes,
  vigilance,
  now,
  onOpenSheet,
  onBackHome,
  onFocusSearch,
  readoutRef,
}: Props) {
  const stamp = now ? `${formatTime(now)} — ${formatLongDate(now)}` : '';

  if (!commune) {
    const summary = territorySummary(communes);

    return (
      <div className="readout home" ref={readoutRef}>
        <h1 className="readout-title">Guadeloupe</h1>
        <p className="readout-meta mono">
          {communes.length || 32} communes{stamp && ` · ${stamp}`}
        </p>

        <div className="readout-stats">
          <div>
            <div className="readout-stat-value">
              {summary.avgAir ? summary.avgAir.toFixed(1) : '—'}
              <small>/6</small>
            </div>
            <div className="readout-stat-label mono">ATMO moyen</div>
          </div>
          <div>
            <div className="readout-stat-value">
              {temp(summary.avgTemp)}
              <small>°C</small>
            </div>
            <div className="readout-stat-label mono">Température moy.</div>
          </div>
          <div>
            <div className="readout-stat-value">{vigilanceLabel(vigilance?.level ?? null)}</div>
            <div className="readout-stat-label mono">Vigilance 971</div>
          </div>
          <div>
            <div className="readout-stat-value">{summary.communesWithCuts}</div>
            <div className="readout-stat-label mono">Communes en tour d&apos;eau</div>
          </div>
        </div>

        <div className="chips">
          <Chip>Cliquez une commune sur la carte</Chip>
          <Chip color={vigilanceColor(vigilance?.level ?? null)}>
            Vigilance {vigilanceLabel(vigilance?.level ?? null).toLowerCase()}
          </Chip>
          {summary.worstAir[0] && (
            <Chip color={summary.worstAir[0].air.color}>
              Pic ATMO · {summary.worstAir[0].nom}
            </Chip>
          )}
        </div>

        <div className="actions">
          <button type="button" className="btn btn-solid mono" onClick={onFocusSearch}>
            Choisir une commune
          </button>
        </div>
      </div>
    );
  }

  const weather = commune.weather;

  return (
    <div className="readout" ref={readoutRef}>
      <div className="readout-row">
        <div className="readout-temp">
          {temp(weather?.temperature)}
          <sup>°</sup>
        </div>

        <div>
          <h1 className="readout-name">{commune.nom}</h1>
          <p className="readout-meta mono">{stamp}</p>
        </div>

        {weather && (
          <div className="readout-condition">
            <WeatherIcon
              weatherCode={weather.weather_code}
              iconName={weather.weather_icon}
              isDay={weather.is_day ?? true}
              size={30}
              strokeWidth={1.3}
            />
            <span className="mono">{weather.weather_description}</span>
          </div>
        )}
      </div>

      <div className="chips">
        <Chip color={commune.air.color}>
          ATMO {commune.air.index ?? '—'} · {commune.air.label}
        </Chip>
        <Chip color={vigilanceColor(vigilance?.level ?? null)}>
          Vigilance {vigilanceLabel(vigilance?.level ?? null).toLowerCase()}
        </Chip>
        <Chip color={commune.water.color}>{commune.water.label} sur 7 jours</Chip>
        {typeof weather?.wind_speed === 'number' && (
          <Chip>
            Vent {Math.round(weather.wind_speed)} km/h {windDirection(weather.wind_deg)}
          </Chip>
        )}
      </div>

      <div className="actions">
        <button type="button" className="btn btn-solid mono" onClick={onOpenSheet}>
          Ouvrir la fiche commune
        </button>
        <button type="button" className="btn btn-ghost mono" onClick={onBackHome}>
          ← Vue d&apos;ensemble
        </button>
      </div>
    </div>
  );
}
