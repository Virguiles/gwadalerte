'use client';

import React from 'react';
import { WeatherGlyph } from '@/app/components/shared/WeatherGlyph';
import { useCommuneForecast } from '@/app/data/useMeteoForecast';
import { ATMO_ADVICE, ATMO_COLORS, atmoColor, atmoLabel, atmoTextColor, waterStatusLabel } from '../lib/palette';
import { formatDayLabel, formatLongDate, num, temp, windDirection } from '../lib/format';
import { LAYER_NOTES, POLLUTANT_NOTES } from '../lib/glossary';
import type { CommuneRecord, Layer } from '../lib/model';
import { isFavorable, sectorDetail, sharedZone, shortSector } from '../lib/water';

type Props = {
  commune: CommuneRecord;
  layer: Layer;
  now: Date | null;
};

/** Sept jours suffisent à couvrir un cycle complet de tours d'eau. */
const CUT_DAYS = 7;

/** Repli SMGEAG relevé à la main quand Orisk est indisponible : au-delà d'une semaine, il vieillit. */
const FRESH_PLANNING_MS = 8 * 24 * 60 * 60 * 1000;

function Pair({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pair">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * Fiche d'une commune : météo, qualité de l'air, tours d'eau.
 *
 * Elle vit dans le panneau et non dans une surface superposée — la carte
 * reste visible, et passer d'une commune à l'autre ne demande ni ouverture
 * ni fermeture.
 *
 * C'est ici — et ici seulement — que se lit une commune, son nom compris. Le
 * bloc posé sur la carte ne garde que l'heure et le retour à la vue
 * d'ensemble : il répétait auparavant le nom, la température, la condition, le
 * vent, l'indice ATMO et le statut des tours d'eau, tous visibles en même temps
 * à 40 cm d'écart sur grand écran.
 */
export function CommuneDetail({ commune, layer, now }: Props) {
  const { forecast } = useCommuneForecast(commune.code);
  const weather = commune.weather;
  const index = commune.air.index;
  const waterSourceDate = commune.water.sourceDate;

  const planningFresh =
    now !== null &&
    waterSourceDate !== null &&
    now.getTime() - waterSourceDate.getTime() < FRESH_PLANNING_MS;

  const days = forecast?.daily?.slice(0, 5) ?? [];

  // Numéro du secteur DANS SA JOURNÉE (« n°1 », « n°2 » quand plusieurs
  // secteurs tournent le même jour) — pas un rang global sur les sept jours,
  // qui grimpait sans fin et attribuait un « n°4 » à un secteur qui n'était
  // que la répétition du premier deux jours plus tard.
  let lastDayKey = '';
  let dayIndex = 0;
  const cutsWithDayIndex = commune.water.cuts.map((cut) => {
    const dayKey = cut.date.toDateString();
    dayIndex = dayKey === lastDayKey ? dayIndex + 1 : 1;
    lastDayKey = dayKey;
    return { cut, dayIndex };
  });

  return (
    <>
      {/* `h1` et non `h2` : commune choisie, c'est le seul titre de la page —
          le bloc sur la carte n'affiche plus que l'heure et le retour. */}
      <div className="detail-head">
        <h1 className="detail-name">{commune.nom}</h1>
      </div>

      <div className="panel-detail scroll-thin">
        {/* La fiche suit désormais l'onglet choisi : « Tours d'eau » ne doit
            montrer que l'eau, pas la météo ni l'air qui vivent sous l'autre
            onglet. */}
        {layer === 'air' && (
          <>
            {/* Ce que l'on veut savoir en premier d'une commune : le temps
                qu'il y fait maintenant, puis d'un coup d'œil son air. */}
            <div className="detail-now">
              <span className="detail-now-temp">
                {temp(weather?.temperature)}
                <sup>°</sup>
              </span>
              {weather && (
                <span className="detail-now-condition">
                  <WeatherGlyph
                    weatherCode={weather.weather_code}
                    isDay={weather.is_day ?? true}
                    size={30}
                  />
                  <span className="mono">{weather.weather_description}</span>
                </span>
              )}
            </div>

            <div className="chips">
              <span className="chip mono">
                <span className="dot" style={{ background: commune.air.color }} />
                ATMO {index ?? '—'} · {commune.air.label}
              </span>
              {typeof weather?.wind_speed === 'number' && (
                <span className="chip mono">
                  Vent {Math.round(weather.wind_speed)} km/h {windDirection(weather.wind_deg)}
                </span>
              )}
            </div>

            <section className="section">
              <h2 className="section-title">Prévision</h2>

              {days.length > 0 ? (
                <div className="forecast" style={{ ['--forecast-days' as string]: days.length }}>
                  {days.map((day, position) => (
                    <div key={day.date} className="forecast-day">
                      <span className="day mono">{formatDayLabel(day.date, position)}</span>
                      <WeatherGlyph
                        weatherCode={day.weather_code}
                        isDay
                        size={26}
                        label={day.weather_main}
                      />
                      <span className="range mono">
                        <b>{Math.round(day.temp_max)}°</b> / {Math.round(day.temp_min)}°
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-note">Prévision indisponible pour cette commune.</p>
              )}

              <dl>
                {/* Le vent est déjà dans les puces, en tête de fiche : ne reste ici
                    que ce qui ne s'y trouve pas. */}
                <Pair label="Ressenti">{temp(weather?.feels_like)} °C</Pair>
                <Pair label="Humidité">{num(weather?.humidity, ' %')}</Pair>
                <Pair label="Rafales max">{num(weather?.wind_gust, ' km/h')}</Pair>
                <Pair label="Indice UV">{num(weather?.uv_index, '', 1)}</Pair>
                <Pair label="Pluie sur 1 h">{num(weather?.rain_1h, ' mm', 1)}</Pair>
              </dl>
            </section>

            <section className="section">
              <h2 className="section-title">Qualité de l&apos;air</h2>

              <div className="atmo-big">
                {/* `atmoTextColor` et non `atmoColor` : le chiffre est du texte,
                    l'aplat de la carte ne l'est pas. */}
                <span className="atmo-index" style={{ color: atmoTextColor(index) }}>
                  {index ?? '—'}
                </span>
                <span>{atmoLabel(index)}</span>
              </div>

              <div className="gauge" aria-hidden="true">
                {ATMO_COLORS.slice(1).map((color, position) => (
                  <span
                    key={color}
                    style={{ background: index && position + 1 <= index ? color : undefined }}
                  />
                ))}
              </div>

              <p className="explainer">{LAYER_NOTES.air.summary}</p>

              {/* « PM10 4/6 » ne dit rien seul : ce que mesure chaque sous-indice
                  et d'où il vient en Guadeloupe se lit sous sa barre. */}
              {commune.air.pollutants.map((pollutant) => (
                <div key={pollutant.key} className="bar-row">
                  <div className="bar-head">
                    <span className="label">{pollutant.label}</span>
                    <span className="value mono">
                      {pollutant.index ? `${pollutant.index}/6 · ${atmoLabel(pollutant.index)}` : 'Non mesuré'}
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
                  {POLLUTANT_NOTES[pollutant.key] && (
                    <p className="bar-note">{POLLUTANT_NOTES[pollutant.key]}</p>
                  )}
                </div>
              ))}

              <p className="tip" style={{ marginTop: 18 }}>
                {ATMO_ADVICE[index ?? 0]}
              </p>
              <p className="explainer explainer-source">{LAYER_NOTES.air.source}</p>
            </section>
          </>
        )}

        {layer === 'water' && (
          <>
            <div className="chips">
              <span className="chip mono">
                <span className="dot" style={{ background: commune.water.color }} />
                {commune.water.label} sur {CUT_DAYS} jours
              </span>
            </div>

            <section className="section">
              <h2 className="section-title">Tours d&apos;eau — Orisk</h2>

              <p className="explainer">{LAYER_NOTES.water.summary}</p>

              {commune.water.cuts.length === 0 ? (
                <p className="empty-note">
                  Aucune coupure planifiée sur les {CUT_DAYS} prochains jours
                  {commune.water.raw?.details.some(isFavorable)
                    ? ' : le planning indique une alimentation favorable maintenue.'
                    : '.'}
                </p>
              ) : (
                cutsWithDayIndex.map(({ cut, dayIndex: cutDayIndex }) => {
                  const zones = sectorDetail(cut.secteur);
                  const name = shortSector(cut.secteur);
                  const shared = sharedZone(cut.secteur);
                  // La carte des sept prochains jours peut recouper la coupure
                  // la plus urgente du jour (voir `commune.water.today`) : on
                  // le signale sur sa carte plutôt que de le répéter ailleurs.
                  const today = commune.water.today;
                  const isTodayCard =
                    now !== null &&
                    today !== null &&
                    cut.date.toDateString() === now.toDateString() &&
                    cut.secteur === today.secteur &&
                    cut.hours === today.hours;
                  return (
                    <article key={`${cut.date.toISOString()}-${cutDayIndex}`} className="cut-card">
                      <div className="cut-card-head mono">
                        <span>
                          {cut.dayLabel} · n°{cutDayIndex}
                        </span>
                        {/* Couleurs par thème (voir `.status-tag` dans
                            dashboard.css) : posées en dur dans leur valeur du
                            thème sombre, elles tombaient à 1,56:1 sur le panneau
                            blanc. */}
                        <span className="cut-card-tags">
                          {isTodayCard && (
                            <span className={`status-tag mono ${today?.status === 'ongoing' ? 'is-ongoing' : 'is-upcoming'}`}>
                              {today ? waterStatusLabel(today.status) : null}
                            </span>
                          )}
                          <span className={`status-tag mono ${planningFresh ? 'is-ok' : 'is-stale'}`}>
                            {planningFresh ? 'Planning à jour' : 'À vérifier'}
                          </span>
                        </span>
                      </div>
                      {/* Quand le planning ne numérote pas le secteur, ce sont les
                          quartiers qui le nomment : ils montent en titre plutôt que
                          d'être répétés sur la ligne du dessous. */}
                      <p className="sector">{name ?? zones ?? 'Secteur non précisé'}</p>
                      <p className="hours mono">{cut.hours}</p>
                      {name && zones && <p className="zones">{zones}</p>}
                      {shared && <p className="zones">Zone commune avec {shared}.</p>}
                    </article>
                  );
                })
              )}

              <dl style={{ marginTop: 18 }}>
                <Pair label="Secteurs au planning">{commune.water.raw?.details.length ?? 0}</Pair>
                <Pair label="Jours touchés (7 j)">{commune.water.cutDays}</Pair>
                <Pair label="Planning relevé le">
                  {waterSourceDate ? formatLongDate(waterSourceDate) : '—'}
                </Pair>
              </dl>
            </section>
          </>
        )}

        <p className="detail-sources mono">
          {layer === 'air' ? "Sources · Gwad'Air · Météo-France" : 'Source · Orisk'}
        </p>
      </div>
    </>
  );
}
