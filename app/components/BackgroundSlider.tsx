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

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-slate-900/40 z-10" />

      {/* Gradient overlay at the bottom to blend with content */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 dark:to-gray-900 z-10" />

      {images.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <Image
            src={src}
            alt="Paysage de Guadeloupe"
            fill
            priority={index === 0}
            className="object-cover"
            sizes="100vw"
            quality={90}
            onLoad={() => {
              if (index === 0) setLoaded(true);
            }}
          />
        </div>
      ))}
    </div>
  );
}
