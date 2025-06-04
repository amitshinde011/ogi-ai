
import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';

const Index = () => {
  const { onboardingState, loading } = useOnboarding();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('Index component: Starting redirect logic');
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          window.location.href = '/login';
          return;
        }

        if (!user) {
          console.log('No user found, redirecting to login');
          window.location.href = '/login';
          return;
        }

        console.log('User found:', user.id);
        console.log('Onboarding state:', onboardingState);

        if (!onboardingState) {
          console.log('No onboarding state, redirecting to profile setup');
          window.location.href = '/profile-setup';
          return;
        }

        // Navigate based on onboarding progress
        if (!onboardingState.profile_completed) {
          console.log('Profile not completed, redirecting to profile setup');
          window.location.href = '/profile-setup';
        } else if (!onboardingState.subscription_selected) {
          console.log('Subscription not selected, redirecting to subscriptions');
          window.location.href = '/subscriptions';
        } else if (!onboardingState.intro_video_watched) {
          console.log('Intro video not watched, redirecting to intro video');
          window.location.href = '/intro-video';
        } else if (!onboardingState.before_assessment_completed) {
          console.log('Before assessment not completed, redirecting to before assessment');
          window.location.href = '/before-assessment';
        } else if (!onboardingState.journey_started) {
          console.log('Journey not started, redirecting to journey start');
          window.location.href = '/journey-start';
        } else {
          console.log('All onboarding completed, redirecting to home');
          window.location.href = '/home';
        }
      } catch (error) {
        console.error('Error in redirect logic:', error);
        window.location.href = '/login';
      }
    };

    // Only run redirect if not loading and we have the data we need
    if (!loading) {
      handleRedirect();
    }
  }, [loading, onboardingState]);

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
