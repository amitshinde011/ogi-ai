import { supabase } from '@/integrations/supabase/client';

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

export const determineLandingPage = async (): Promise<string> => {
  try {
    console.log('Landing page router: Starting redirect logic');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return '/login';
    }

    if (!user) {
      console.log('No user found, redirecting to login');
      return '/login';
    }

    console.log('User found:', user.id);

    // Get onboarding state
    const { data: onboardingData } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const onboardingState: OnboardingState = onboardingData || {};
    console.log('Onboarding state:', onboardingState);

    // Get program completion state
    const today = new Date().toISOString().split('T')[0];
    
    const { data: currentSubscription } = await supabase
      .from('user_subscriptions')
      .select('*, programs(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .or('start_date.is.null,start_date.lte.' + today)
      .or('end_date.is.null,end_date.gte.' + today)
      .maybeSingle();

    let isStarted = false;
    let isCompleted = false;
    let hasFinalAssessment = false;

    if (currentSubscription) {
      if (currentSubscription.start_date && currentSubscription.end_date) {
        const startDate = new Date(currentSubscription.start_date);
        const endDate = new Date(currentSubscription.end_date);
        const todayDate = new Date(today);
        isCompleted = todayDate >= endDate;
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
          .eq('user_id', user.id)
          .eq('subscription_id', currentSubscription.id)
          .maybeSingle();
        
        hasFinalAssessment = !!finalAssessment;
      }
    }

    console.log('Program completion:', { isCompleted, hasFinalAssessment });

    // Check profile completion FIRST - highest priority
    if (!onboardingState.profile_completed) {
      console.log('Profile not completed, redirecting to profile setup');
      return '/profile-setup';
    }

    // Check program completion status after profile is completed
    if (isCompleted) {
      if (!hasFinalAssessment) {
        console.log('Program completed but final assessment not done, redirecting to program complete');
        return '/program-complete';
      } else {
        console.log('Program completed and final assessment done, redirecting to subscriptions');
        return '/subscriptions?completed=true';
      }
    }

    // Navigate based on remaining onboarding progress
    if (!onboardingState.subscription_selected) {
      console.log('Subscription not selected, redirecting to progress');
      return '/progress';
    } else if (!onboardingState.intro_video_watched) {
      console.log('Intro video not watched, redirecting to intro video');
      return '/intro-video';
    } else if (!onboardingState.before_assessment_completed || !isStarted) {
      console.log('Before assessment not completed, redirecting to before assessment');
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