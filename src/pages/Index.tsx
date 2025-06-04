
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';

const Index = () => {
  const navigate = useNavigate();
  const { onboardingState, loading } = useOnboarding();

  useEffect(() => {
    // Only run once when component mounts
    const performRedirect = async () => {
      try {
        console.log('Checking user authentication and onboarding state...');
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          window.location.replace('/login');
          return;
        }

        if (!user) {
          console.log('No user found, redirecting to login');
          window.location.replace('/login');
          return;
        }

        console.log('User found:', user.id);
        console.log('Onboarding state:', onboardingState);

        if (!onboardingState) {
          console.log('No onboarding state, redirecting to profile setup');
          window.location.replace('/profile-setup');
          return;
        }

        // Navigate based on onboarding progress
        if (!onboardingState.profile_completed) {
          console.log('Profile not completed, redirecting to profile setup');
          window.location.replace('/profile-setup');
        } else if (!onboardingState.subscription_selected) {
          console.log('Subscription not selected, redirecting to subscriptions');
          window.location.replace('/subscriptions');
        } else if (!onboardingState.intro_video_watched) {
          console.log('Intro video not watched, redirecting to intro video');
          window.location.replace('/intro-video');
        } else if (!onboardingState.before_assessment_completed) {
          console.log('Before assessment not completed, redirecting to before assessment');
          window.location.replace('/before-assessment');
        } else if (!onboardingState.journey_started) {
          console.log('Journey not started, redirecting to journey start');
          window.location.replace('/journey-start');
        } else {
          console.log('All onboarding completed, redirecting to home');
          window.location.replace('/home');
        }
      } catch (error) {
        console.error('Error in redirect logic:', error);
        window.location.replace('/login');
      }
    };

    // Only perform redirect if not already loading
    if (!loading) {
      performRedirect();
    }
  }, [loading, onboardingState]); // Only depend on loading and onboardingState

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
