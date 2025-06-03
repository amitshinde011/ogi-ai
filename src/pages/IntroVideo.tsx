
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useToast } from '@/hooks/use-toast';

const IntroVideo = () => {
  const navigate = useNavigate();
  const { updateOnboardingState } = useOnboarding();
  const { toast } = useToast();
  const [videoWatched, setVideoWatched] = useState(false);

  const handleVideoComplete = () => {
    setVideoWatched(true);
    toast({
      title: "Video Completed!",
      description: "You can now proceed to the next step.",
    });
  };

  const handleContinue = async () => {
    await updateOnboardingState({ intro_video_watched: true });
    navigate('/before-assessment');
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">
              Welcome to Your Wellness Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold">Introduction Video</p>
                <p className="text-muted-foreground">Learn how to use the app effectively</p>
                <Button 
                  className="mt-4" 
                  onClick={handleVideoComplete}
                  disabled={videoWatched}
                >
                  {videoWatched ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Video Completed
                    </>
                  ) : (
                    'Simulate Video Watch'
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-amber-800">Important Instructions</h3>
                  <p className="text-amber-700 mt-1">
                    Please watch the entire video before proceeding. This is a one-time guide that contains 
                    essential information for your journey including:
                  </p>
                  <ul className="list-disc list-inside text-amber-700 mt-2 space-y-1">
                    <li>How to track your daily diet effectively</li>
                    <li>Water consumption monitoring techniques</li>
                    <li>Yoga routine guidance and tips</li>
                    <li>Using the community features</li>
                    <li>Maximizing your program benefits</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleContinue}
                disabled={!videoWatched}
                size="lg"
              >
                Continue to Assessment
              </Button>
              {!videoWatched && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please complete the video to continue
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntroVideo;
