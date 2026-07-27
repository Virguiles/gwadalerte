import { renderOgImage, size, contentType } from '@/lib/og';

export { size, contentType };
export const alt = "Qualité de l'air en Guadeloupe : indice ATMO et polluants";

export default function Image() {
  return renderOgImage({
    title: "Qualité de l'Air",
    subtitle: 'Indice ATMO, polluants et recommandations sanitaires par commune.',
    sources: "Gwad'Air",
    accent: '#14b8a6',
  });
}
