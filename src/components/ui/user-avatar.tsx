
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  userId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-10 w-10',
  xl: 'h-16 w-16'
};

export const UserAvatar = ({ 
  src, 
  alt = 'User avatar', 
  fallbackText,
  userId,
  className,
  size = 'lg'
}: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate fallback avatar URL using DiceBear if we have a userId
  const fallbackAvatarUrl = userId 
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`
    : null;
  
  // Determine which image to use
  const imageUrl = !imageError && src ? src : fallbackAvatarUrl;
  
  // Generate fallback text from alt or first letter
  const fallbackInitial = fallbackText || alt?.charAt(0)?.toUpperCase() || 'U';
  
  console.log('🖼️ UserAvatar: Rendering with:', {
    originalSrc: src,
    fallbackUrl: fallbackAvatarUrl,
    finalUrl: imageUrl,
    fallbackText: fallbackInitial,
    imageError
  });

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {imageUrl && (
        <AvatarImage 
          src={imageUrl}
          alt={alt}
          onError={() => {
            console.log('❌ UserAvatar: Image failed to load:', imageUrl);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('✅ UserAvatar: Image loaded successfully:', imageUrl);
          }}
        />
      )}
      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
        {fallbackInitial}
      </AvatarFallback>
    </Avatar>
  );
};
