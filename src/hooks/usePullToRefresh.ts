
import { useState, useEffect, useRef, useCallback } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
  enabled?: boolean;
}

export const usePullToRefresh = ({ 
  onRefresh, 
  threshold = 70, 
  enabled = true 
}: UsePullToRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setIsVisible(false);
    }
  }, [onRefresh, isRefreshing]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || window.scrollY > 0) return;
    
    touchStartY.current = e.touches[0].clientY;
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || touchStartY.current === 0 || window.scrollY > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - touchStartY.current);
    
    if (distance > 0) {
      e.preventDefault(); // Prevent default scroll behavior
      setPullDistance(distance);
      setIsVisible(true);
    }
  }, [enabled]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || touchStartY.current === 0) return;
    
    if (pullDistance >= threshold) {
      handleRefresh();
    } else {
      setPullDistance(0);
      setIsVisible(false);
    }
    
    touchStartY.current = 0;
  }, [enabled, pullDistance, threshold, handleRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const options = { passive: false };
    
    container.addEventListener('touchstart', handleTouchStart, options);
    container.addEventListener('touchmove', handleTouchMove, options);
    container.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, enabled]);

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    isVisible,
    threshold
  };
};
