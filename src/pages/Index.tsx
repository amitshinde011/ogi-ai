
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from '@/components/ui/loader';
import { determineLandingPage } from '@/utils/determineLandingPage';
import { IMAGES } from '@/constants/images';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let fallbackTimeoutId: NodeJS.Timeout;
    let hasRedirected = false;
    
    // Only run redirect logic if we're actually on the root path
    if (location.pathname !== '/') {
      console.log('Not on root path, skipping redirect logic');
      return;
    }

    // Wait for auth to be resolved
    if (authLoading) {
      console.log('Still loading auth state...');
      
      // Fallback timeout to prevent infinite loading
      fallbackTimeoutId = setTimeout(() => {
        if (!hasRedirected) {
          console.log('Auth loading timeout reached, redirecting to login');
          hasRedirected = true;
          navigate('/login', { replace: true });
        }
      }, 10000); // 10 second timeout
      
      return () => {
        if (fallbackTimeoutId) {
          clearTimeout(fallbackTimeoutId);
        }
      };
    }

    const handleRedirect = async () => {
      // Prevent multiple redirects
      if (hasRedirected) {
        console.log('Redirect already handled, skipping');
        return;
      }

      try {
        console.log('Index: Checking redirect with auth state:', { 
          userId: user?.id, 
          isAuthenticated, 
          userExists: !!user 
        });
        
        const redirectPath = await determineLandingPage(user?.id, isAuthenticated);
        console.log('Index: Received redirect path:', redirectPath);
        
        if (!redirectPath) {
          console.error('Index: No redirect path received, falling back to login');
          hasRedirected = true;
          navigate('/login', { replace: true });
          return;
        }
        
        // Mark as redirected before navigation
        hasRedirected = true;
        
        // Add a small delay to prevent rapid redirects
        timeoutId = setTimeout(() => {
          console.log('Index: Executing navigation to:', redirectPath);
          navigate(redirectPath, { replace: true });
        }, 100);
      } catch (error) {
        console.error('Error during redirect:', error);
        // Fallback redirect
        if (!hasRedirected) {
          hasRedirected = true;
          navigate('/login', { replace: true });
        }
      }
    };

    handleRedirect();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId);
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
