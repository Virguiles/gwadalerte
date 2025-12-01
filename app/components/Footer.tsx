import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-950 border-t border-slate-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-10">
          {/* Section 1: Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Gwad&apos;Alerte
            </h3>
            <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              Le tableau de bord citoyen en Guadeloupe.
            </p>
          </div>

          {/* Section 2: Liens Utiles */}
          <div className="space-y-4">

            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link
                  href="/credits"
                  className="text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  Crédits & Sources
                </Link>
              </li>
              <li>
                <Link
                  href="https://virgile.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Localisation */}
          <div className="space-y-4">

            <div className="flex items-start gap-2 text-slate-600 dark:text-gray-400 text-sm">
              <MapPin className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="leading-relaxed">
                Guadeloupe, France
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 dark:text-gray-500 text-sm text-center md:text-left">
              © {currentYear} Gwad&apos;Alerte. Tous droits réservés.
            </p>
            <div className="text-sm text-slate-500 dark:text-gray-500">
              <span>Par </span>
              <Link
                href="https://virgile.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-300 dark:hover:to-cyan-300 transition-all duration-200"
              >
                Virgile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
