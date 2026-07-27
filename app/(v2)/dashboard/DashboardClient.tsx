'use client';

import React from 'react';
import { CommuneModal } from './components/CommuneModal';
import { MapStage } from './components/MapStage';
import { Readout } from './components/Readout';
import { SidePanel } from './components/SidePanel';
import { useNow } from './lib/format';
import {
  MODES,
  useCommunesGeo,
  useDashboardData,
  type Mode,
} from './lib/model';
import {
  ATMO_COLORS,
  ATMO_LABELS,
  VIGILANCE_COLORS,
  VIGILANCE_LABELS,
  waterColor,
} from './lib/palette';

type LegendEntry = { color: string; label: string };

/** La légende accompagne toujours la couleur d'un libellé — jamais de couleur seule. */
function legendFor(mode: Mode): LegendEntry[] {
  if (mode === 'air') {
    return ATMO_COLORS.slice(1).map((color, position) => ({
      color,
      label: ATMO_LABELS[position + 1],
    }));
  }
  if (mode === 'vigilance') {
    return VIGILANCE_COLORS.slice(1).map((color, position) => ({
      color,
      label: VIGILANCE_LABELS[position + 1],
    }));
  }
  return [
    { color: waterColor(0), label: 'Aucune coupure' },
    { color: waterColor(1), label: '1 jour' },
    { color: waterColor(2), label: '2 jours et plus' },
  ];
}

export default function DashboardClient() {
  const { geo, error: geoError } = useCommunesGeo();
  const data = useDashboardData(geo);
  const now = useNow();

  const [mode, setMode] = React.useState<Mode>('air');
  const [selected, setSelected] = React.useState<string | null>(null);
  const [sheet, setSheet] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');

  const readoutRef = React.useRef<HTMLDivElement | null>(null);
  const controlsRef = React.useRef<HTMLDivElement | null>(null);
  const searchRef = React.useRef<HTMLInputElement | null>(null);

  const selectedCommune = selected ? data.byCode.get(selected) ?? null : null;
  const sheetCommune = sheet ? data.byCode.get(sheet) ?? null : null;

  // Un clic sur la carte sélectionne ET ouvre la fiche ; un clic dans la liste
  // ne fait que sélectionner, pour permettre de comparer plusieurs communes.
  const selectFromMap = React.useCallback((code: string) => {
    setSelected(code);
    setSheet(code);
  }, []);

  const openSheet = React.useCallback((code: string) => {
    setSelected(code);
    setSheet(code);
  }, []);

  const legend = legendFor(mode);

  return (
    <div className="shell">
      <main className="stage">
        <MapStage
          geo={geo}
          geoError={geoError}
          byCode={data.byCode}
          mode={mode}
          vigilance={data.vigilance}
          selected={selected}
          onSelect={selectFromMap}
          home={selectedCommune === null}
          readoutRef={readoutRef}
          controlsRef={controlsRef}
        />

        <div className="map-controls" ref={controlsRef}>
          <div className="mode-pill" role="group" aria-label="Donnée affichée sur la carte">
            {MODES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className="mono"
                aria-pressed={mode === entry.id}
                onClick={() => setMode(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <div className="legend">
            {legend.map((entry) => (
              <span key={entry.label} className="legend-item mono">
                <span className="legend-swatch" style={{ background: entry.color }} />
                {entry.label}
              </span>
            ))}
          </div>
        </div>

        <Readout
          commune={selectedCommune}
          communes={data.communes}
          vigilance={data.vigilance}
          now={now}
          onOpenSheet={() => selectedCommune && setSheet(selectedCommune.code)}
          onBackHome={() => setSelected(null)}
          onFocusSearch={() => searchRef.current?.focus()}
          readoutRef={readoutRef}
        />
      </main>

      <SidePanel
        communes={data.communes}
        selected={selectedCommune}
        mode={mode}
        vigilance={data.vigilance}
        query={query}
        onQueryChange={setQuery}
        onSelect={setSelected}
        onOpenSheet={openSheet}
        searchRef={searchRef}
      />

      {sheetCommune && (
        <CommuneModal
          commune={sheetCommune}
          vigilance={data.vigilance}
          waterSourceDate={data.waterSourceDate}
          now={now}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
