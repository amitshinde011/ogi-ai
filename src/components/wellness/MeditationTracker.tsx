
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';
import MeditationAudioPlayer from '../MeditationAudioPlayer';
import { GoalCompletionMessage } from './GoalCompletionMessage';
import { useAnalytics } from '@/hooks/useAnalytics';

interface MeditationTrackerProps {
  meditationCompleted: boolean;
  onMeditationToggle: () => void;
  loading: boolean;
}

export const MeditationTracker: React.FC<MeditationTrackerProps> = ({
  meditationCompleted,
  onMeditationToggle,
  loading
}) => {
  console.log('🧘‍♀️ MeditationTracker: Component rendered with:', { meditationCompleted, loading });
  
  const [showGoalMessage, setShowGoalMessage] = useState(false);
  const [goalAchievedToday, setGoalAchievedToday] = useState(false);
  const { trackEvent } = useAnalytics();

  const goalMessages = [
    "🧘‍♀️ Peaceful! You've found your inner calm today!",
    "✨ Serene! Your mind is clear and focused!",
    "🌸 Beautiful! You've nurtured your mental wellness!",
    "💜 Mindful! You've completed your meditation practice!",
    "🕯️ Centered! Your soul is at peace!"
  ];

  // Check if goal was achieved today and store in localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `meditation_goal_achieved_${today}`;
    const wasAchievedToday = localStorage.getItem(storageKey) === 'true';
    
    setGoalAchievedToday(wasAchievedToday);
    
    console.log('🧘‍♀️ MeditationTracker: Goal status check:', {
      today,
      meditationCompleted,
      wasAchievedToday
    });

    // Only show message if meditation is completed and hasn't been achieved today yet
    if (meditationCompleted && !wasAchievedToday) {
      console.log('🎯 MeditationTracker: Meditation completed for the first time today!');
      setShowGoalMessage(true);
      setGoalAchievedToday(true);
      localStorage.setItem(storageKey, 'true');
      trackEvent('meditation_completed', 'Wellness', 'Daily Goal');
    }
  }, [meditationCompleted, trackEvent]);

  const getRandomMessage = () => {
    const message = goalMessages[Math.floor(Math.random() * goalMessages.length)];
    console.log('🎉 MeditationTracker: Selected completion message:', message);
    return message;
  };

  const handleMeditationToggle = () => {
    console.log('🔄 MeditationTracker: Meditation toggle clicked:', { 
      currentState: meditationCompleted,
      willBecome: !meditationCompleted 
    });
    trackEvent('meditation_toggle_click', 'UI', meditationCompleted ? 'Uncheck' : 'Check');
    onMeditationToggle();
  };

  // Track component state
  useEffect(() => {
    console.log('🎨 MeditationTracker: Component state updated:', {
      meditationCompleted,
      loading,
      goalAchievedToday
    });
    trackEvent('meditation_tracker_view', 'UI', 'Component Update', meditationCompleted ? 1 : 0);
  }, [meditationCompleted, loading, goalAchievedToday, trackEvent]);

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between">
        <Label className="font-medium flex items-center gap-2 text-sm sm:text-base">
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          Meditation
        </Label>
        <Checkbox 
          checked={meditationCompleted}
          onCheckedChange={handleMeditationToggle}
          disabled={loading}
          className="data-[state=checked]:bg-white data-[state=checked]:border-gray-600 border-gray-400 h-5 w-5 sm:h-6 sm:w-6"
        />
      </div>
      
      <MeditationAudioPlayer />
      
      <GoalCompletionMessage
        show={showGoalMessage}
        message={getRandomMessage()}
        onComplete={() => {
          console.log('🧘‍♀️ MeditationTracker: Goal completion message dismissed');
          setShowGoalMessage(false);
          trackEvent('meditation_goal_message_dismissed', 'UI', 'Goal Celebration');
        }}
        duration={8000}
      />
    </div>
  );
};
