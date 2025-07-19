import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '@/components/ui/loader';
import { IMAGES } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // 1. Wait until the authentication state is fully resolved.
    //    While authLoading is true, the component will just show the loader UI.
    if (authLoading) {
      return; // Do nothing until loading is finished.
    }

    // 2. Once loading is false, make a navigation decision.
    if (isAuthenticated && user) {
      // User is authenticated, go to the main app.
      navigate('/home', { replace: true });
    } else {
      // User is not authenticated, go to the login page.
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Always show a loading screen while the useEffect hook determines where to go.
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