'use client';

import React from 'react';
import { getWeatherIcon } from '@/lib/weather-codes';

/**
 * Icônes météo en couleur — soleil ambre, lune argentée, pluie bleue.
 *
 * Pourquoi pas Lucide (déjà présent) : ses icônes sont monochromes, elles
 * héritent de `currentColor`. Sur ce tableau de bord, la couleur porte une
 * information (indice ATMO, vigilance, température) et le gris de la condition
 * météo se confondait avec les métadonnées voisines.
 *
 * Pourquoi pas Meteocons (`@meteocons/svg`, MIT, multicolore) : ses glyphes
 * sont animés et calibrés pour un fond clair et saturé. Sur l'encre sombre de
 * la page, leurs dégradés vifs entraient en concurrence avec les couleurs
 * sémantiques de la carte — et une animation permanente dans une fiche qu'on
 * lit n'apporte rien.
 *
 * Ces glyphes-ci sont donc dessinés au format de la maquette : aplats, sans
 * animation, et coloriés par variables CSS `--wx-*`.
 *
 * Chaque variable porte sa valeur de repli en dur : le composant n'a besoin
 * d'aucune feuille de style pour fonctionner. Ces replis sont ceux du thème
 * *clair*, qui est le thème par défaut : un composant privé de sa feuille de
 * style doit rester lisible sur blanc. Ils étaient calés sur l'encre sombre,
 * et un croissant de lune argenté disparaissait alors sur du blanc.
 *
 * La correspondance code WMO → glyphe reste déléguée à `getWeatherIcon` :
 * une seule table WMO dans le projet, celle de `lib/weather-codes`.
 */

type Kind =
  | 'sun'
  | 'moon'
  | 'cloud'
  | 'cloud-sun'
  | 'cloud-moon'
  | 'rain'
  | 'drizzle'
  | 'storm'
  | 'fog'
  | 'snow'
  | 'wind'
  | 'unknown';

/** Noms d'icônes Lucide renvoyés par `getWeatherIcon` → glyphe correspondant. */
const KIND_BY_LUCIDE_NAME: Record<string, Kind> = {
  Sun: 'sun',
  Moon: 'moon',
  Cloud: 'cloud',
  CloudSun: 'cloud-sun',
  CloudMoon: 'cloud-moon',
  CloudRain: 'rain',
  CloudDrizzle: 'drizzle',
  CloudLightning: 'storm',
  CloudFog: 'fog',
  CloudSnow: 'snow',
  Snowflake: 'snow',
  Droplets: 'rain',
  Wind: 'wind',
  HelpCircle: 'unknown',
};

type Props = {
  weatherCode?: number | null;
  /** Repli quand aucun code WMO n'est connu : nom d'icône Lucide (« CloudRain »). */
  lucideName?: string;
  /** Jour ou nuit — décide entre soleil et lune. */
  isDay?: boolean;
  size?: number;
  /** Texte alternatif ; sans lui le glyphe est décoratif et masqué. */
  label?: string;
  className?: string;
};

/* Un nuage composé de trois cercles et d'un socle arrondi : plus robuste
   qu'un tracé unique, et la silhouette reste lisible à 20 px. */
function Cloud({ shade = 'var(--wx-cloud, #5c737e)' }: { shade?: string }) {
  return (
    <g fill={shade}>
      <circle cx="9.2" cy="12.4" r="4.2" />
      <circle cx="14.6" cy="13.4" r="3.4" />
      <rect x="5" y="12.6" width="13" height="4.2" rx="2.1" />
    </g>
  );
}

function SunRays({ cx, cy, radius, length }: { cx: number; cy: number; radius: number; length: number }) {
  return (
    <g stroke="var(--wx-sun, #b87a00)" strokeWidth="1.6" strokeLinecap="round">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={cx + Math.cos(rad) * radius}
            y1={cy + Math.sin(rad) * radius}
            x2={cx + Math.cos(rad) * (radius + length)}
            y2={cy + Math.sin(rad) * (radius + length)}
          />
        );
      })}
    </g>
  );
}

/** Croissant obtenu en évidant un disque : aucun tracé d'arc à maintenir. */
function Moon({ cx, cy, r, maskId }: { cx: number; cy: number; r: number; maskId: string }) {
  return (
    <>
      <mask id={maskId}>
        <rect x="0" y="0" width="24" height="24" fill="#fff" />
        <circle cx={cx + r * 0.72} cy={cy - r * 0.66} r={r * 0.98} fill="#000" />
      </mask>
      <circle cx={cx} cy={cy} r={r} fill="var(--wx-moon, #4a6572)" mask={`url(#${maskId})`} />
    </>
  );
}

function Drops() {
  return (
    <g stroke="var(--wx-rain, #2f6f8f)" strokeWidth="1.7" strokeLinecap="round">
      <line x1="8.4" y1="18.6" x2="7.6" y2="21.6" />
      <line x1="12" y1="18.6" x2="11.2" y2="21.6" />
      <line x1="15.6" y1="18.6" x2="14.8" y2="21.6" />
    </g>
  );
}

/* La bruine se distingue de la pluie par des points, pas par des traits plus
   courts : à 26 px, deux longueurs de trait se ressemblaient trop. */
function Sprinkle() {
  return (
    <g fill="var(--wx-rain, #2f6f8f)">
      <circle cx="8.4" cy="19.6" r="1.15" />
      <circle cx="12" cy="21.2" r="1.15" />
      <circle cx="15.6" cy="19.6" r="1.15" />
    </g>
  );
}

function Glyph({ kind, maskId }: { kind: Kind; maskId: string }) {
  switch (kind) {
    case 'sun':
      return (
        <>
          <SunRays cx={12} cy={12} radius={6.4} length={2.6} />
          <circle cx="12" cy="12" r="4.6" fill="var(--wx-sun, #b87a00)" />
        </>
      );

    case 'moon':
      return <Moon cx={12} cy={12} r={7.4} maskId={maskId} />;

    case 'cloud':
      return <Cloud />;

    case 'cloud-sun':
      return (
        <>
          <SunRays cx={15.4} cy={7.4} radius={4.1} length={1.9} />
          <circle cx="15.4" cy="7.4" r="3.2" fill="var(--wx-sun, #b87a00)" />
          <Cloud />
        </>
      );

    case 'cloud-moon':
      return (
        <>
          <Moon cx={15.2} cy={7.2} r={4.6} maskId={maskId} />
          <Cloud />
        </>
      );

    case 'rain':
      return (
        <>
          <Cloud />
          <Drops />
        </>
      );

    case 'drizzle':
      return (
        <>
          <Cloud />
          <Sprinkle />
        </>
      );

    case 'storm':
      return (
        <>
          <Cloud shade="var(--wx-cloud-dim, #79908a)" />
          <path d="M13.9 17.4 10.1 22h2.5l-1 2.1 3.6-4.5h-2.5l1.2-2.2Z" fill="var(--wx-bolt, #b87a00)" />
        </>
      );

    case 'fog':
      return (
        <>
          <Cloud shade="var(--wx-cloud-dim, #79908a)" />
          <g stroke="var(--wx-fog, #5c737e)" strokeWidth="1.7" strokeLinecap="round">
            <line x1="6.4" y1="19.4" x2="16.4" y2="19.4" />
            <line x1="8.8" y1="22.2" x2="18" y2="22.2" />
          </g>
        </>
      );

    case 'snow':
      return (
        <>
          <Cloud />
          <g fill="var(--wx-snow, #5c737e)">
            <circle cx="8.4" cy="20" r="1.3" />
            <circle cx="12" cy="21.4" r="1.3" />
            <circle cx="15.6" cy="20" r="1.3" />
          </g>
        </>
      );

    case 'wind':
      return (
        <g stroke="var(--wx-fog, #5c737e)" strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M3 9h11a3 3 0 1 0-3-3" />
          <path d="M3 15h8a2.6 2.6 0 1 1-2.6 2.6" />
        </g>
      );

    case 'unknown':
    default:
      return (
        <g stroke="var(--wx-cloud-dim, #79908a)" strokeWidth="1.7" strokeLinecap="round" fill="none">
          <circle cx="12" cy="12" r="8.4" />
          <path d="M9.6 9.4a2.6 2.6 0 1 1 3.4 2.5v1.5" />
          <line x1="12.7" y1="16.6" x2="12.7" y2="16.6" />
        </g>
      );
  }
}

export function WeatherGlyph({
  weatherCode,
  lucideName,
  isDay = true,
  size = 24,
  label,
  className,
}: Props) {
  // `useId` : deux glyphes lunaires sur la même page ne doivent pas partager
  // le même masque, sinon le second efface le premier.
  const maskId = `wx-mask-${React.useId()}`;
  const name =
    weatherCode === undefined || weatherCode === null
      ? lucideName ?? 'HelpCircle'
      : getWeatherIcon(weatherCode, isDay ? 12 : 0);
  const kind = KIND_BY_LUCIDE_NAME[name] ?? 'unknown';

  return (
    <svg
      className={className ? `wx-glyph ${className}` : 'wx-glyph'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <Glyph kind={kind} maskId={maskId} />
    </svg>
  );
}
