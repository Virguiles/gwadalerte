import type { Metadata } from 'next';
import { Poppins, IBM_Plex_Mono } from 'next/font/google';
import { DataProvider } from '@/app/providers/DataProvider';
import './dashboard/dashboard.css';

/**
 * Layout racine de la refonte.
 *
 * Volontairement séparé de celui du site : pas de navbar, pas de pied de
 * page, pas de Tailwind — le tableau de bord occupe toute la fenêtre.
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
  title: "Gwad'Alerte — tableau de bord",
  description:
    "Qualité de l'air, météo, vigilance et tours d'eau des 32 communes de Guadeloupe, sur une seule carte.",
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${poppins.variable} ${plexMono.variable} dashboard-body`}>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
