
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Sun } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import SuryaNamaskarVideoPlayer from '../SuryaNamaskarVideoPlayer';
import { GoalCompletionMessage } from './GoalCompletionMessage';

interface SuryaNamaskarTrackerProps {
  suryaNamaskarCount: number;
  onSuryaNamaskarChange: (delta: number) => void;
  loading: boolean;
}

export const SuryaNamaskarTracker: React.FC<SuryaNamaskarTrackerProps> = ({
  suryaNamaskarCount,
  onSuryaNamaskarChange,
  loading
}) => {
  const goal = 12; // 12 rounds goal
  const progressPercentage = Math.min((suryaNamaskarCount / goal) * 100, 100);
  const [showGoalMessage, setShowGoalMessage] = useState(false);
  const [previousCount, setPreviousCount] = useState(suryaNamaskarCount);

  const goalMessages = [
    "🌅 Brilliant! You've completed your Surya Namaskar practice!",
    "☀️ Wonderful! Your body and mind are in perfect harmony!",
    "🧘‍♀️ Excellent! You've honored the sun with dedication!",
    "✨ Amazing! Your yoga practice is truly inspiring!",
    "🕉️ Perfect! You've achieved your daily yoga goal!"
  ];

  useEffect(() => {
    // Check if goal was just completed
    if (suryaNamaskarCount >= goal && previousCount < goal && previousCount >= 0) {
      setShowGoalMessage(true);
    }
    setPreviousCount(suryaNamaskarCount);
  }, [suryaNamaskarCount, goal, previousCount]);

  const getRandomMessage = () => {
    return goalMessages[Math.floor(Math.random() * goalMessages.length)];
  };

  return (
    <div className="space-y-3 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
          <div className="min-w-0">
            <Label className="font-medium flex items-center gap-2 text-sm sm:text-base">
              Surya Namaskar
              <SuryaNamaskarVideoPlayer />
            </Label>
            <p className="text-xs sm:text-sm text-gray-600">{suryaNamaskarCount} / {goal} rounds</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onSuryaNamaskarChange(-1)}
            disabled={loading || suryaNamaskarCount <= 0}
            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onSuryaNamaskarChange(1)}
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
        onComplete={() => setShowGoalMessage(false)}
        duration={8000}
      />
    </div>
  );
};
