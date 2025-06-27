
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Droplets } from 'lucide-react';

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
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Droplets className="w-5 h-5 text-blue-500" />
        <div>
          <Label className="font-medium">Water Intake</Label>
          <p className="text-sm text-gray-600">{waterLitres} litres</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onWaterChange(-0.25)}
          disabled={loading || waterLitres <= 0}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onWaterChange(0.25)}
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
