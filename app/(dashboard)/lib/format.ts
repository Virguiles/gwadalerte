'use client';

import { useEffect, useState } from 'react';

/**
 * Formats français partagés. Toutes les dates sont rendues côté client
 * uniquement : le serveur et le navigateur ne sont pas dans le même fuseau,
 * et un rendu serveur produirait un écart d'hydratation.
 *
 * Tout est daté en heure de Guadeloupe, jamais dans le fuseau du visiteur :
 * la météo, l'indice ATMO et le planning des tours d'eau décrivent une
 * journée locale. Sans ce forçage, un lecteur depuis l'Hexagone lisait
 * « 07:58 » à côté d'une icône de nuit — il était 3 h 58 sur place — et le
 * planning d'eau pouvait se décaler d'un jour.
 */

const GUADELOUPE_TZ = 'America/Guadeloupe';

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: GUADELOUPE_TZ,
});
const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: GUADELOUPE_TZ,
});
/*
 * Les dates de prévision arrivent sous la forme « 2026-07-27 », déjà exprimées
 * en heure de Guadeloupe par l'API. `new Date()` les lit à minuit UTC : les
 * relire dans un fuseau négatif reculait l'affichage d'un jour — la première
 * colonne de la prévision annonçait « dim » un lundi. On les formate donc en
 * UTC, sans conversion.
 */
const shortDayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  timeZone: 'UTC',
});

export const formatTime = (date: Date) => timeFormatter.format(date);
export const formatLongDate = (date: Date) => longDateFormatter.format(date);

/** Étiquette d'un jour de prévision : « Auj. » pour le premier, sinon « mar ». */
export function formatDayLabel(isoDate: string, index: number): string {
  if (index === 0) return 'Auj.';
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return shortDayFormatter.format(parsed).replace('.', '');
}

/** Horloge rafraîchie chaque minute ; `null` tant que le client n'a pas monté. */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    /*
     * Lecture immédiate, pas au prochain `requestAnimationFrame` : dans un
     * onglet ouvert en arrière-plan, le navigateur ne planifie aucune frame, et
     * l'horloge restait `null`. La date disparaissait du bandeau, et surtout
     * la fiche commune en déduisait un planning des tours d'eau « À vérifier »
     * alors qu'il venait d'être relevé (voir CommuneDetail).
     *
     * Lire l'heure ne coûte rien : rien à différer après la peinture.
     */
    tick();
    const timer = setInterval(tick, 60_000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return now;
}

/** Température arrondie, ou tiret cadratin si la mesure manque. */
export function temp(value: number | null | undefined): string {
  return typeof value === 'number' ? `${Math.round(value)}` : '—';
}

export function num(value: number | null | undefined, unit = '', digits = 0): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)}${unit}`;
}

const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

export function windDirection(deg: number | null | undefined): string {
  if (typeof deg !== 'number') return '';
  return WIND_DIRECTIONS[Math.round(deg / 45) % 8];
}
