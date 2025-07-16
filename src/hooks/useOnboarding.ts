
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingState {
  id?: string;
  profile_completed: boolean;
  subscription_selected: boolean;
  intro_video_watched: boolean;
  before_assessment_completed: boolean;
  journey_started: boolean;
}

export const useOnboarding = () => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchOnboardingState();
  }, []);

  const fetchOnboardingState = async () => {
    try {
      if (!user) return;

      // Get onboarding state
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      let onboardingData = data;
      if (!data) {
        // Create onboarding record if it doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from('user_onboarding')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        onboardingData = newData;
      }

      // Double-check profile completion by verifying actual user profile exists
      if (onboardingData?.profile_completed) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        // If onboarding says profile is completed but no profile exists, reset the flag
        if (profileError || !profile) {
          console.log('Onboarding state says profile completed but no profile found, resetting flag');
          const { error: updateError } = await supabase
            .from('user_onboarding')
            .update({ profile_completed: false })
            .eq('user_id', user.id);

          if (!updateError) {
            onboardingData = { ...onboardingData, profile_completed: false };
          }
        }
      }

      setOnboardingState(onboardingData);
    } catch (error) {
      console.error('Error fetching onboarding state:', error);
      // If there's an error, ensure we redirect to profile setup for safety
      setOnboardingState({
        profile_completed: false,
        subscription_selected: false,
        intro_video_watched: false,
        before_assessment_completed: false,
        journey_started: false
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOnboardingState = async (updates: Partial<OnboardingState>) => {
    try {
      if (!user || !onboardingState) return;

      const { error } = await supabase
        .from('user_onboarding')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setOnboardingState(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating onboarding state:', error);
      toast({
        title: "Error",
        description: "Failed to update onboarding progress.",
        variant: "destructive",
      });
    }
  };

  return {
    onboardingState,
    loading,
    updateOnboardingState,
    fetchOnboardingState
  };
};
