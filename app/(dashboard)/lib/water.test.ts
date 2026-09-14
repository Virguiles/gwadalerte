import { describe, expect, it } from 'vitest';
import {
  countCutDays,
  parseSchedule,
  sectorDetail,
  sectorSummary,
  shortSector,
  sharedZone,
  upcomingCuts,
} from './water';
import type { WaterCutData } from '@/app/data/water-types';

describe('parseSchedule', () => {
  it('parses a single day/hour segment', () => {
    expect(parseSchedule('Mardi de 20h à 7h')).toEqual([
      { weekdays: [2], hours: '20h à 7h' },
    ]);
  });

  it('parses multiple days sharing one hour range', () => {
    expect(parseSchedule('Mardi / jeudi / samedi de 20h à 7h')).toEqual([
      { weekdays: [2, 4, 6], hours: '20h à 7h' },
    ]);
  });

  it('parses comma-separated segments with distinct hour ranges', () => {
    expect(parseSchedule('Lundi / mercredi de 20h à 5h, vendredi de 20h à 9h')).toEqual([
      { weekdays: [1, 3], hours: '20h à 5h' },
      { weekdays: [5], hours: '20h à 9h' },
    ]);
  });

  it('expands "tous les jours" to every weekday', () => {
    expect(parseSchedule('Tous les jours de 18h à 6h')).toEqual([
      { weekdays: [0, 1, 2, 3, 4, 5, 6], hours: '18h à 6h' },
    ]);
  });

  it('returns no slots for a favorable-supply sector', () => {
    expect(parseSchedule('Alimentation favorable, pas de coupure prévue')).toEqual([]);
  });

  it('is accent- and case-insensitive on day names', () => {
    expect(parseSchedule('DIMANCHE de 22h à 4h')).toEqual([
      { weekdays: [0], hours: '22h à 4h' },
    ]);
  });

  it('returns no slots for unparseable text', () => {
    expect(parseSchedule('Planning en cours de révision')).toEqual([]);
  });
});

describe('upcomingCuts', () => {
  const data: WaterCutData = {
    commune: 'Test',
    details: [{ secteur: 'Secteur 1', horaires: 'Mardi de 20h à 7h' }],
  };

  it('only projects cuts on the matching weekday', () => {
    // 2026-09-14 is a Monday.
    const monday = new Date(2026, 8, 14);
    const cuts = upcomingCuts(data, 7, monday);
    expect(cuts).toHaveLength(1);
    expect(cuts[0].date.getDay()).toBe(2);
    expect(cuts[0].secteur).toBe('Secteur 1');
    expect(cuts[0].hours).toBe('20h à 7h');
  });

  it('wraps across a week boundary (Sunday start)', () => {
    // 2026-09-20 is a Sunday; the Tuesday match falls two days later.
    const sunday = new Date(2026, 8, 20);
    const cuts = upcomingCuts(data, 7, sunday);
    expect(cuts).toHaveLength(1);
    expect(cuts[0].date.toDateString()).toBe(new Date(2026, 8, 22).toDateString());
  });

  it('returns an empty array when there is no data', () => {
    expect(upcomingCuts(undefined)).toEqual([]);
  });

  it('returns an empty array for a favorable sector', () => {
    const favorable: WaterCutData = {
      commune: 'Test',
      details: [{ secteur: 'Secteur 1', horaires: 'Alimentation favorable' }],
    };
    expect(upcomingCuts(favorable, 7, new Date(2026, 8, 14))).toEqual([]);
  });
});

describe('countCutDays', () => {
  it('deduplicates multiple sectors cutting on the same day', () => {
    const data: WaterCutData = {
      commune: 'Test',
      details: [
        { secteur: 'Secteur 1', horaires: 'Mardi de 20h à 7h' },
        { secteur: 'Secteur 2', horaires: 'Mardi de 21h à 6h' },
      ],
    };
    const monday = new Date(2026, 8, 14);
    expect(countCutDays(data, 7, monday)).toBe(1);
  });

  it('is 0 when there is no data', () => {
    expect(countCutDays(undefined)).toBe(0);
  });
});

describe('shortSector', () => {
  it('strips the neighborhood list in parentheses', () => {
    expect(shortSector('Morne-à-l\'Eau 2 (Bourg, Damencourt)')).toBe('Morne-à-l\'Eau 2');
  });

  it('strips the shared-zone suffix', () => {
    expect(
      shortSector('Secteur 4 — zone commune avec Capesterre Belle-Eau 2 & 3 et Les Saintes'),
    ).toBe('Secteur 4');
  });

  it('returns null for an unnamed "Secteurs" head', () => {
    expect(shortSector('Secteurs (Saint-Claude, Matouba)')).toBeNull();
  });

  it('returns null for an empty head', () => {
    expect(shortSector('(Quartier seul)')).toBeNull();
  });
});

describe('sectorDetail', () => {
  it('extracts the parenthesized neighborhood list', () => {
    expect(sectorDetail('Secteurs (Saint-Claude, Matouba)')).toBe('Saint-Claude, Matouba');
  });

  it('returns null when there are no parentheses', () => {
    expect(sectorDetail('Secteur 1')).toBeNull();
  });
});

describe('sharedZone', () => {
  it('extracts the shared-zone commune list', () => {
    expect(
      sharedZone('Secteur 4 — zone commune avec Capesterre Belle-Eau 2 & 3 et Les Saintes'),
    ).toBe('Capesterre Belle-Eau 2 & 3 et Les Saintes');
  });

  it('returns null when there is no shared-zone suffix', () => {
    expect(sharedZone('Secteur 1')).toBeNull();
  });
});

describe('sectorSummary', () => {
  it('prefers the sector name when one exists', () => {
    expect(sectorSummary('Secteur 1 (Bourg)')).toBe('Secteur 1');
  });

  it('falls back to the first two neighborhoods, truncated', () => {
    expect(sectorSummary('Secteurs (Saint-Claude, Matouba, Rivière-Rouge)')).toBe(
      'Saint-Claude, Matouba…',
    );
  });

  it('joins all neighborhoods when there are two or fewer', () => {
    expect(sectorSummary('Secteurs (Saint-Claude, Matouba)')).toBe('Saint-Claude, Matouba');
  });

  it('returns null when nothing identifies the sector', () => {
    expect(sectorSummary('Secteurs')).toBeNull();
  });
});
