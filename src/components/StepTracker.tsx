
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Footprints, Plus, Play, Pause } from 'lucide-react';
import { useStepTracking } from '@/hooks/useStepTracking';
import { GoalCompletionMessage } from './wellness/GoalCompletionMessage';

const StepTracker = () => {
  const { stepData, isTracking, permission, manuallyAddSteps, requestPermission } = useStepTracking();
  const [showGoalMessage, setShowGoalMessage] = useState(false);
  const [previousSteps, setPreviousSteps] = useState(stepData.steps);

  const goal = 5000; // 5,000 steps goal

  const goalMessages = [
    "🚶‍♀️ Amazing! You've walked 5,000 steps today!",
    "👟 Fantastic! Your fitness goal is achieved!",
    "🎯 Outstanding! You've hit your daily step target!",
    "💪 Incredible! Your dedication to walking is inspiring!",
    "⭐ Perfect! You've mastered your daily movement goal!"
  ];

  useEffect(() => {
    // Check if goal was just completed
    if (stepData.steps >= goal && previousSteps < goal && previousSteps > 0) {
      setShowGoalMessage(true);
    }
    setPreviousSteps(stepData.steps);
  }, [stepData.steps, goal, previousSteps]);

  // Listen for external step updates and sync with parent components
  useEffect(() => {
    const handleStepsUpdated = (event: CustomEvent) => {
      // This ensures the step tracker stays in sync with other components
    };

    window.addEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    
    return () => {
      window.removeEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    };
  }, []);

  const getRandomMessage = () => {
    return goalMessages[Math.floor(Math.random() * goalMessages.length)];
  };

  const handleAdd100Steps = () => {
    manuallyAddSteps(100);
  };

  const handleAdd500Steps = () => {
    manuallyAddSteps(500);
  };

  const handleAdd1000Steps = () => {
    manuallyAddSteps(1000);
  };

  return (
    <Card className="bg-white border border-gray-200 relative">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Footprints className="text-blue-500 mr-2" size={20} />
            <span className="font-medium text-gray-800">Step Tracker</span>
          </div>
          <div className="flex items-center">
            {isTracking ? (
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">Tracking</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <Pause size={16} className="mr-1" />
                <span className="text-sm">Not tracking</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-gray-800">{stepData.steps.toLocaleString()}</div>
          <div className="text-sm text-gray-600">steps today</div>
          <div className="text-xs text-gray-500 mt-1">
            Last updated: {stepData.lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {permission === 'prompt' && (
          <Button 
            onClick={requestPermission}
            className="w-full mb-4 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
            variant="outline"
          >
            <Play size={16} className="mr-2" />
            Enable Step Tracking
          </Button>
        )}

        {permission === 'denied' && (
          <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Step tracking permission denied. You can still manually add steps below.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-medium text-center text-gray-700">Manually add steps:</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAdd100Steps}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-300"
            >
              <Plus size={14} className="mr-1" />
              +100
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAdd500Steps}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-300"
            >
              <Plus size={14} className="mr-1" />
              +500
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleAdd1000Steps}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-300"
            >
              <Plus size={14} className="mr-1" />
              +1K
            </Button>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
        Goal: {goal.toLocaleString()} steps per day
        </div>

        <GoalCompletionMessage
          show={showGoalMessage}
          message={getRandomMessage()}
          onComplete={() => setShowGoalMessage(false)}
          duration={8000}
        />
      </CardContent>
    </Card>
  );
};

export default StepTracker;
