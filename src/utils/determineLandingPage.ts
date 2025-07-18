import { supabase } from '@/integrations/supabase/client';

export async function determineLandingPage(
  userId: string | undefined, 
  isAuthenticated: boolean
): Promise<string | undefined> {
  // If not authenticated, go to login
  if (!isAuthenticated || !userId) {
    return '/login';
  }

  try {
    // Check if user has completed onboarding
    const { data: onboarding } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // If no onboarding record, start with profile setup
    if (!onboarding) {
      return '/profile-setup';
    }

    // Check onboarding completion
    if (!onboarding.profile_completed) {
      return '/profile-setup';
    }

    if (!onboarding.intro_video_watched) {
      return '/intro-video';
    }

    if (!onboarding.before_assessment_completed) {
      return '/before-assessment';
    }

    if (!onboarding.subscription_selected) {
      return '/subscriptions';
    }

    if (!onboarding.journey_started) {
      return '/journey-start';
    }

    // Check user role for admin access
    try {
      const { data: userRole } = await supabase.rpc('get_current_user_role');
      
      // If user is admin and accessing from a direct admin URL, allow it
      if (userRole === 'admin' && window.location.pathname === '/automation-admin') {
        return '/automation-admin';
      }
    } catch (error) {
      // Role check failed, continue with normal flow
      console.log('Role check failed, continuing with normal flow');
    }

    // Default to home for completed onboarding
    return '/home';

  } catch (error) {
    console.error('Error determining landing page:', error);
    // Fallback to home page
    return '/home';
  }
}