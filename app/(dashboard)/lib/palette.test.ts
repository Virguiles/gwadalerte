import { describe, expect, it } from 'vitest';
import {
  atmoColor,
  atmoLabel,
  atmoTextColor,
  vigilanceColor,
  vigilanceLabel,
  waterColor,
  waterLabel,
} from './palette';

describe('atmoColor / atmoLabel', () => {
  it('returns the "no data" entry for null', () => {
    expect(atmoColor(null)).toBe('var(--no-data)');
    expect(atmoLabel(null)).toBe('Non mesuré');
  });

  it('returns the "no data" entry for out-of-range indices', () => {
    expect(atmoColor(0)).toBe('var(--no-data)');
    expect(atmoColor(7)).toBe('var(--no-data)');
    expect(atmoColor(-1)).toBe('var(--no-data)');
  });

  it('resolves valid boundary indices 1 and 6', () => {
    expect(atmoColor(1)).toBe('#79bd8c');
    expect(atmoLabel(1)).toBe('Bon');
    expect(atmoColor(6)).toBe('#a05a86');
    expect(atmoLabel(6)).toBe('Extrêmement mauvais');
  });
});

describe('atmoTextColor', () => {
  it('falls back to the muted token outside 1-6', () => {
    expect(atmoTextColor(null)).toBe('var(--mut)');
    expect(atmoTextColor(undefined)).toBe('var(--mut)');
    expect(atmoTextColor(0)).toBe('var(--mut)');
    expect(atmoTextColor(7)).toBe('var(--mut)');
  });

  it('resolves a per-index token within range', () => {
    expect(atmoTextColor(1)).toBe('var(--atmo-fg-1)');
    expect(atmoTextColor(6)).toBe('var(--atmo-fg-6)');
  });
});

describe('vigilanceColor / vigilanceLabel', () => {
  it('returns the "no data" entry for null or out-of-range levels', () => {
    expect(vigilanceColor(null)).toBe('var(--no-data)');
    expect(vigilanceColor(0)).toBe('var(--no-data)');
    expect(vigilanceColor(5)).toBe('var(--no-data)');
    expect(vigilanceLabel(null)).toBe('Inconnue');
  });

  it('resolves valid boundary levels 1 and 4', () => {
    expect(vigilanceColor(1)).toBe('#79bd8c');
    expect(vigilanceLabel(4)).toBe('Rouge');
  });
});

describe('waterColor / waterLabel', () => {
  it('treats zero and negative counts as no cuts', () => {
    expect(waterColor(0)).toBe('var(--water-0)');
    expect(waterColor(-1)).toBe('var(--water-0)');
    expect(waterLabel(0)).toBe('Aucune coupure');
  });

  it('singularizes exactly one cut', () => {
    expect(waterColor(1)).toBe('var(--water-1)');
    expect(waterLabel(1)).toBe('1 coupure');
  });

  it('pluralizes more than one cut', () => {
    expect(waterColor(2)).toBe('var(--water-2)');
    expect(waterLabel(3)).toBe('3 coupures');
  });
});
