'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavbarVigilanceWidget, VigilanceBadge } from './NavbarVigilanceWidget';
import { ThemeToggle } from './ThemeToggle';

const NAV_LINKS = [
  { href: '/meteo', label: 'Météo' },
  { href: '/tours-deau', label: "Tours d'Eau" },
  { href: '/qualite-air', label: "Qualité de l'Air" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
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
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Aller au contenu principal
      </a>

      <nav className={getNavbarClasses()}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo / Titre avec pastille de vigilance mobile */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Link
                href="/"
                className={`text-lg md:text-xl font-bold transition-colors ${isHomePage
                  ? 'text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-100'
                  : 'text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                onClick={handleLinkClick}
              >
                Gwad&apos;Alerte
              </Link>
              <VigilanceBadge />
            </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Navigation Links */}
            <div className="flex space-x-1">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all ${active
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
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NavbarVigilanceWidget />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMobileMenuOpen}
              aria-label="Menu principal"
            >
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu with animation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden border-t border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                exit={{ y: -10 }}
                transition={{ duration: 0.2 }}
                className="px-2 pt-2 pb-3 space-y-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md"
              >
                {NAV_LINKS.map((link, index) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        onClick={handleLinkClick}
                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          active
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: NAV_LINKS.length * 0.05, duration: 0.2 }}
                  className="pt-2 border-t border-slate-200 dark:border-slate-700"
                >
                  <div className="flex justify-center">
                    <NavbarVigilanceWidget />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
    </>
  );
}
