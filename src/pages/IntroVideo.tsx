
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInstructions from '@/components/VideoInstructions';
import ContinueSection from '@/components/ContinueSection';

const IntroVideo = () => {
  const navigate = useNavigate();
  const { updateOnboardingState } = useOnboarding();
  const { toast } = useToast();
  const { trackVideoComplete, trackButtonClick } = useAnalytics();
  const [videoWatched, setVideoWatched] = useState(false);

  const handleVideoComplete = () => {
    setVideoWatched(true);
    trackVideoComplete('Intro Video');
    toast({
      title: "Video Completed!",
      description: "You can now proceed to the next step.",
    });
  };

  const handleContinue = async () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-6 sm:space-y-8">
        {/* Main Card */}
        <Card className="bg-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="text-center pb-6 sm:pb-8 px-4 sm:px-8">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl mx-auto flex items-center justify-center mb-4 sm:mb-6 shadow-xl">
              <Play className="text-white" size={32} />
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight">
              Welcome to Your Wellness Journey
            </CardTitle>
            <p className="text-lg sm:text-xl text-slate-600 font-medium px-2">
              Learn the fundamentals to maximize your transformation
            </p>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-8">
            {/* Video Section */}
            <VideoPlayer 
              onVideoComplete={handleVideoComplete}
              videoWatched={videoWatched}
            />

            {/* Instructions Card */}
            <VideoInstructions />

            {/* Continue Button */}
            <ContinueSection 
              videoWatched={videoWatched}
              onContinue={handleContinue}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntroVideo;
