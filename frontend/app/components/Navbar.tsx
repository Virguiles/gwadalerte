'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NavbarVigilanceWidget } from './NavbarVigilanceWidget';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { href: '/qualite-air', label: "Qualité de l'Air" },
  { href: '/tours-deau', label: "Tours d'Eau" },
  { href: '/meteo', label: 'Météo' },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const getNavbarClasses = () => {
    const baseClasses = 'fixed top-0 w-full z-50 transition-all duration-300 border-b';
    const blurClass = isScrolled ? 'dark:backdrop-blur-md' : 'dark:backdrop-blur-none';

    if (isHomePage) {
      return `${baseClasses} bg-white/90 dark:bg-white/5 backdrop-blur-md ${blurClass} shadow-sm border-slate-200/50 dark:border-white/10`;
    }
    return `${baseClasses} bg-white/80 dark:bg-slate-900/80 backdrop-blur-md ${blurClass} shadow-sm border-slate-200 dark:border-slate-800`;
  };

  return (
    <nav className={getNavbarClasses()}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Titre */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className={`text-xl font-bold transition-colors ${isHomePage
                ? 'text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-100'
                : 'text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
                }`}
            >
              Gwad&apos;Alerte
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            <div className="flex space-x-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active
                      ? isHomePage
                        ? 'bg-blue-100 text-blue-700 dark:bg-white/20 dark:text-white backdrop-blur-md'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : isHomePage
                        ? 'text-slate-700 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            {/* Widgets aligned right */}
            <div className="flex items-center gap-2 ml-auto">
              <ThemeToggle />
              <NavbarVigilanceWidget />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
