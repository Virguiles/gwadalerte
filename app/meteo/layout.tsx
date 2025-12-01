import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Météo Guadeloupe & Vigilance - Prévisions par Commune',
  description: 'Consultez la météo en direct et les niveaux de vigilance Météo France pour toutes les communes de Guadeloupe. Carte interactive, risques inondations et vents.',
  keywords: ['Météo Guadeloupe', 'Vigilance Météo France', 'Cyclone Guadeloupe', 'Pluie inondation', 'Onde tropicale', 'Prévisions Guadeloupe'],
  openGraph: {
    title: 'Météo Guadeloupe & Vigilance',
    description: 'Carte interactive des vigilances et météo temps réel en Guadeloupe.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'GwadaSVG Météo',
  },
};

export default function MeteoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
