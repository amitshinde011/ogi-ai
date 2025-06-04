
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';

const Index = () => {
  const navigate = useNavigate();
  const { onboardingState, loading } = useOnboarding();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Only run the check once when component mounts or when loading state changes
    if (!hasChecked && !loading) {
      checkUserAndRedirect();
    }
  }, [loading, hasChecked]);

  const checkUserAndRedirect = async () => {
    try {
      console.log('Checking user authentication and onboarding state...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('User found:', user.id);
      console.log('Onboarding state:', onboardingState);

      if (!onboardingState) {
        console.log('No onboarding state, redirecting to profile setup');
        navigate('/profile-setup');
        return;
      }

      // Navigate based on onboarding progress
      if (!onboardingState.profile_completed) {
        console.log('Profile not completed, redirecting to profile setup');
        navigate('/profile-setup');
      } else if (!onboardingState.subscription_selected) {
        console.log('Subscription not selected, redirecting to subscriptions');
        navigate('/subscriptions');
      } else if (!onboardingState.intro_video_watched) {
        console.log('Intro video not watched, redirecting to intro video');
        navigate('/intro-video');
      } else if (!onboardingState.before_assessment_completed) {
        console.log('Before assessment not completed, redirecting to before assessment');
        navigate('/before-assessment');
      } else if (!onboardingState.journey_started) {
        console.log('Journey not started, redirecting to journey start');
        navigate('/journey-start');
      } else {
        console.log('All onboarding completed, redirecting to home');
        navigate('/home');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    } finally {
      setHasChecked(true);
    }
  };

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
