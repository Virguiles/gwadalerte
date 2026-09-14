import { describe, expect, it } from 'vitest';
import { adaptOriskResponse, type OriskToursDeauResponse } from './water-cuts-adapter';
import { parseSchedule, sectorDetail, shortSector } from '@/app/(dashboard)/lib/water';

describe('adaptOriskResponse', () => {
  it('maps a commune name to its code INSEE and keeps its zones', () => {
    const response: OriskToursDeauResponse = {
      generated_at: '2026-09-14T11:13:35.748Z',
      communes: {
        Gourbeyre: [
          {
            zone: 'Gourbeyre',
            commune: 'Gourbeyre',
            secteur: 'BASSE-TERRE',
            fermeture: '16H',
            ouverture: '9H',
            lieux_dits: ['Vieux Chemin', 'Champ Fleury'],
            jours: [1, 3, 5],
            horaires_par_jour: null,
          },
        ],
      },
    };

    const result = adaptOriskResponse(response);

    expect(Object.keys(result)).toEqual(['97109']); // code INSEE de Gourbeyre
    expect(result['97109'].details).toHaveLength(1);
  });

  it('builds a schedule label parseable by the existing SMGEAG parser', () => {
    const response: OriskToursDeauResponse = {
      generated_at: '2026-09-14T11:13:35.748Z',
      communes: {
        Gourbeyre: [
          {
            zone: 'Gourbeyre',
            commune: 'Gourbeyre',
            secteur: 'BASSE-TERRE',
            fermeture: '16H',
            ouverture: '9H',
            lieux_dits: [],
            jours: [1, 3, 5],
            horaires_par_jour: null,
          },
        ],
      },
    };

    const detail = adaptOriskResponse(response)['97109'].details[0];

    expect(detail.horaires).toBe('Lundi / mercredi / vendredi de 16h à 9h');
    expect(parseSchedule(detail.horaires)).toEqual([
      { weekdays: [1, 3, 5], hours: '16h à 9h' },
    ]);
  });

  it('groups days by per-day schedule overrides into separate segments', () => {
    const response: OriskToursDeauResponse = {
      generated_at: '2026-09-14T11:13:35.748Z',
      communes: {
        'Le Moule': [
          {
            zone: 'Le Moule',
            commune: 'Le Moule',
            secteur: 'GRANDE-TERRE',
            fermeture: '20H',
            ouverture: '5H',
            lieux_dits: [],
            jours: [1, 3, 5],
            horaires_par_jour: { '5': { fermeture: '20H', ouverture: '9H' } },
          },
        ],
      },
    };

    const detail = adaptOriskResponse(response)['97117'].details[0];

    expect(detail.horaires).toBe('Lundi / mercredi de 20h à 5h, vendredi de 20h à 9h');
  });

  it('expands a full week to "Tous les jours"', () => {
    const response: OriskToursDeauResponse = {
      generated_at: '2026-09-14T11:13:35.748Z',
      communes: {
        'Saint-Claude': [
          {
            zone: 'Saint-Claude',
            commune: 'Saint-Claude',
            secteur: 'BASSE-TERRE',
            fermeture: '18H',
            ouverture: '6H',
            lieux_dits: ['Ducharmoy'],
            jours: [1, 2, 3, 4, 5, 6, 7],
            horaires_par_jour: null,
          },
        ],
      },
    };

    const detail = adaptOriskResponse(response)['97124'].details[0];

    expect(detail.horaires).toBe('Tous les jours de 18h à 6h');
  });

  it('treats a zone with no schedule as favorable supply', () => {
    const response: OriskToursDeauResponse = {
      generated_at: '2026-09-14T11:13:35.748Z',
      communes: {
        Gourbeyre: [
          {
            zone: 'Gourbeyre',
            commune: 'Gourbeyre',
            secteur: 'CENTRE',
            fermeture: '',
            ouverture: '',
            lieux_dits: ['Bourg', 'Valeau'],
            jours: [],
            horaires_par_jour: null,
          },
        ],
      },
    };

    const detail = adaptOriskResponse(response)['97109'].details[0];

    expect(detail.horaires).toBe('Alimentation favorable maintenue.');
    expect(parseSchedule(detail.horaires)).toEqual([]);
  });

  it('includes lieux-dits in parentheses, readable by sectorDetail/shortSector', () => {
    const response: OriskToursDeauResponse = {
      generated_at: '2026-09-14T11:13:35.748Z',
      communes: {
        Gourbeyre: [
          {
            zone: 'Gourbeyre',
            commune: 'Gourbeyre',
            secteur: 'BASSE-TERRE',
            fermeture: '16H',
            ouverture: '9H',
            lieux_dits: ['Vieux Chemin', 'Champ Fleury', 'Bisdary'],
            jours: [1, 3, 5],
            horaires_par_jour: null,
          },
        ],
      },
    };

    const detail = adaptOriskResponse(response)['97109'].details[0];

    expect(detail.secteur).toBe('BASSE-TERRE (Vieux Chemin, Champ Fleury, Bisdary)');
    expect(shortSector(detail.secteur)).toBe('BASSE-TERRE');
    expect(sectorDetail(detail.secteur)).toBe('Vieux Chemin, Champ Fleury, Bisdary');
  });

  it('distinguishes several zones sharing the commune name as their zone label', () => {
    const response: OriskToursDeauResponse = {
      generated_at: '2026-09-14T11:13:35.748Z',
      communes: {
        Gourbeyre: [
          {
            zone: 'Gourbeyre',
            commune: 'Gourbeyre',
            secteur: 'BASSE-TERRE',
            fermeture: '16H',
            ouverture: '9H',
            lieux_dits: [],
            jours: [1, 3, 5],
            horaires_par_jour: null,
          },
          {
            zone: 'Gourbeyre',
            commune: 'Gourbeyre',
            secteur: 'CENTRE',
            fermeture: '',
            ouverture: '',
            lieux_dits: [],
            jours: [],
            horaires_par_jour: null,
          },
        ],
      },
    };

    const [first, second] = adaptOriskResponse(response)['97109'].details;

    expect(first.secteur).toBe('BASSE-TERRE');
    expect(second.secteur).toBe('CENTRE');
  });

  it('prefixes the sector with the zone name when it differs from the commune', () => {
    const response: OriskToursDeauResponse = {
      generated_at: '2026-09-14T11:13:35.748Z',
      communes: {
        "Morne-à-l'Eau": [
          {
            zone: "Morne-à-l'Eau 1",
            commune: "Morne-à-l'Eau",
            secteur: 'GRANDE-TERRE',
            fermeture: '20H',
            ouverture: '5H',
            lieux_dits: ['Monpierre'],
            jours: [1, 3, 5],
            horaires_par_jour: null,
          },
        ],
      },
    };

    const detail = adaptOriskResponse(response)["97116"].details[0];

    expect(detail.secteur).toBe("GRANDE-TERRE — Morne-à-l'Eau 1 (Monpierre)");
  });

  it('carries lieux-dits favorables into zones_alimentation_favorables', () => {
    const response: OriskToursDeauResponse = {
      generated_at: '2026-09-14T11:13:35.748Z',
      communes: {
        'Saint-François': [
          {
            zone: 'Saint-François',
            commune: 'Saint-François',
            secteur: 'GRANDE-TERRE',
            fermeture: '20H',
            ouverture: '6H',
            lieux_dits: ['Le Bourg'],
            lieux_dits_favorables: ['Pombiray', 'Bragelogne'],
            jours: [1, 3, 5, 7],
            horaires_par_jour: null,
          },
        ],
      },
    };

    const detail = adaptOriskResponse(response)['97125'].details[0];

    expect(detail.zones_alimentation_favorables).toBe('Pombiray, Bragelogne');
  });

  it('ignores communes it cannot match to a code INSEE', () => {
    const response: OriskToursDeauResponse = {
      generated_at: '2026-09-14T11:13:35.748Z',
      communes: {
        'Commune Inconnue': [
          {
            zone: 'X',
            commune: 'Commune Inconnue',
            secteur: 'X',
            fermeture: '20H',
            ouverture: '6H',
            lieux_dits: [],
            jours: [1],
            horaires_par_jour: null,
          },
        ],
      },
    };

    expect(adaptOriskResponse(response)).toEqual({});
  });
});
