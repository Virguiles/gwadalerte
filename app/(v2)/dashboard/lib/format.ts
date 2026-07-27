'use client';

import { useEffect, useState } from 'react';

/**
 * Formats français partagés. Toutes les dates sont rendues côté client
 * uniquement : le serveur et le navigateur ne sont pas dans le même fuseau,
 * et un rendu serveur produirait un écart d'hydratation.
 */

const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const shortDayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });

export const formatTime = (date: Date) => timeFormatter.format(date);
export const formatLongDate = (date: Date) => longDateFormatter.format(date);
export const formatShortDay = (date: Date) => shortDayFormatter.format(date).replace('.', '');

/** Horloge rafraîchie chaque minute ; `null` tant que le client n'a pas monté. */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    // Première lecture après la peinture, puis une fois par minute.
    const frame = requestAnimationFrame(tick);
    const timer = setInterval(tick, 60_000);
    return () => {
      cancelAnimationFrame(frame);
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
