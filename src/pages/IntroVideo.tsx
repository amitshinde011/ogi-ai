
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-8">
        {/* Main Card */}
        <Card className="bg-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="text-center pb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl">
              <Play className="text-white" size={48} />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Welcome to Your Wellness Journey
            </CardTitle>
            <p className="text-xl text-slate-600 font-medium">
              Learn the fundamentals to maximize your transformation
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
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
