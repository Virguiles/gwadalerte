'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="w-full bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Titre */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white text-xl font-bold hover:text-blue-100 transition-colors">
              Gwad&apos;Alerte
            </Link>
          </div>

          {/* Liens de navigation */}
          <div className="flex space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/')
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'text-white hover:bg-blue-800 hover:text-blue-100'
              }`}
            >
              Qualité de l&apos;Air
            </Link>
            <Link
              href="/tours-deau"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isActive('/tours-deau')
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'text-white hover:bg-blue-800 hover:text-blue-100'
              }`}
            >
              Tours d&apos;Eau
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
