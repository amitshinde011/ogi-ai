
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ComfortSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const ComfortSlider: React.FC<ComfortSliderProps> = ({
  label,
  value,
  onChange,
  className = ""
}) => {
  const getComfortLabel = (value: number) => {
    const labels = [
      'Very Uncomfortable',
      'Uncomfortable', 
      'Somewhat Comfortable',
      'Comfortable',
      'Very Comfortable'
    ];
    return labels[value - 1] || 'Select comfort level';
  };

  return (
    <div className={`space-y-4 max-w-md mx-auto ${className}`}>
      <Label className="text-dark-text font-medium text-base">{label}</Label>
      
      <div className="space-y-6">
        <div className="text-center">
          <span className="text-lg font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full">
            {getComfortLabel(value)}
          </span>
        </div>
        
        <div className="relative px-4">
          <Slider
            value={[value]}
            onValueChange={(values) => onChange(values[0])}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
          
          <div className="flex justify-between mt-3 text-sm text-gray-600">
            <span className="text-left">Very Unc.</span>
            <span className="text-center">Somewhat</span>
            <span className="text-right">Very Conf.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComfortSlider;
