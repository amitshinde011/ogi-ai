
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WeeklyStreakProps {
  streak: boolean[];
}

const WeeklyStreak = ({ streak }: WeeklyStreakProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold text-primary mb-4">7-Day Streak</h3>
        <div className="flex justify-between">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                streak[index] ? 'bg-green-500 text-white' : 'bg-gray-200'
              }`}>
                {streak[index] ? '✓' : ''}
              </div>
              <span className="text-xs text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyStreak;
