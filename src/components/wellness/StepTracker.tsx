import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Footprints, Plus } from 'lucide-react';
import { useStepTracking } from '@/hooks/useStepTracking';
import { GoalCompletionMessage } from './GoalCompletionMessage';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalDateString } from '@/utils/dateUtils';

const StepTracker = () => {
  console.log('👟 StepTracker: Component initialized');
  
  const { stepData, manuallyAddSteps } = useStepTracking();
  const [showGoalMessage, setShowGoalMessage] = useState(false);
  const [goalAchievedToday, setGoalAchievedToday] = useState(false);
  const [goalMessage, setGoalMessage] = useState('');
  const { trackEvent } = useAnalytics();
  const { user } = useAuth();

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
    if (!user) return;
    
    const today = getLocalDateString();
    const storageKey = `step_goal_achieved_${user.id}_${today}`;
    const wasAchievedToday = localStorage.getItem(storageKey) === 'true';
    
    setGoalAchievedToday(wasAchievedToday);
    
    console.log('👟 StepTracker: Goal status check:', {
      today,
      currentSteps: stepData.steps,
      goal,
      wasAchievedToday,
      currentlyAtGoal: stepData.steps >= goal
    });

    // Only show message if goal is reached and it hasn't already been shown today.
    if (stepData.steps >= goal && !wasAchievedToday) {
      console.log('🎯 StepTracker: 5km goal completed for the first time today!');
      const selectedMessage = getRandomMessage();
      setGoalMessage(selectedMessage);
      setShowGoalMessage(true);
      setGoalAchievedToday(true);
      localStorage.setItem(storageKey, 'true');
      trackEvent('step_goal_achieved', 'Fitness', '5km Goal', stepData.steps);
    }
  }, [stepData.steps, user]);

  const getRandomMessage = () => {
    const message = goalMessages[Math.floor(Math.random() * goalMessages.length)];
    console.log('🎉 StepTracker: Selected goal completion message:', message);
    return message;
  };

  const handleAddSteps = (stepsToAdd: number) => {
    console.log(`➕ StepTracker: Adding ${stepsToAdd} steps manually`);
    trackEvent('manual_steps_add', 'Fitness', `${stepsToAdd} Steps`);
    manuallyAddSteps(stepsToAdd);
  };

  const kmWalked = (stepData.steps / 1000).toFixed(1);
  const progressPercentage = Math.min((stepData.steps / goal) * 100, 100);

  // Track component render
  useEffect(() => {
    console.log('🎨 StepTracker: Component rendered with state:', {
      steps: stepData.steps,
      goal,
      progress: Math.round(progressPercentage),
      kmWalked,
      goalAchievedToday
    });
    trackEvent('step_tracker_view', 'UI', 'Component Render');
  }, [stepData.steps, goal, progressPercentage, kmWalked, goalAchievedToday]);

  return (
    <Card className="bg-white border border-gray-200 relative">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Footprints className="text-blue-500 mr-2" size={20} />
            <span className="font-medium text-gray-800">Manual Step Tracker</span>
          </div>
          <div className="flex items-center">
            <div className="flex items-center text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm">Manual Entry</span>
            </div>
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

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress to 5km</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-center text-gray-700">Add steps manually:</p>
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
          Manual entry only - add your steps above
        </div>

        <GoalCompletionMessage
          show={showGoalMessage}
          message={goalMessage}
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