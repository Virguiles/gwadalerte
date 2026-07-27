import { renderOgImage, size, contentType } from '@/lib/og';

export { size, contentType };
export const alt = 'Météo et vigilance en Guadeloupe, commune par commune';

export default function Image() {
  return renderOgImage({
    title: 'Météo & Vigilance',
    subtitle: 'Prévisions par commune et niveaux de vigilance officiels.',
    sources: 'Météo-France · Open-Meteo',
    accent: '#0ea5e9',
  });
}
