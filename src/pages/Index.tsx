
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';

const Index = () => {
  const navigate = useNavigate();
  const { onboardingState, loading } = useOnboarding();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const redirectAttempted = useRef(false);

  useEffect(() => {
    // Prevent multiple redirect attempts
    if (redirectAttempted.current || hasRedirected || loading) {
      return;
    }

    const performRedirect = async () => {
      redirectAttempted.current = true;
      
      try {
        console.log('Checking user authentication and onboarding state...');
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          setRedirectError('Authentication error');
          setHasRedirected(true);
          navigate('/login', { replace: true });
          return;
        }

        if (!user) {
          console.log('No user found, redirecting to login');
          setHasRedirected(true);
          navigate('/login', { replace: true });
          return;
        }

        console.log('User found:', user.id);
        console.log('Onboarding state:', onboardingState);

        if (!onboardingState) {
          console.log('No onboarding state, redirecting to profile setup');
          setHasRedirected(true);
          navigate('/profile-setup', { replace: true });
          return;
        }

        // Navigate based on onboarding progress
        if (!onboardingState.profile_completed) {
          console.log('Profile not completed, redirecting to profile setup');
          setHasRedirected(true);
          navigate('/profile-setup', { replace: true });
        } else if (!onboardingState.subscription_selected) {
          console.log('Subscription not selected, redirecting to subscriptions');
          setHasRedirected(true);
          navigate('/subscriptions', { replace: true });
        } else if (!onboardingState.intro_video_watched) {
          console.log('Intro video not watched, redirecting to intro video');
          setHasRedirected(true);
          navigate('/intro-video', { replace: true });
        } else if (!onboardingState.before_assessment_completed) {
          console.log('Before assessment not completed, redirecting to before assessment');
          setHasRedirected(true);
          navigate('/before-assessment', { replace: true });
        } else if (!onboardingState.journey_started) {
          console.log('Journey not started, redirecting to journey start');
          setHasRedirected(true);
          navigate('/journey-start', { replace: true });
        } else {
          console.log('All onboarding completed, redirecting to home');
          setHasRedirected(true);
          // Use window.location as a fallback if navigate doesn't work
          try {
            navigate('/home', { replace: true });
            // Add a timeout fallback in case navigate fails
            setTimeout(() => {
              if (window.location.pathname === '/') {
                console.log('Navigate failed, using window.location fallback');
                window.location.replace('/home');
              }
            }, 100);
          } catch (navError) {
            console.error('Navigate error:', navError);
            window.location.replace('/home');
          }
        }
      } catch (error) {
        console.error('Error in redirect logic:', error);
        setRedirectError('Redirect error occurred');
        setHasRedirected(true);
        navigate('/login', { replace: true });
      }
    };

    performRedirect();
  }, [loading, onboardingState, navigate, hasRedirected]);

  // If we've already redirected, don't render anything
  if (hasRedirected) {
    return null;
  }

  // Show error state if there's a redirect error
  if (redirectError) {
    return (
      <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
            <span className="text-4xl text-white">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-stone mb-2">Error</h1>
          <p className="text-stone/70 mb-4">{redirectError}</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-sage text-white px-6 py-2 rounded-lg hover:bg-sage/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading screen while checking
  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-sage rounded-full mx-auto flex items-center justify-center mb-6 animate-scale-in shadow-lg">
          <span className="text-4xl text-white">🧘</span>
        </div>
        <h1 className="text-3xl font-bold text-stone mb-2 animate-fade-in">Yogi-ai</h1>
        <p className="text-stone/70 animate-fade-in">Track Your Meals. Share the Journey.</p>
        <div className="mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
