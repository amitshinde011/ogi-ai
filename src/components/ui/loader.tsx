import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2', 
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-4'
  };

  return (
    <div 
      className={cn(
        'border-primary border-t-transparent rounded-full animate-spin inline-block',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Loader;