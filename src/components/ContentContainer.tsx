import React from 'react';
import { cn } from '@/lib/utils';

interface ContentContainerProps {
  children: React.ReactNode;
  variant?: 'narrow' | 'wide' | 'full';
  className?: string;
}

const ContentContainer = ({ 
  children, 
  variant = 'narrow', 
  className 
}: ContentContainerProps) => {
  const getMaxWidth = () => {
    switch (variant) {
      case 'narrow':
        return 'max-w-md'; // 28rem (~448px) - for mobile-first content like home, profile
      case 'wide':
        return 'max-w-2xl'; // 42rem (~672px) - for content that needs more space like community
      case 'full':
        return 'max-w-6xl'; // 72rem (~1152px) - for full-width layouts
      default:
        return 'max-w-md';
    }
  };

  return (
    <div className={cn(
      'w-full mx-auto px-4 sm:px-6',
      getMaxWidth(),
      className
    )}>
      {children}
    </div>
  );
};

export default ContentContainer;