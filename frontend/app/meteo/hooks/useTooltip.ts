import { useState, useCallback, useRef, useEffect } from 'react';
import { HoverInfo, CommuneData } from '../../components/GuadeloupeMap';
import { WeatherDataMap, VigilanceLevelInfo } from '../types';
import { ALL_COMMUNES } from '../constants';

export function useTooltip(
  weatherData: WeatherDataMap,
  currentVigilanceInfo: VigilanceLevelInfo,
  selectedCommune: string,
  setSelectedCommune: (code: string) => void
) {
  const [tooltip, setTooltip] = useState<HoverInfo | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculateTooltipPosition = useCallback((mouseX: number, mouseY: number) => {
    if (typeof window === 'undefined') return { left: mouseX, top: mouseY };

    const tooltipElement = tooltipRef.current;
    let tooltipWidth = 300;
    let tooltipHeight = 450;

    if (tooltipElement) {
      const rect = tooltipElement.getBoundingClientRect();
      tooltipWidth = rect.width || tooltipWidth;
      tooltipHeight = rect.height || tooltipHeight;
    } else {
      if (window.innerWidth < 640) {
        tooltipWidth = 280;
      } else if (window.innerWidth < 768) {
        tooltipWidth = 300;
      }
    }

    const margin = 16;
    const offset = 16;

    let left = mouseX + offset;
    let top = mouseY + offset;

    if (left + tooltipWidth + margin > window.innerWidth) {
      left = mouseX - tooltipWidth - offset;
    }
    if (left < margin) {
      left = margin;
    }
    if (top + tooltipHeight + margin > window.innerHeight) {
      top = mouseY - tooltipHeight - offset;
    }
    if (top < margin) {
      top = margin;
    }
    if (left + tooltipWidth > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - tooltipWidth - margin);
    }
    if (top + tooltipHeight > window.innerHeight - margin) {
      top = Math.max(margin, window.innerHeight - tooltipHeight - margin);
    }

    return { left, top };
  }, []);

  const showSelectedCommuneTooltip = useCallback(() => {
    if (typeof window === 'undefined' || !selectedCommune) {
      return false;
    }

    const weather = weatherData[selectedCommune];
    const communeName = ALL_COMMUNES[selectedCommune] || weather?.lib_zone || selectedCommune;

    const communePayload: CommuneData = (weather
      ? {
          ...weather,
          lib_zone: communeName,
          code_zone: selectedCommune,
          lib_qual: currentVigilanceInfo.label,
          coul_qual: currentVigilanceInfo.color,
        }
      : {
          lib_zone: communeName,
          code_zone: selectedCommune,
          lib_qual: currentVigilanceInfo.label,
          coul_qual: currentVigilanceInfo.color,
        }) as unknown as CommuneData;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight > 900 ? 220 : 140;

    setTooltip({
      x: centerX,
      y: centerY,
      data: communePayload,
    });

    return true;
  }, [selectedCommune, weatherData, currentVigilanceInfo]);

  const handleCommuneHover = useCallback((info: HoverInfo) => {
    const code_zone = info.data.code_zone;
    if (!code_zone) return;

    const communeName = ALL_COMMUNES[code_zone] || info.data.lib_zone || code_zone;
    const communeWeather = weatherData[code_zone];

    if (communeWeather) {
      setTooltip({
        x: info.x,
        y: info.y,
        data: {
          ...communeWeather,
          lib_zone: communeName,
          lib_qual: currentVigilanceInfo.label,
          coul_qual: currentVigilanceInfo.color,
        } as unknown as CommuneData,
      });
    } else {
      setTooltip({
        x: info.x,
        y: info.y,
        data: {
          lib_zone: communeName,
          code_zone: code_zone,
          lib_qual: currentVigilanceInfo.label,
          coul_qual: currentVigilanceInfo.color,
        } as unknown as CommuneData,
      });
    }
  }, [weatherData, currentVigilanceInfo]);

  const handleTooltipClose = useCallback(() => {
    setTooltip(null);
    setSelectedCommune('');
  }, [setSelectedCommune]);

  useEffect(() => {
    if (tooltip) {
      const initialPosition = calculateTooltipPosition(tooltip.x, tooltip.y);
      setTooltipPosition(initialPosition);

      requestAnimationFrame(() => {
        if (tooltipRef.current) {
          const position = calculateTooltipPosition(tooltip.x, tooltip.y);
          setTooltipPosition(position);
        }
      });
    }
  }, [tooltip, calculateTooltipPosition]);

  useEffect(() => {
      const handleResize = () => {
        if (tooltip) {
          const position = calculateTooltipPosition(tooltip.x, tooltip.y);
          setTooltipPosition(position);
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [tooltip, calculateTooltipPosition]);

  return {
    tooltip,
    tooltipPosition,
    tooltipRef,
    handleCommuneHover,
    handleTooltipClose,
    showSelectedCommuneTooltip,
    setTooltip // needed to reset when leaving map if not selected
  };
}
