
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';
import MeditationAudioPlayer from '../MeditationAudioPlayer';
import { GoalCompletionMessage } from './GoalCompletionMessage';

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
  const [showGoalMessage, setShowGoalMessage] = useState(false);
  const [previousCompleted, setPreviousCompleted] = useState(meditationCompleted);

  const goalMessages = [
    "🧘‍♀️ Peaceful! You've found your inner calm today!",
    "✨ Serene! Your mind is clear and focused!",
    "🌸 Beautiful! You've nurtured your mental wellness!",
    "💜 Mindful! You've completed your meditation practice!",
    "🕯️ Centered! Your soul is at peace!"
  ];

  useEffect(() => {
    // Check if meditation was just completed
    if (meditationCompleted && !previousCompleted) {
      setShowGoalMessage(true);
    }
    setPreviousCompleted(meditationCompleted);
  }, [meditationCompleted, previousCompleted]);

  const getRandomMessage = () => {
    return goalMessages[Math.floor(Math.random() * goalMessages.length)];
  };

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between">
        <Label className="font-medium flex items-center gap-2 text-sm sm:text-base">
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          Meditation
        </Label>
        <Checkbox 
          checked={meditationCompleted}
          onCheckedChange={onMeditationToggle}
          disabled={loading}
          className="data-[state=checked]:bg-gray-600 data-[state=checked]:border-gray-600 border-gray-400 h-5 w-5 sm:h-6 sm:w-6"
        />
      </div>
      
      <MeditationAudioPlayer />
      
      <GoalCompletionMessage
        show={showGoalMessage}
        message={getRandomMessage()}
        onComplete={() => setShowGoalMessage(false)}
      />
    </div>
  );
};
