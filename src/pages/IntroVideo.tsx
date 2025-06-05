
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';
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
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl aspect-video flex items-center justify-center shadow-inner">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto">
                  <Play className="w-10 h-10 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Introduction Video</h3>
                  <p className="text-slate-600 text-lg">Essential guidance for your journey</p>
                </div>
                <Button 
                  className={`h-14 px-8 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 ${
                    videoWatched 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  onClick={handleVideoComplete}
                  disabled={videoWatched}
                >
                  {videoWatched ? (
                    <>
                      <CheckCircle className="w-6 h-6 mr-3" />
                      Video Completed
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 mr-3" />
                      Watch Video
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Instructions Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-amber-900">Important Instructions</h3>
                    <p className="text-amber-800 leading-relaxed">
                      This comprehensive guide contains essential information for maximizing your wellness transformation.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-amber-800 font-medium">Daily diet tracking techniques</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-amber-800 font-medium">Water consumption monitoring</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-amber-800 font-medium">Yoga routine guidance</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-amber-800 font-medium">Community engagement tips</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="text-amber-800 font-medium">Program optimization strategies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <div className="text-center space-y-4">
              <Button 
                onClick={handleContinue}
                disabled={!videoWatched}
                size="lg"
                className={`h-16 px-12 rounded-2xl font-bold text-lg shadow-xl transition-all duration-200 ${
                  videoWatched 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105' 
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Continue to Assessment
              </Button>
              {!videoWatched && (
                <p className="text-slate-500 font-medium">
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
