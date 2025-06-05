
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Flame } from 'lucide-react';

interface WeeklyStreakProps {
  streak: boolean[];
}

const WeeklyStreak = ({ streak }: WeeklyStreakProps) => {
  const streakCount = streak.filter(Boolean).length;
  
  // Get current week's days dynamically
  const getCurrentWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(today);
    
    // Calculate Monday of current week (adjust for Sunday = 0)
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + daysToMonday);
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push({
        name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        date: day.getDate(),
        isToday: day.toDateString() === today.toDateString()
      });
    }
    
    return weekDays;
  };

  const weekDays = getCurrentWeekDays();
  
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
          {weekDays.map((day, index) => (
            <div key={`${day.name}-${day.date}`} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200 ${
                streak[index] 
                  ? 'bg-green-500 text-white shadow-lg scale-105' 
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              } ${day.isToday ? 'ring-2 ring-indigo-300' : ''}`}>
                {streak[index] ? '✓' : ''}
              </div>
              <div className="text-center">
                <span className={`text-xs font-medium block ${
                  streak[index] ? 'text-green-600' : 'text-slate-500'
                } ${day.isToday ? 'text-indigo-600 font-bold' : ''}`}>
                  {day.name}
                </span>
                <span className={`text-xs ${
                  day.isToday ? 'text-indigo-500 font-semibold' : 'text-slate-400'
                }`}>
                  {day.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyStreak;
