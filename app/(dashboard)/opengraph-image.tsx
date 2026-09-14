import { renderOgImage, size, contentType } from '@/lib/og';

export { size, contentType };
export const alt = "Gwad'Alerte - Tableau de bord environnemental de la Guadeloupe";

export default function Image() {
  return renderOgImage({
    title: 'Eau, Air, Météo',
    subtitle: 'Le tableau de bord citoyen pour surveiller la Guadeloupe en temps réel.',
    sources: "Gwad'Air · Météo-France · Orisk",
    accent: '#3b82f6',
  });
}
