import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X } from 'lucide-react';

export type TooltipAnchor = 'center' | 'left' | 'right' | 'none';

interface TooltipContainerProps {
  position: { left: number; top: number };
  onClose: () => void;
  children: React.ReactNode;
  anchor?: TooltipAnchor;
  className?: string;
  style?: React.CSSProperties;
  width?: string | number;
  transparent?: boolean;
}

export const TooltipContainer = forwardRef<HTMLDivElement, TooltipContainerProps>(({
  position,
  onClose,
  children,
  anchor = 'none',
  className = '',
  style = {},
  width = '300px',
  transparent = false,
}, ref) => {
  const internalRef = useRef<HTMLDivElement>(null);

  // Combine refs
  useImperativeHandle(ref, () => internalRef.current as HTMLDivElement);

  // Calcul du transform CSS selon l'ancrage
  let transform = 'none';
  const gap = 20;

  if (anchor === 'center') {
    transform = 'translate(-50%, -50%)';
  } else if (anchor === 'left') {
    transform = `translate(calc(-100% - ${gap}px), -50%)`;
  } else if (anchor === 'right') {
    transform = `translate(${gap}px, -50%)`;
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const currentRef = internalRef.current;
      if (currentRef && !currentRef.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const backgroundClass = transparent ? '' : 'bg-white/95 backdrop-blur-md';

  return (
    <div
      ref={internalRef}
      className={`fixed z-50 flex flex-col ${backgroundClass} rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border transition-all duration-200 pointer-events-auto ${className}`}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: width,
        maxHeight: 'min(500px, calc(100vh - 40px))',
        animation: 'tooltip-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: transform,
        ...style,
      }}
    >
        {children}
    </div>
  );
});

TooltipContainer.displayName = 'TooltipContainer';


interface TooltipHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export const TooltipHeader: React.FC<TooltipHeaderProps> = ({
    title,
    subtitle,
    onClose,
    className = '',
    style = {},
    children
}) => {
    return (
        <div
            className={`flex items-center justify-between px-4 py-3 rounded-t-xl shadow-sm ${className}`}
            style={style}
        >
            <div className="flex flex-col min-w-0">
                {subtitle && <span className="text-[10px] font-medium uppercase tracking-wider opacity-90">{subtitle}</span>}
                <span className="text-lg font-bold truncate leading-tight" title={title}>{title}</span>
                {children}
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="ml-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white/50 flex-shrink-0"
                aria-label="Fermer"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
