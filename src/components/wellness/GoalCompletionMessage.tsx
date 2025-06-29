
import React, { useState, useEffect } from 'react';
import { CheckCircle, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoalCompletionMessageProps {
  show: boolean;
  message: string;
  onComplete?: () => void;
  duration?: number;
}

export const GoalCompletionMessage: React.FC<GoalCompletionMessageProps> = ({ 
  show, 
  message, 
  onComplete, 
  duration = 8000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-hide after duration, but make it longer so users can read it
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          setTimeout(onComplete, 300); // Wait for fade out animation
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  const handleClose = () => {
    setIsVisible(false);
    if (onComplete) {
      setTimeout(onComplete, 300);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-green-50/95 to-emerald-50/95 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 animate-fade-in">
      <div className="text-center p-6 max-w-xs">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleClose}
          className="absolute top-2 right-2 h-6 w-6 p-0 text-green-600 hover:bg-green-100"
        >
          <X className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center justify-center gap-2 mb-3">
          <CheckCircle className="w-8 h-8 text-green-500 animate-scale-in" />
          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
        </div>
        
        <p className="text-sm font-medium text-green-700 leading-relaxed">
          {message}
        </p>
        
        <div className="mt-4">
          <Button
            size="sm"
            onClick={handleClose}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 text-xs"
          >
            Awesome!
          </Button>
        </div>
      </div>
    </div>
  );
};
