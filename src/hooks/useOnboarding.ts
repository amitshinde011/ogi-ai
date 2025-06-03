
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    fetchOnboardingState();
  }, []);

  const fetchOnboardingState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setOnboardingState(data);
      } else {
        // Create onboarding record if it doesn't exist
        const { data: newData, error: insertError } = await supabase
          .from('user_onboarding')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        setOnboardingState(newData);
      }
    } catch (error) {
      console.error('Error fetching onboarding state:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOnboardingState = async (updates: Partial<OnboardingState>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
