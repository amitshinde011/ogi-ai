
import { NavigateFunction } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getLocalDateString } from '@/utils/dateUtils';

export interface OnboardingState {
  profile_completed?: boolean;
  subscription_selected?: boolean;
  intro_video_watched?: boolean;
  before_assessment_completed?: boolean;
  journey_started?: boolean;
}

export interface ProgramCompletionState {
  isCompleted: boolean;
  hasFinalAssessment: boolean;
}

export const determineLandingPage = async (userId?: string, isAuthenticated?: boolean): Promise<string> => {
  try {
    console.log('Landing page router: Starting redirect logic', { userId, isAuthenticated });
    
    // If explicitly not authenticated, go to login
    if (isAuthenticated === false) {
      console.log('Not authenticated, redirecting to login');
      return '/login';
    }
    
    // If we have a userId, use it; otherwise check session
    let user_id = userId;
    if (!user_id && isAuthenticated !== true) {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return '/login';
      }

      if (!session?.user) {
        console.log('No session found, redirecting to login');
        return '/login';
      }
      
      user_id = session.user.id;
    }
    
    // If still no user_id and not explicitly authenticated, redirect to login
    if (!user_id && isAuthenticated !== true) {
      console.log('No user ID found, redirecting to login');
      return '/login';
    }
    
    console.log('User found:', user_id);

    // Get onboarding state
    const { data: onboardingData } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();
    console.log('Onboarding data:', onboardingData);
    const onboardingState: OnboardingState = onboardingData || {};
    console.log('Onboarding state:', onboardingState);

    // Check subscription selection
    if (!onboardingState.subscription_selected) {
      console.log('Subscription not selected, redirecting to progress');
      return '/progress';
    }

    // Check profile completion FIRST - highest priority
    if (onboardingState.subscription_selected && !onboardingState.profile_completed) {
      console.log('Profile not completed, redirecting to profile setup');
      return '/profile-setup';
    }

    // Check intro video completion
    if (!onboardingState.intro_video_watched) {
      console.log('Intro video not watched, redirecting to intro video');
      return '/intro-video';
    }

    // Check before assessment completion - BEFORE checking program completion
    if (!onboardingState.before_assessment_completed) {
      console.log('Before assessment not completed, redirecting to before assessment');
      return '/before-assessment';
    }

    // Get program completion state ONLY after before assessment is completed
    const today = getLocalDateString();
    
    const { data: currentSubscription } = await supabase
      .from('user_subscriptions')
      .select('*, programs(*)')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .or(`start_date.is.null,start_date.lte.${today}`)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .limit(1)
      .maybeSingle();

    let isStarted = false;
    let isCompleted = false;
    let hasFinalAssessment = false;
    console.log('currentSubscription :', currentSubscription);
    if (currentSubscription) {
      if (currentSubscription.start_date && currentSubscription.end_date) {
        const startDate = new Date(currentSubscription.start_date);
        const endDate = new Date(currentSubscription.end_date);
        const todayDate = new Date(today);
        
        // Program is completed the day AFTER the end date (inclusive end date)
        isCompleted = todayDate > endDate;
        isStarted = todayDate >= startDate;
      } else {
        // If dates are null, subscription is not yet started
        isStarted = false;
        isCompleted = false;
      }
      
      if (isCompleted) {
        const { data: finalAssessment } = await supabase
          .from('final_assessments')
          .select('id')
          .eq('user_id', user_id)
          .eq('subscription_id', currentSubscription.id)
          .maybeSingle();
        
        hasFinalAssessment = !!finalAssessment;
      }
    }

    console.log('Program completion:', { isCompleted, hasFinalAssessment });

    // Handle program completion
    if (isCompleted) {
      if (!hasFinalAssessment) {
        console.log('Program completed but final assessment not done, redirecting to program complete');
        return '/program-complete';
      } else {
        console.log('Program completed and final assessment done, redirecting to subscriptions');
        return '/subscriptions?completed=true';
      }
    }

    // Check if journey should start (program started and assessment completed)
    if (!isStarted) {
      console.log('Program not started yet, redirecting to before assessment');
      return '/before-assessment';
    } else if (!onboardingState.journey_started) {
      console.log('Journey not started, redirecting to journey start');
      return '/journey-start';
    } else {
      console.log('All onboarding completed, redirecting to home');
      return '/home';
    }
  } catch (error) {
    console.error('Error in landing page router:', error);
    return '/login';
  }
};
