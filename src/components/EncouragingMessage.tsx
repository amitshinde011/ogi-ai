
import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface EncouragingMessageProps {
  message: string;
  show: boolean;
  onComplete?: () => void;
  duration?: number;
}

const EncouragingMessage: React.FC<EncouragingMessageProps> = ({ 
  message, 
  show, 
  onComplete, 
  duration = 2500 
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 mx-4 max-w-md text-center shadow-2xl animate-scale-in">
        <div className="mb-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-scale-in" />
        </div>
        <p className="text-lg font-medium text-dark-text leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
};

export default EncouragingMessage;
