
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Flame } from 'lucide-react';

interface WeeklyStreakProps {
  streak: boolean[];
}

const WeeklyStreak = ({ streak }: WeeklyStreakProps) => {
  const streakCount = streak.filter(Boolean).length;
  
  return (
    <Card className="shadow-lg border-slate-200 interactive animate-scale-in">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="text-indigo-600 mr-2" size={20} />
            <h3 className="font-bold text-slate-900">7-Day Streak</h3>
          </div>
          {streakCount > 0 && (
            <div className="flex items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
              <Flame size={16} className="mr-1" />
              <span className="font-semibold text-sm">{streakCount}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                streak[index] 
                  ? 'bg-green-500 text-white shadow-lg scale-105' 
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}>
                {streak[index] ? '✓' : ''}
              </div>
              <span className={`text-xs font-medium ${
                streak[index] ? 'text-green-600' : 'text-slate-500'
              }`}>
                {day}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyStreak;
