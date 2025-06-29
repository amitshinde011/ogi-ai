
import React, { useState, useEffect } from 'react';
import { CheckCircle, Sparkles } from 'lucide-react';

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
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          setTimeout(onComplete, 300); // Wait for fade out animation
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-green-50/90 backdrop-blur-sm rounded-lg flex items-center justify-center z-10 animate-fade-in">
      <div className="text-center p-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="w-6 h-6 text-green-500 animate-scale-in" />
          <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
        </div>
        <p className="text-sm font-medium text-green-700">
          {message}
        </p>
      </div>
    </div>
  );
};
