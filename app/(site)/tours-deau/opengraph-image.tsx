import { renderOgImage, size, contentType } from '@/lib/og';

export { size, contentType };
export const alt = "Tours d'eau en Guadeloupe : planning des coupures programmées";

export default function Image() {
  return renderOgImage({
    title: "Tours d'Eau",
    subtitle: 'Le planning des coupures d’eau programmées, commune par commune.',
    sources: 'SMGEAG',
    accent: '#06b6d4',
  });
}
