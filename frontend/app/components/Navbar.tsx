'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavbarVigilanceWidget } from './NavbarVigilanceWidget';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { href: '/qualite-air', label: "Qualité de l'Air" },
  { href: '/tours-deau', label: "Tours d'Eau" },
  { href: '/meteo', label: 'Météo' },
];

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="w-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-slate-900 dark:to-slate-800 shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Titre */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-white text-xl font-bold hover:text-blue-100 transition-colors"
            >
              Gwad&apos;Alerte
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <NavbarVigilanceWidget />
            <ThemeToggle />

            {/* Liens de navigation */}
            <div className="flex space-x-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-white text-blue-700 shadow-md dark:bg-slate-800 dark:text-blue-400'
                      : 'text-white hover:bg-blue-800 hover:text-blue-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
