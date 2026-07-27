'use client';

import React from 'react';
import { WeatherIcon } from '@/app/(site)/meteo/components/WeatherIcon';
import { useCommuneForecast } from '@/app/(site)/meteo/hooks/useMeteoForecast';
import type { VigilanceData } from '@/app/(site)/meteo/types';
import {
  ATMO_ADVICE,
  ATMO_COLORS,
  atmoColor,
  atmoLabel,
  VIGILANCE_ADVICE,
  vigilanceColor,
  vigilanceLabel,
} from '../lib/palette';
import { formatLongDate, formatShortDay, formatTime, num, temp, windDirection } from '../lib/format';
import type { CommuneRecord } from '../lib/model';
import { isFavorable, sectorDetail, shortSector } from '../lib/water';

type Props = {
  commune: CommuneRecord;
  vigilance: VigilanceData | null;
  waterSourceDate: Date | null;
  now: Date | null;
  onClose: () => void;
};

/** Sept jours suffisent à couvrir un cycle complet de tours d'eau. */
const CUT_DAYS = 7;

/** Le planning SMGEAG est relevé à la main : au-delà d'une semaine, il vieillit. */
const FRESH_PLANNING_MS = 8 * 24 * 60 * 60 * 1000;

export function CommuneModal({ commune, vigilance, waterSourceDate, now, onClose }: Props) {
  const sheetRef = React.useRef<HTMLDivElement | null>(null);
  const { forecast } = useCommuneForecast(commune.code);
  const weather = commune.weather;
  const level = vigilance?.level ?? null;
  const index = commune.air.index;

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    sheetRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const planningFresh =
    now !== null &&
    waterSourceDate !== null &&
    now.getTime() - waterSourceDate.getTime() < FRESH_PLANNING_MS;

  const days = forecast?.daily?.slice(0, 5) ?? [];

  return (
    <div
      className="overlay scroll-thin"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Fiche de ${commune.nom}`}
        tabIndex={-1}
      >
        <div className="sheet-head">
          <button type="button" className="sheet-close" onClick={onClose} aria-label="Fermer la fiche">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>

          <div className="sheet-hero">
            <p className="eyebrow mono">Fiche commune</p>
            <h2 className="sheet-title">{commune.nom}</h2>
            <p className="mono" style={{ color: 'var(--mut)' }}>
              {now ? `${formatTime(now)} — ${formatLongDate(now)}` : ''}
            </p>

            <div className="hero-temp">
              <div className="value">
                {temp(weather?.temperature)}
                <sup>°</sup>
              </div>
              {weather && (
                <WeatherIcon
                  weatherCode={weather.weather_code}
                  iconName={weather.weather_icon}
                  isDay={weather.is_day ?? true}
                  size={44}
                  strokeWidth={1.3}
                />
              )}
              <div className="hero-details mono">
                <span>{weather?.weather_description ?? 'Données indisponibles'}</span>
                <span>Ressenti {temp(weather?.feels_like)}°</span>
                <span>
                  Vent {num(weather?.wind_speed, ' km/h')} {windDirection(weather?.wind_deg)}
                </span>
                <span>Humidité {num(weather?.humidity, ' %')}</span>
              </div>
            </div>

            {days.length > 0 && (
              <div className="forecast" style={{ ['--forecast-days' as string]: days.length }}>
                {days.map((day) => (
                  <div key={day.date} className="forecast-day">
                    <span className="day mono">{formatShortDay(new Date(day.date))}</span>
                    <WeatherIcon
                      weatherCode={day.weather_code}
                      iconName={day.weather_icon}
                      isDay
                      size={24}
                      strokeWidth={1.3}
                    />
                    <span className="range mono">
                      <b>{Math.round(day.temp_max)}°</b> / {Math.round(day.temp_min)}°
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sheet-alert">
            <div className="alert-head">
              <span className="alert-dot" style={{ background: vigilanceColor(level) }} />
              <div>
                <div className="alert-level">Vigilance {vigilanceLabel(level).toLowerCase()}</div>
                <div className="mono" style={{ color: 'var(--mut2)', marginTop: 4 }}>
                  Département 971 — Guadeloupe
                </div>
              </div>
            </div>

            <p className="alert-advice">{VIGILANCE_ADVICE[level ?? 0]}</p>

            {vigilance?.risks && vigilance.risks.length > 0 && (
              <div className="tags">
                {vigilance.risks.map((risk) => (
                  <span key={risk.type} className="tag mono">
                    {risk.type} · {vigilanceLabel(risk.level).toLowerCase()}
                  </span>
                ))}
              </div>
            )}

            <div className="note">
              Météo-France publie la vigilance à l&apos;échelle du département : le niveau affiché
              vaut pour toute la Guadeloupe, pas pour {commune.nom} en particulier. Seules les
              consignes officielles font foi.
            </div>

            {vigilance?.phenomenes_phrases && vigilance.phenomenes_phrases.length > 0 && (
              <div className="tags">
                {vigilance.phenomenes_phrases.map((phrase) => (
                  <span key={phrase} className="tag mono">
                    {phrase}
                  </span>
                ))}
              </div>
            )}

            <dl style={{ marginTop: 24 }}>
              <div className="pair">
                <dt>Rafales max</dt>
                <dd>{num(weather?.wind_gust, ' km/h')}</dd>
              </div>
              <div className="pair">
                <dt>Indice UV</dt>
                <dd>{num(weather?.uv_index, '', 1)}</dd>
              </div>
              <div className="pair">
                <dt>Pluie sur 1 h</dt>
                <dd>{num(weather?.rain_1h, ' mm', 1)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="sheet-body">
          <section className="sheet-col">
            <h3 className="section-title">Qualité de l&apos;air</h3>
            <div className="atmo-big">
              <span className="atmo-index" style={{ color: atmoColor(index) }}>
                {index ?? '—'}
              </span>
              <span>{atmoLabel(index)}</span>
            </div>

            <div className="gauge" aria-hidden="true">
              {ATMO_COLORS.slice(1).map((color, position) => (
                <span
                  key={color}
                  style={{
                    background: index && position + 1 <= index ? color : undefined,
                  }}
                />
              ))}
            </div>

            {commune.air.pollutants.map((pollutant) => (
              <div key={pollutant.key} className="bar-row">
                <div className="bar-head">
                  <span className="label">{pollutant.label}</span>
                  <span className="value mono">
                    {pollutant.index ? `${pollutant.index}/6` : 'Non mesuré'}
                  </span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${((pollutant.index ?? 0) / 6) * 100}%`,
                      background: atmoColor(pollutant.index),
                    }}
                  />
                </div>
              </div>
            ))}

            <p className="tip" style={{ marginTop: 18 }}>
              {ATMO_ADVICE[index ?? 0]}
            </p>
            <p className="mono" style={{ color: 'var(--mut2)' }}>
              Échelle ATMO 1 à 6 — sous-indices publiés par Gwad&apos;Air
            </p>
          </section>

          <section className="sheet-col">
            <h3 className="section-title">Tours d&apos;eau — SMGEAG</h3>

            {commune.water.cuts.length === 0 ? (
              <p className="empty-note">
                Aucune coupure planifiée sur les {CUT_DAYS} prochains jours
                {commune.water.raw?.details.some(isFavorable)
                  ? ' : le planning indique une alimentation favorable maintenue.'
                  : '.'}
              </p>
            ) : (
              commune.water.cuts.map((cut, position) => {
                const zones = sectorDetail(cut.secteur);
                return (
                  <article key={`${cut.date.toISOString()}-${position}`} className="cut-card">
                    <div className="cut-card-head mono">
                      <span>
                        {cut.dayLabel} · n°{position + 1}
                      </span>
                      <span
                        className="status-tag mono"
                        style={{
                          background: planningFresh ? 'rgba(121,189,140,.14)' : 'rgba(226,199,106,.14)',
                          color: planningFresh ? '#79bd8c' : '#e2c76a',
                        }}
                      >
                        {planningFresh ? 'Planning à jour' : 'À vérifier'}
                      </span>
                    </div>
                    <p className="sector">{shortSector(cut.secteur)}</p>
                    <p className="hours mono">{cut.hours}</p>
                    {zones && <p className="zones">{zones}</p>}
                  </article>
                );
              })
            )}

            <dl style={{ marginTop: 20 }}>
              <div className="pair">
                <dt>Secteurs au planning</dt>
                <dd>{commune.water.raw?.details.length ?? 0}</dd>
              </div>
              <div className="pair">
                <dt>Jours touchés (7 j)</dt>
                <dd>{commune.water.cutDays}</dd>
              </div>
              <div className="pair">
                <dt>Planning relevé le</dt>
                <dd>{waterSourceDate ? formatLongDate(waterSourceDate) : '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="sheet-col">
            <h3 className="section-title">Conseils &amp; contacts</h3>

            <p className="tip">
              <strong style={{ fontWeight: 400 }}>Baignade et activités.</strong>{' '}
              {level && level >= 3
                ? 'Reportez les sorties en mer et les activités exposées tant que la vigilance est active.'
                : 'Pas de restriction liée à la vigilance. Restez attentif aux drapeaux de baignade.'}
            </p>

            <p className="tip">
              <strong style={{ fontWeight: 400 }}>Réserve d&apos;eau.</strong>{' '}
              {commune.water.cutDays > 0
                ? `Prévoyez de quoi tenir : ${commune.water.cutDays} jour(s) de coupure sont planifiés cette semaine sur au moins un secteur.`
                : 'Aucune coupure planifiée cette semaine, mais les casses réseau restent imprévisibles.'}
            </p>

            <h3 className="section-title" style={{ marginTop: 26 }}>
              Numéros utiles
            </h3>
            <ul className="contacts">
              <li>
                <span>Urgences (Europe)</span>
                <span className="mono">112</span>
              </li>
              <li>
                <span>SAMU</span>
                <span className="mono">15</span>
              </li>
              <li>
                <span>Pompiers</span>
                <span className="mono">18</span>
              </li>
              <li>
                <span>Police / Gendarmerie</span>
                <span className="mono">17</span>
              </li>
              <li>
                <span>Urgences par SMS</span>
                <span className="mono">114</span>
              </li>
            </ul>

            <p className="tip" style={{ marginTop: 20 }}>
              Ces données sont agrégées automatiquement et peuvent être incomplètes ou en retard.
              En cas de doute, consultez{' '}
              <a href="https://meteofrance.gp/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sage)' }}>
                Météo-France
              </a>
              ,{' '}
              <a href="https://www.gwadair.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sage)' }}>
                Gwad&apos;Air
              </a>{' '}
              et{' '}
              <a href="https://www.smgeag.fr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--sage)' }}>
                le SMGEAG
              </a>
              .
            </p>
          </section>
        </div>

        <div className="sheet-foot mono">
          <span>{now ? `Mis à jour à ${formatTime(now)}` : ''}</span>
          <span>Sources · Gwad&apos;Air · Météo-France · SMGEAG</span>
        </div>
      </div>
    </div>
  );
}
