'use client';

import React from 'react';
import { temp } from '../lib/format';
import { territorySummary, type CommuneRecord } from '../lib/model';

type Props = {
  communes: CommuneRecord[];
  loading: boolean;
};

/**
 * L'état du territoire, posé dans le coin bas-gauche de la carte.
 *
 * Il ne dépend plus de la commune choisie : ces trois chiffres valent pour
 * toute la Guadeloupe, la fiche répond pour une commune. Les afficher en
 * permanence tient la scène immobile — c'est ce bloc qui, en changeant de
 * taille à chaque clic, faisait auparavant sauter le cadrage de la carte.
 */
export function Readout({ communes, loading }: Props) {
  const summary = territorySummary(communes);

  // Le nombre de communes mesurées ne s'affiche que s'il en manque une :
  // « 32/32 » à côté de « 32 communes » n'apprend rien.
  const airLabel =
    summary.measured > 0 && summary.measured < communes.length
      ? `ATMO moyen · ${summary.measured}/${communes.length} mesurées`
      : 'ATMO moyen';

  return (
    <div className="readout">
      {/* Les trois chiffres arrivent après trois requêtes : sans marque
          d'attente, la vue d'ensemble s'affiche vide et paraît cassée. */}
      <div className={`readout-stats${loading ? ' is-loading' : ''}`}>
        <div>
          <div className="readout-stat-value">
            {loading ? (
              <span className="skeleton-bar skeleton-value" />
            ) : (
              <>
                {summary.avgAir ? summary.avgAir.toFixed(1) : '—'}
                <small>/6</small>
              </>
            )}
          </div>
          <div className="readout-stat-label mono">{airLabel}</div>
        </div>
        <div>
          <div className="readout-stat-value">
            {loading ? (
              <span className="skeleton-bar skeleton-value" />
            ) : (
              <>
                {temp(summary.avgTemp)}
                <small>°C</small>
              </>
            )}
          </div>
          <div className="readout-stat-label mono">Température moy.</div>
        </div>
        <div>
          <div className="readout-stat-value">
            {loading ? <span className="skeleton-bar skeleton-value" /> : summary.communesWithCuts}
          </div>
          <div className="readout-stat-label mono">Communes en tour d&apos;eau</div>
        </div>
      </div>
    </div>
  );
}
