
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, Target } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

const JourneyStart = () => {
  const navigate = useNavigate();
  const { updateOnboardingState } = useOnboarding();

  const handleStartJourney = async () => {
    await updateOnboardingState({ journey_started: true });
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="w-24 h-24 bg-gradient-sage rounded-full mx-auto flex items-center justify-center mb-6 animate-scale-in shadow-lg">
            <Trophy className="text-4xl text-white" size={48} />
          </div>
          <CardTitle className="text-3xl text-primary mb-2">
            Your Journey Begins Now!
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Welcome to your personalized wellness transformation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-sage/10 rounded-lg">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Daily Tracking</h3>
              <p className="text-sm text-muted-foreground">Monitor your wellness progress</p>
            </div>
            <div className="text-center p-4 bg-sage/10 rounded-lg">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Guided Activities</h3>
              <p className="text-sm text-muted-foreground">Follow your personalized plan</p>
            </div>
            <div className="text-center p-4 bg-sage/10 rounded-lg">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Community Support</h3>
              <p className="text-sm text-muted-foreground">Connect with like-minded people</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Remember:</h3>
            <ul className="text-amber-700 space-y-1 text-sm">
              <li>• Consistency is key to transformation</li>
              <li>• Track your daily activities honestly</li>
              <li>• Engage with the community for motivation</li>
              <li>• Follow the guided routines and diet plans</li>
              <li>• Stay committed throughout your program duration</li>
            </ul>
          </div>

          <Button 
            onClick={handleStartJourney}
            className="w-full gradient-sage text-white"
            size="lg"
          >
            Enter My Wellness Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JourneyStart;
