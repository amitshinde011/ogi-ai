
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Droplets } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
  const goal = 4; // 4 litres goal
  const progressPercentage = Math.min((waterLitres / goal) * 100, 100);

  return (
    <div className="space-y-3">
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
            onClick={() => onWaterChange(-0.25)}
            disabled={loading || waterLitres <= 0}
            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onWaterChange(0.25)}
            disabled={loading}
            className="h-8 w-8 p-0 sm:h-9 sm:w-9"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};
