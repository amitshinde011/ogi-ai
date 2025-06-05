
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';

const Index = () => {
  const location = useLocation();
  const { onboardingState, loading } = useOnboarding();

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

        if (!onboardingState) {
          console.log('No onboarding state, redirecting to profile setup');
          window.location.href = '/profile-setup';
          return;
        }

        // Check if user has completed their program
        const today = new Date().toISOString().split('T')[0];
        
        const { data: completedSubscription } = await supabase
          .from('user_subscriptions')
          .select('*, programs(*)')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .lte('end_date', today)
          .maybeSingle();

        if (completedSubscription) {
          // Check if final assessment is already completed
          const { data: finalAssessment } = await supabase
            .from('final_assessments')
            .select('id')
            .eq('user_id', user.id)
            .eq('subscription_id', completedSubscription.id)
            .maybeSingle();

          if (!finalAssessment) {
            console.log('Program completed but final assessment not done, redirecting to program complete');
            window.location.href = '/program-complete';
            return;
          } else {
            console.log('Program completed and final assessment done, redirecting to subscriptions');
            window.location.href = '/subscriptions';
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
    if (!loading) {
      handleRedirect();
    }
  }, [loading, onboardingState, location.pathname]);

  // Show loading screen while checking
  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto flex items-center justify-center mb-6 animate-scale-in">
          <img 
            src="/lovable-uploads/79970f68-38e9-4317-9205-1a64c8814a23.png" 
            alt="Yogi-ai Logo" 
            className="w-full h-full object-contain"
          />
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
