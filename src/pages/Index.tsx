
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

    // Email auth callback: if Supabase redirected here after signup/magic link, send to /progress
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const isEmailAuthCallback = hash.includes('type=signup') || hash.includes('type=magiclink') || hash.includes('access_token');
    if (isEmailAuthCallback && !hasRedirected) {
      console.log('Index: Email auth callback detected, redirecting to /progress');
      hasRedirected = true;
      timeoutId = setTimeout(() => {
        navigate('/progress', { replace: true });
      }, 100);
      return;
    }

    const handleRedirect = async () => {
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
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center">
          <div className="w-28 h-28 mx-auto flex items-center justify-center mb-6 animate-scale-in">
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
    </>
  );
};

export default Index;
