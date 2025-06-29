
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';
import MeditationAudioPlayer from '../MeditationAudioPlayer';

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
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-medium flex items-center gap-2 text-sm sm:text-base">
          <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          Meditation
        </Label>
        <Checkbox 
          checked={meditationCompleted}
          onCheckedChange={onMeditationToggle}
          disabled={loading}
          className="data-[state=checked]:border-gray-600 border-gray-400 h-5 w-5 sm:h-6 sm:w-6"
        />
      </div>
      
      <MeditationAudioPlayer />
    </div>
  );
};
