
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Loader from '@/components/ui/loader';
import { determineLandingPage } from '@/utils/landingPageRouter';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Only run redirect logic if we're actually on the root path
    if (location.pathname !== '/') {
      console.log('Not on root path, skipping redirect logic');
      return;
    }

    const handleRedirect = async () => {
      const redirectPath = await determineLandingPage();
      window.location.href = redirectPath;
    };

    handleRedirect();
  }, [location.pathname]);

  // Show loading screen while checking
  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto flex items-center justify-center mb-6 animate-scale-in">
          <img 
            src="/lovable-uploads/6cf2c839-5326-4219-9033-549deb1fb03c.png" 
            alt="Yogi Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="mt-6 flex justify-center items-center">
          <Loader size="lg" className="mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default Index;
