'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BackgroundSliderProps {
  images: string[];
  interval?: number;
}

export default function BackgroundSlider({ images, interval = 8000 }: BackgroundSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Detect prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Si l'utilisateur préfère moins d'animations, ne pas faire de slider automatique
    if (images.length <= 1 || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval, prefersReducedMotion]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-slate-900/40 z-10" />

      {/* Gradient overlay at the bottom to blend with content */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-gray-900 z-10" />

      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 ${
            prefersReducedMotion
              ? (index === currentIndex ? 'opacity-100' : 'opacity-0')
              : `transition-opacity duration-[2000ms] ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`
          }`}
        >
          <Image
            src={src}
            alt={`Paysage de Guadeloupe ${index + 1}`}
            fill
            priority={index === 0}
            loading={index === 0 ? 'eager' : 'lazy'}
            className="object-cover"
            sizes="100vw"
            quality={index === 0 ? 90 : 75}
            onLoad={() => {
              if (index === 0) setLoaded(true);
            }}
          />
        </div>
      ))}

      {/* Loading indicator pour la première image */}
      {!loaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900 dark:bg-gray-950">
          <div className="w-12 h-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
