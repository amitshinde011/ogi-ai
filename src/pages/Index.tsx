
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from '@/components/ui/loader';
import { determineLandingPage } from '@/utils/landingPageRouter';
import { IMAGES } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Only run redirect logic if we're actually on the root path
    if (location.pathname !== '/') {
      console.log('Not on root path, skipping redirect logic');
      return;
    }

    // Wait for auth to be resolved
    if (authLoading) {
      console.log('Still loading auth state...');
      return;
    }

    const handleRedirect = async () => {
      try {
        // Use cached auth state to avoid additional API calls
        const redirectPath = await determineLandingPage(user?.id, isAuthenticated);
        console.log('Redirecting to:', redirectPath);
        
        // Add a small delay to prevent rapid redirects
        timeoutId = setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 100);
      } catch (error) {
        console.error('Error during redirect:', error);
        // Fallback redirect
        navigate('/login', { replace: true });
      }
    };

    handleRedirect();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [location.pathname, user?.id, authLoading, isAuthenticated, navigate]);

  // Show loading screen while checking
  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto flex items-center justify-center mb-6 animate-scale-in">
          <img 
            src={IMAGES.LOGO_VARIANT} 
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
