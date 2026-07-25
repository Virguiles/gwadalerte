'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';

const TOOLTIP_WIDTH = 288; // w-72 = 18rem = 288px
const GAP = 8;

interface HelpButtonProps {
  title: string;
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  title,
  content,
  position = 'bottom'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    let left = 0;
    let top = 0;
    switch (position) {
      case 'top':
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        top = rect.top - GAP;
        break;
      case 'bottom':
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        top = rect.bottom + GAP;
        break;
      case 'left':
        left = rect.left - TOOLTIP_WIDTH - GAP;
        top = rect.top + rect.height / 2;
        break;
      case 'right':
        left = rect.right + GAP;
        top = rect.top + rect.height / 2;
        break;
      default:
        left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
        top = rect.bottom + GAP;
    }
    left = Math.max(12, Math.min(left, vw - TOOLTIP_WIDTH - 12));
    if (position === 'top' || position === 'bottom') {
      const tooltipHeight = 120;
      if (position === 'top') {
        top = Math.max(12, top - tooltipHeight);
      } else {
        top = Math.min(vh - tooltipHeight - 12, top);
      }
    } else {
      top = Math.max(12, Math.min(top, vh - 150));
    }
    setCoords({ left, top });
  };

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    updatePosition();
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(buttonRef.current);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, position]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => { setIsOpen(false); setCoords(null); }, 200)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label={`Aide: ${title}`}
        aria-expanded={isOpen}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[9999] w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
          role="dialog"
          aria-labelledby="help-title"
          aria-modal="true"
          style={{ left: coords.left, top: coords.top }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 id="help-title" className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
            <button
              onClick={() => { setIsOpen(false); setCoords(null); }}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Fermer l'aide"
            >
              <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {content}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
