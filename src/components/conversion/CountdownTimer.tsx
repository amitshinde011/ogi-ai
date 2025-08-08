import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  targetDate?: Date;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetDate, 
  className = "" 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set default target to end of day if no target provided
    const target = targetDate || (() => {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay;
    })();

    const calculateTimeLeft = () => {
      const difference = target.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Timer className="w-4 h-4 animate-pulse text-red-500" />
      <div className="flex items-center gap-1 font-mono font-bold">
        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span>:</span>
        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span>:</span>
        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};