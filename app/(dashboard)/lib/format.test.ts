import { describe, expect, it } from 'vitest';
import { formatDayLabel, num, temp, windDirection } from './format';

describe('formatDayLabel', () => {
  it('labels the first index "Auj." regardless of the date', () => {
    expect(formatDayLabel('2026-07-27', 0)).toBe('Auj.');
  });

  it('formats a later index as a short weekday, read in UTC not local time', () => {
    // 2026-07-27 is a Monday. This is a regression test for the hydration
    // fix: reading the date in the visitor's local timezone (instead of
    // UTC) used to roll it back a day in negative-offset zones.
    expect(formatDayLabel('2026-07-27', 1)).toBe('lun');
  });

  it('formats a Sunday correctly', () => {
    expect(formatDayLabel('2026-08-02', 2)).toBe('dim');
  });

  it('falls back to the raw string for an unparseable date', () => {
    expect(formatDayLabel('not-a-date', 1)).toBe('not-a-date');
  });
});

describe('temp', () => {
  it('rounds a numeric value', () => {
    expect(temp(24.6)).toBe('25');
  });

  it('renders an em dash for null or undefined', () => {
    expect(temp(null)).toBe('—');
    expect(temp(undefined)).toBe('—');
  });
});

describe('num', () => {
  it('formats with the requested unit and digit count', () => {
    expect(num(12.345, ' mm', 1)).toBe('12.3 mm');
  });

  it('renders an em dash for non-finite or missing values', () => {
    expect(num(null)).toBe('—');
    expect(num(undefined)).toBe('—');
    expect(num(NaN)).toBe('—');
    expect(num(Infinity)).toBe('—');
  });
});

describe('windDirection', () => {
  it('maps degrees to the nearest compass point', () => {
    expect(windDirection(0)).toBe('N');
    expect(windDirection(90)).toBe('E');
    expect(windDirection(180)).toBe('S');
    expect(windDirection(270)).toBe('O');
  });

  it('wraps around 360 degrees back to N', () => {
    expect(windDirection(359)).toBe('N');
  });

  it('returns an empty string when degrees are missing', () => {
    expect(windDirection(null)).toBe('');
    expect(windDirection(undefined)).toBe('');
  });
});
