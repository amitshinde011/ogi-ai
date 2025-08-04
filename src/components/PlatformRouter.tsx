import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import Landing from '@/pages/Landing';
import Index from '@/pages/Index';
import Loader from '@/components/ui/loader';

const PlatformRouter = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isNativePlatform, setIsNativePlatform] = useState(false);

  useEffect(() => {
    const detectPlatform = () => {
      const platform = Capacitor.getPlatform();
      const isNative = Capacitor.isNativePlatform();
      
      console.log('Platform detected:', platform, 'Is native:', isNative);
      
      setIsNativePlatform(isNative);
      setIsLoading(false);
    };

    detectPlatform();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Native platforms (iOS/Android) -> Index (app entry point)
  if (isNativePlatform) {
    return <Index />;
  }

  // Web platform -> Landing (marketing page)
  return <Landing />;
};

export default PlatformRouter;