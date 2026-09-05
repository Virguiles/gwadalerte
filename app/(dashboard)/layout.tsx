import type { Metadata, Viewport } from 'next';
import { Poppins, IBM_Plex_Mono } from 'next/font/google';
import { DataProvider } from '@/app/providers/DataProvider';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import './dashboard.css';

/**
 * Layout du tableau de bord, qui est aussi la page d'accueil.
 *
 * Séparé de celui des pages légales : pas de navbar, pas de pied de page, pas
 * de Tailwind — le tableau de bord occupe toute la fenêtre.
 */

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gwadalerte.com'),
  title: "Gwad'Alerte — qualité de l'air, météo et tours d'eau en Guadeloupe",
  description:
    "Qualité de l'air, météo, vigilance et tours d'eau des 32 communes de Guadeloupe, sur une seule carte.",
  keywords: [
    'Guadeloupe',
    "qualité de l'air",
    "tours d'eau",
    'météo',
    'vigilance',
    'ATMO',
    'coupures eau',
    'SMGEAG',
  ],
  openGraph: {
    title: "Gwad'Alerte — informations environnementales Guadeloupe",
    description:
      "Qualité de l'air, météo, vigilance et tours d'eau des 32 communes de Guadeloupe, sur une seule carte.",
    url: 'https://gwadalerte.com',
    siteName: "Gwad'Alerte",
    locale: 'fr_FR',
    type: 'website',
  },
  alternates: { canonical: 'https://gwadalerte.com' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Sans ça, la barre du navigateur mobile restait claire sur le thème sombre.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef3f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1413' },
  ],
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${poppins.variable} ${plexMono.variable} dashboard-body`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DataProvider>{children}</DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
