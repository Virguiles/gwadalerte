import { ImageResponse } from 'next/og';

/**
 * Générateur d'images Open Graph partagé par toutes les pages.
 *
 * Les visuels sont générés au build par next/og : pas de fichier JPG à
 * maintenir, et la marque reste synchronisée si le nom du site change.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type OgImageOptions = {
  /** Titre de la page (ex. "Tours d'Eau") */
  title: string;
  /** Phrase d'accroche affichée sous le titre */
  subtitle: string;
  /** Sources officielles créditées en bas de l'image */
  sources: string;
  /** Couleur d'accent de la thématique (dégradé + filet) */
  accent: string;
};

export function renderOgImage({ title, subtitle, sources, accent }: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0f172a',
          backgroundImage: `radial-gradient(circle 800px at 80% -10%, ${accent}55, transparent), radial-gradient(circle 600px at 0% 110%, ${accent}33, transparent)`,
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* En-tête : marque */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 16,
              height: 56,
              borderRadius: 8,
              background: accent,
            }}
          />
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#f8fafc' }}>
            Gwad&apos;Alerte
          </div>
        </div>

        {/* Corps : titre + accroche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 88,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: '#cbd5e1', lineHeight: 1.3 }}>
            {subtitle}
          </div>
        </div>

        {/* Pied : provenance des données */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', fontSize: 26, color: '#94a3b8' }}>Guadeloupe</div>
          <div style={{ display: 'flex', fontSize: 26, color: '#475569' }}>•</div>
          <div style={{ display: 'flex', fontSize: 26, color: '#94a3b8' }}>{sources}</div>
        </div>
      </div>
    ),
    size
  );
}
