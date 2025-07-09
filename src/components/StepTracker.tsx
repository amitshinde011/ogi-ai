
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Footprints, Plus } from 'lucide-react';
import { useStepTracking } from '@/hooks/useStepTracking';
import { GoalCompletionMessage } from './wellness/GoalCompletionMessage';
import { Capacitor } from '@capacitor/core';
import { useAnalytics } from '@/hooks/useAnalytics';

const StepTracker = () => {
  console.log('👟 StepTracker: Component initialized');
  
  const { stepData, isTracking, motionState, manuallyAddSteps } = useStepTracking();
  const [showGoalMessage, setShowGoalMessage] = useState(false);
  const [goalAchievedToday, setGoalAchievedToday] = useState(false);
  const { trackEvent } = useAnalytics();

  const goal = 5000; // 5,000 steps goal for 5km

  const goalMessages = [
    "🚶‍♀️ Amazing! You've walked 5,000 steps today - that's 5km!",
    "👟 Fantastic! Your 5km fitness goal is achieved!",
    "🎯 Outstanding! You've hit your daily 5,000 step target!",
    "💪 Incredible! You've walked 5km today - your dedication is inspiring!",
    "⭐ Perfect! You've mastered your daily 5km movement goal!"
  ];

  // Check if goal was achieved today and store in localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `step_goal_achieved_${today}`;
    const wasAchievedToday = localStorage.getItem(storageKey) === 'true';
    
    setGoalAchievedToday(wasAchievedToday);
    
    console.log('👟 StepTracker: Goal status check:', {
      today,
      currentSteps: stepData.steps,
      goal,
      wasAchievedToday,
      currentlyAtGoal: stepData.steps >= goal
    });

    // Only show message if goal is reached and hasn't been achieved today yet
    if (stepData.steps >= goal && !wasAchievedToday) {
      console.log('🎯 StepTracker: 5km goal completed for the first time today!');
      setShowGoalMessage(true);
      setGoalAchievedToday(true);
      localStorage.setItem(storageKey, 'true');
      trackEvent('step_goal_achieved', 'Fitness', '5km Goal', stepData.steps);
    }
  }, [stepData.steps, goal, trackEvent]);

  // Listen for external step updates and sync with parent components
  useEffect(() => {
    const handleStepsUpdated = (event: CustomEvent) => {
      console.log('📢 StepTracker: External steps update received:', event.detail);
      trackEvent('steps_sync_external', 'Data Management', 'External Update');
    };

    window.addEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    
    return () => {
      console.log('🧹 StepTracker: Cleaning up external steps listener');
      window.removeEventListener('stepsUpdated', handleStepsUpdated as EventListener);
    };
  }, [trackEvent]);

  const getRandomMessage = () => {
    const message = goalMessages[Math.floor(Math.random() * goalMessages.length)];
    console.log('🎉 StepTracker: Selected goal completion message:', message);
    return message;
  };

  const handleAddSteps = (stepsToAdd: number) => {
    console.log(`➕ StepTracker: Adding ${stepsToAdd} steps manually`);
    trackEvent('manual_steps_add', 'Fitness', `${stepsToAdd} Steps`);
    manuallyAddSteps(stepsToAdd);
    
    // Immediately dispatch the updated step count
    const newStepCount = stepData.steps + stepsToAdd;
    console.log('📢 StepTracker: Dispatching immediate step update:', newStepCount);
    window.dispatchEvent(new CustomEvent('stepsUpdated', { 
      detail: { steps: newStepCount, lastUpdated: new Date() } 
    }));
  };

  const getPlatformInfo = () => {
    const platform = Capacitor.getPlatform();
    console.log('📱 StepTracker: Getting platform info for:', platform);
    
    if (Capacitor.isNativePlatform()) {
      if (platform === 'android') {
        return isTracking 
          ? `Intelligent tracking ${motionState.isActive ? '(Walking)' : '(Idle)'} - Android`
          : "Initializing intelligent Android tracking...";
      } else if (platform === 'ios') {
        return isTracking 
          ? `Intelligent tracking ${motionState.isActive ? '(Walking)' : '(Idle)'} - iOS`
          : "Initializing intelligent iOS tracking...";
      }
    }
    
    return isTracking 
      ? `Smart web tracking ${motionState.isActive ? '(Walking)' : '(Idle)'}`
      : "Initializing smart web tracking...";
  };

  const kmWalked = (stepData.steps / 1000).toFixed(1);
  const progressPercentage = Math.min((stepData.steps / goal) * 100, 100);

  // Track component render
  useEffect(() => {
    console.log('🎨 StepTracker: Component rendered with state:', {
      steps: stepData.steps,
      isTracking,
      goal,
      progress: Math.round(progressPercentage),
      kmWalked,
      goalAchievedToday
    });
    trackEvent('step_tracker_view', 'UI', 'Component Render');
  }, [stepData.steps, isTracking, goal, progressPercentage, kmWalked, goalAchievedToday, trackEvent]);

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
              <div className="flex items-center">
                {motionState.isActive ? (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm">Walking</span>
                  </div>
                ) : (
                  <div className="flex items-center text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">Idle</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center text-orange-500">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm">Starting...</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-gray-800">{stepData.steps.toLocaleString()}</div>
          <div className="text-sm text-gray-600">steps today</div>
          <div className="text-sm text-blue-600 font-medium">{kmWalked} km walked</div>
          <div className="text-xs text-gray-500 mt-1">
            Last updated: {stepData.lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress to 5km</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-center text-gray-700">Manually add steps:</p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleAddSteps(100)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-300"
            >
              <Plus size={14} className="mr-1" />
              +100
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleAddSteps(500)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-300"
            >
              <Plus size={14} className="mr-1" />
              +500
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleAddSteps(1000)}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-300"
            >
              <Plus size={14} className="mr-1" />
              +1K
            </Button>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Goal: {goal.toLocaleString()} steps per day (5km)
        </div>

        <div className="mt-2 text-xs text-blue-600 text-center">
          {getPlatformInfo()}
        </div>

        <GoalCompletionMessage
          show={showGoalMessage}
          message={getRandomMessage()}
          onComplete={() => {
            console.log('🎉 StepTracker: Goal completion message dismissed');
            setShowGoalMessage(false);
            trackEvent('step_goal_message_dismissed', 'UI', 'Goal Celebration');
          }}
          duration={8000}
        />
      </CardContent>
    </Card>
  );
};

export default StepTracker;
