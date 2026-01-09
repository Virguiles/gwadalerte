import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HoverInfo } from '../GuadeloupeMap';
import { ALL_COMMUNES } from '../../meteo/constants';

interface CommuneTooltipProps {
  hoveredInfo: HoverInfo | null;
}

export const CommuneTooltip: React.FC<CommuneTooltipProps> = ({ hoveredInfo }) => {
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const updatePositionRef = useRef<() => void>();
  const initialRelativePositionRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!hoveredInfo || typeof document === 'undefined') {
      setPosition(null);
      setContainer(null);
      initialRelativePositionRef.current = null;
      containerRef.current = null;
      if (updatePositionRef.current) {
        window.removeEventListener('scroll', updatePositionRef.current, true);
        window.removeEventListener('resize', updatePositionRef.current);
      }
      return;
    }

    // Trouver le conteneur du SVG
    let mapContainer: HTMLElement | null = null;

    if (hoveredInfo.element) {
      // Obtenir le SVG parent
      const svgElement = hoveredInfo.element.ownerSVGElement ||
                        (hoveredInfo.element.tagName === 'svg' ? hoveredInfo.element as SVGElement : null) ||
                        hoveredInfo.element.closest('svg');

      if (svgElement && svgElement.parentElement) {
        // Chercher le conteneur parent qui a position relative ou qui est le conteneur de la carte
        let parent = svgElement.parentElement;
        while (parent && parent !== document.body) {
          const style = window.getComputedStyle(parent);
          // Chercher un conteneur avec position relative ou qui contient la carte
          if (style.position === 'relative' ||
              parent.classList.contains('relative') ||
              parent.hasAttribute('data-map-container')) {
            mapContainer = parent;
            break;
          }
          parent = parent.parentElement;
        }

        // Si on n'a pas trouvé, utiliser le parent direct du SVG
        if (!mapContainer) {
          mapContainer = svgElement.parentElement;
        }
      }
    }

    // Si on n'a toujours pas trouvé, chercher dans le DOM
    if (!mapContainer) {
      const svg = document.querySelector('svg');
      if (svg && svg.parentElement) {
        mapContainer = svg.parentElement;
      }
    }

    if (mapContainer) {
      containerRef.current = mapContainer;
      setContainer(mapContainer);

      // Calculer la position relative au conteneur au moment du clic
      const containerRect = mapContainer.getBoundingClientRect();
      const relativeX = hoveredInfo.x - containerRect.left;
      const relativeY = hoveredInfo.y - containerRect.top;

      // Stocker la position relative initiale
      initialRelativePositionRef.current = { x: relativeX, y: relativeY };
      setPosition({ left: relativeX, top: relativeY - 10 });

      // Fonction pour mettre à jour la position lors du scroll
      // La position relative ne change pas, donc on la garde constante
      // Le tooltip restera fixe sur le SVG grâce à position: absolute
      const updatePosition = () => {
        if (!mapContainer || !initialRelativePositionRef.current) return;

        // La position relative reste constante, ce qui fait que le tooltip
        // reste fixe sur le SVG même quand on scroll
        setPosition({
          left: initialRelativePositionRef.current.x,
          top: initialRelativePositionRef.current.y - 10
        });
      };

      // Écouter les événements de scroll et resize pour mettre à jour la position
      updatePositionRef.current = updatePosition;
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    } else {
      // Fallback: utiliser position fixed si on ne trouve pas le conteneur
      setPosition({ left: hoveredInfo.x, top: hoveredInfo.y - 10 });
      setContainer(document.body);
      initialRelativePositionRef.current = null;
      containerRef.current = null;
    }

    return () => {
      if (updatePositionRef.current) {
        window.removeEventListener('scroll', updatePositionRef.current, true);
        window.removeEventListener('resize', updatePositionRef.current);
      }
    };
  }, [hoveredInfo]);

  if (!hoveredInfo || !position || typeof document === 'undefined') return null;

  const communeName = ALL_COMMUNES[hoveredInfo.data.code_zone || ''] || hoveredInfo.data.lib_zone || hoveredInfo.data.code_zone;

  const tooltipElement = (
    <div
      className="pointer-events-none z-[9999] bg-black/80 text-white text-xs px-2 py-1 rounded shadow-lg transform -translate-x-1/2 -translate-y-full"
      style={{
        position: container === document.body ? 'fixed' : 'absolute',
        left: `${position.left}px`,
        top: `${position.top}px`
      }}
    >
      {communeName}
    </div>
  );

  return createPortal(tooltipElement, container || document.body);
};
