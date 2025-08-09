import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play } from 'lucide-react';
import ContentContainer from '@/components/ContentContainer';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInstructions from '@/components/VideoInstructions';
import ContinueSection from '@/components/ContinueSection';
import SacredNote from '@/components/SacredNote';
import Loader from '@/components/ui/loader';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoWatchedPersistence } from '@/hooks/useVideoWatchedPersistence';

const IntroVideo = () => {
  const navigate = useNavigate();
  const { updateOnboardingState, onboardingState } = useOnboarding();
  const { toast } = useToast();
  const { trackVideoComplete, trackButtonClick } = useAnalytics();
  const { user } = useAuth();
  const {
    videoWatchedStates,
    allVideosWatched
  } = useVideoWatchedPersistence();

  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (onboardingState?.intro_video_watched) {
      navigate('/before-assessment');
      return;
    }
  }, [onboardingState?.intro_video_watched, navigate, user]);

  const handleVideoComplete = useCallback(() => {
    trackVideoComplete('Intro Video Sequence');
    setCanContinue(true);
    toast({
      title: "All Videos Completed!",
      description: "You have completed the sacred video sequence. You can now proceed to the next step.",
    });
  }, [trackVideoComplete, toast]);

  useEffect(() => {
    if (allVideosWatched) {
      handleVideoComplete();
    }
  }, [allVideosWatched, handleVideoComplete]);

  const handleContinue = useCallback(async () => {
    trackButtonClick('Continue to Assessment', 'Intro Video Page');

    try {
      await updateOnboardingState({ intro_video_watched: true });
      navigate('/before-assessment');
    } catch (error) {
      console.error('Error updating onboarding state:', error);
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  }, [trackButtonClick, updateOnboardingState, navigate, toast]);

  if (onboardingState === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
      <ContentContainer variant="legal" className="space-y-4 sm:space-y-6 md:space-y-8">
        <Card className="bg-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="text-center pb-4 sm:pb-6 md:pb-8 px-3 sm:px-6 md:px-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl md:rounded-3xl mx-auto flex items-center justify-center mb-3 sm:mb-4 md:mb-6 shadow-xl">
              <Play className="text-white" size={20} />
            </div>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4 leading-tight px-2">
              Welcome to Your Wellness Journey
            </CardTitle>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 font-medium px-2">
              Learn the fundamentals to maximize your transformation
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 md:space-y-8 p-3 sm:p-6 md:p-8">
            <SacredNote />
            <VideoPlayer 
              onVideoComplete={handleVideoComplete}
              videoWatched={allVideosWatched}
            />
            <VideoInstructions />
            <ContinueSection 
              videoWatched={canContinue}
              onContinue={handleContinue}
            />
          </CardContent>
        </Card>
      </ContentContainer>
    </div>
  );
};

export default IntroVideo;
