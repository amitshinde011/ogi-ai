
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Droplets } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { GoalCompletionMessage } from './GoalCompletionMessage';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getLocalDateString } from '@/utils/dateUtils';

interface WaterTrackerProps {
  waterLitres: number;
  onWaterChange: (delta: number) => void;
  loading: boolean;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  waterLitres,
  onWaterChange,
  loading
}) => {
  console.log('💧 WaterTracker: Component rendered with:', { waterLitres, loading });
  
  const goal = 4; // 4 litres goal
  const progressPercentage = Math.min((waterLitres / goal) * 100, 100);
  const [showGoalMessage, setShowGoalMessage] = useState(false);
  const [goalAchievedToday, setGoalAchievedToday] = useState(false);
  const { trackEvent } = useAnalytics();

  const goalMessages = [
    "🌊 Amazing! You've reached your hydration goal!",
    "💧 Fantastic! Your body is loving this hydration!",
    "✨ Well done! You're glowing with good health!",
    "🎉 Incredible! You've mastered hydration today!",
    "💪 Outstanding! Your cells are dancing with joy!"
  ];

  // Check if goal was achieved today and store in localStorage
  useEffect(() => {
    const today = getLocalDateString();
    const storageKey = `water_goal_achieved_${today}`;
    const wasAchievedToday = localStorage.getItem(storageKey) === 'true';
    
    setGoalAchievedToday(wasAchievedToday);
    
    console.log('💧 WaterTracker: Goal status check:', {
      today,
      waterLitres,
      goal,
      wasAchievedToday,
      currentlyAtGoal: waterLitres >= goal
    });

    // Only show message if goal is reached and hasn't been achieved today yet
    if (waterLitres >= goal && !wasAchievedToday) {
      console.log('🎯 WaterTracker: Hydration goal completed for the first time today!');
      setShowGoalMessage(true);
      setGoalAchievedToday(true);
      localStorage.setItem(storageKey, 'true');
      trackEvent('water_goal_achieved', 'Wellness', 'Daily Goal', waterLitres);
    }
  }, [waterLitres, goal, trackEvent]);

  const getRandomMessage = () => {
    const message = goalMessages[Math.floor(Math.random() * goalMessages.length)];
    console.log('🎉 WaterTracker: Selected goal completion message:', message);
    return message;
  };

  const handleWaterDecrease = () => {
    if (loading || waterLitres <= 0) {
      console.log('⚠️ WaterTracker: Water decrease blocked - loading or already at minimum');
      return;
    }
    console.log('➖ WaterTracker: Decreasing water by 0.25L');
    trackEvent('water_decrease', 'Wellness', 'Manual Adjustment', 0.25);
    onWaterChange(-0.25);
  };

  const handleWaterIncrease = () => {
    if (loading) {
      console.log('⚠️ WaterTracker: Water increase blocked - loading');
      return;
    }
    console.log('➕ WaterTracker: Increasing water by 0.25L');
    trackEvent('water_increase', 'Wellness', 'Manual Adjustment', 0.25);
    onWaterChange(0.25);
  };

  // Track component interactions
  useEffect(() => {
    console.log('🎨 WaterTracker: Component state updated:', {
      waterLitres,
      progressPercentage,
      loading,
      goalReached: waterLitres >= goal,
      goalAchievedToday
    });
    trackEvent('water_tracker_view', 'UI', 'Component Update', Math.round(progressPercentage));
  }, [waterLitres, progressPercentage, loading, goal, goalAchievedToday, trackEvent]);

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <Label className="font-medium text-sm sm:text-base">Water Intake</Label>
            <p className="text-xs sm:text-sm text-gray-600">{waterLitres} / {goal} litres</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleWaterDecrease}
            disabled={loading || waterLitres <= 0}
            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleWaterIncrease}
            disabled={loading}
            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      
      <GoalCompletionMessage
        show={showGoalMessage}
        message={getRandomMessage()}
        onComplete={() => {
          console.log('💧 WaterTracker: Goal completion message dismissed');
          setShowGoalMessage(false);
          trackEvent('water_goal_message_dismissed', 'UI', 'Goal Celebration');
        }}
        duration={8000}
      />
    </div>
  );
};
