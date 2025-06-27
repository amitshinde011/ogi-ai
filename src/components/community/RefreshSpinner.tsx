
import React from 'react';
import { Loader2 } from 'lucide-react';

interface RefreshSpinnerProps {
  isVisible: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  threshold: number;
}

export const RefreshSpinner: React.FC<RefreshSpinnerProps> = ({
  isVisible,
  pullDistance,
  isRefreshing,
  threshold
}) => {
  if (!isVisible && !isRefreshing) return null;

  const opacity = isRefreshing ? 1 : Math.min(pullDistance / threshold, 1);
  const scale = isRefreshing ? 1 : Math.min(0.5 + (pullDistance / threshold) * 0.5, 1);
  const translateY = isRefreshing ? 0 : Math.min(pullDistance * 0.5, 40);

  return (
    <div 
      className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-4"
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transition: isRefreshing ? 'opacity 0.3s ease, transform 0.3s ease' : 'none'
      }}
    >
      <div className="bg-white rounded-full p-2 shadow-lg">
        <Loader2 
          className={`w-6 h-6 text-sage ${isRefreshing ? 'animate-spin' : ''}`}
          strokeWidth={2}
        />
      </div>
    </div>
  );
};
