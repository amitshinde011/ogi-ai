
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from '@/hooks/useOnboarding';

const Index = () => {
  const navigate = useNavigate();
  const { onboardingState, loading } = useOnboarding();

  useEffect(() => {
    checkUserAndRedirect();
  }, [onboardingState, loading]);

  const checkUserAndRedirect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      if (loading) return;

      if (!onboardingState) {
        navigate('/profile-setup');
        return;
      }

      // Navigate based on onboarding progress
      if (!onboardingState.profile_completed) {
        navigate('/profile-setup');
      } else if (!onboardingState.subscription_selected) {
        navigate('/subscriptions');
      } else if (!onboardingState.intro_video_watched) {
        navigate('/intro-video');
      } else if (!onboardingState.before_assessment_completed) {
        navigate('/before-assessment');
      } else if (!onboardingState.journey_started) {
        navigate('/journey-start');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
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
