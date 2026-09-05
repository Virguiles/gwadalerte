import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { ThemeToggle } from '@/app/components/ThemeToggle';

/**
 * Layout des deux pages de texte : mentions légales et crédits.
 *
 * Il n'y a plus de barre de navigation : elle desservait /meteo, /qualite-air
 * et /tours-deau, qui redirigent désormais vers l'accueil. Deux pages statiques
 * n'ont besoin que d'un retour au tableau de bord.
 *
 * Largeur unique `max-w-xl` pour l'en-tête, le contenu et le pied de page :
 * mesurée à ~78 caractères par ligne dans la police du site, dans la fourchette
 * 60–80 de lisibilité. `max-w-4xl` en donnait 104, et l'en-tête et le pied de
 * page étaient par ailleurs à une autre largeur, donc désalignés.
 *
 * Pas de DataProvider non plus : ces pages n'affichent aucune donnée, et la
 * vigilance était chargée sur toutes les pages uniquement pour l'ancien
 * bandeau de la navbar.
 *
 * Plus de Google Analytics non plus : il ne tournait que sur ces deux pages,
 * jamais sur le tableau de bord, et le bandeau de consentement — qui, lui,
 * n'existe que sur le tableau de bord — affirmait qu'aucune donnée n'était
 * collectée. Le site ne mesure donc plus rien au-delà des relevés d'hébergement.
 */

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://gwadalerte.com'),
  title: "Gwad'Alerte",
  description: "Informations légales et sources de données de Gwad'Alerte.",
};

// Le layout du tableau de bord en exporte un ; celui-ci n'en avait pas, et la
// barre du navigateur mobile restait claire sur le thème sombre. Mêmes valeurs
// des deux côtés : c'est `--ink` dans chaque thème.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef3f1' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1413' },
  ],
};

export default function LegalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* L'ancre `#main-content` existait, le lien d'évitement manquait —
              le tableau de bord, lui, en a un. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
          >
            Aller au contenu
          </a>

          <header className="border-b border-border">
            <div className="max-w-xl mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <Link href="/" className="text-sm font-medium text-foreground hover:underline">
                ← Gwad&apos;Alerte
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <main id="main-content">{children}</main>

          <footer className="border-t border-border">
            <div className="max-w-xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6">
              <span>© {new Date().getFullYear()} Gwad&apos;Alerte</span>
              <span className="flex gap-4">
                <Link
                  href="/mentions-legales"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Mentions légales
                </Link>
                <Link href="/credits" className="underline underline-offset-2 hover:text-foreground">
                  Crédits
                </Link>
                <a
                  href="https://virgile.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Contact
                </a>
              </span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
