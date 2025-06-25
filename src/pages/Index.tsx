
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';

const Index = () => {
  const location = useLocation();
  const { onboardingState, loading: onboardingLoading } = useOnboarding();
  const { isCompleted, hasFinalAssessment, loading: completionLoading } = useProgramCompletion();

  useEffect(() => {
    // Only run redirect logic if we're actually on the root path
    if (location.pathname !== '/') {
      console.log('Not on root path, skipping redirect logic');
      return;
    }

    const handleRedirect = async () => {
      try {
        console.log('Index component: Starting redirect logic for root path');
        
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
        console.log('Program completion:', { isCompleted, hasFinalAssessment });

        if (!onboardingState) {
          console.log('No onboarding state, redirecting to profile setup');
          window.location.href = '/profile-setup';
          return;
        }

        // Check program completion status first
        if (isCompleted) {
          if (!hasFinalAssessment) {
            console.log('Program completed but final assessment not done, redirecting to program complete');
            window.location.href = '/program-complete';
            return;
          } else {
            console.log('Program completed and final assessment done, redirecting to subscriptions');
            window.location.href = '/subscriptions?completed=true';
            return;
          }
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
    if (!onboardingLoading && !completionLoading) {
      handleRedirect();
    }
  }, [onboardingLoading, completionLoading, onboardingState, isCompleted, hasFinalAssessment, location.pathname]);

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
        <div className="mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default Index;
