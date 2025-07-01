
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Activity } from 'lucide-react';

interface ProgramData {
  id: string;
  name: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: string;
  progress_percentage: number;
  days_completed: number;
}

interface CurrentProgramCardProps {
  program: ProgramData;
}

const CurrentProgramCard = ({ program }: CurrentProgramCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-gradient-sage text-white border-gray-300 w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">Current Program</CardTitle>
          <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="font-bold text-lg sm:text-xl">{program.name}</h3>
          <p className="text-white/90 text-sm sm:text-base">
            Day {program.days_completed} of {program.duration_days}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Progress</span>
            <span>{Math.round(program.progress_percentage)}%</span>
          </div>
          <Progress value={program.progress_percentage} className="bg-gray-400/30 h-2 sm:h-3" />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center">
            <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span>Started: {formatDate(program.start_date)}</span>
          </div>
          <span>Ends: {formatDate(program.end_date)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentProgramCard;
