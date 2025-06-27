
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Sun } from 'lucide-react';
import SuryaNamaskarVideoPlayer from '../SuryaNamaskarVideoPlayer';

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
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Sun className="w-5 h-5 text-orange-500" />
        <div>
          <Label className="font-medium flex items-center gap-2">
            Surya Namaskar
            <SuryaNamaskarVideoPlayer />
          </Label>
          <p className="text-sm text-gray-600">{suryaNamaskarCount} rounds</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onSuryaNamaskarChange(-1)}
          disabled={loading || suryaNamaskarCount <= 0}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => onSuryaNamaskarChange(1)}
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
