
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
    <Card className="bg-gradient-sage text-white border-gray-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Current Program</CardTitle>
          <Activity className="w-6 h-6" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold text-xl">{program.name}</h3>
          <p className="text-white/90">
            Day {program.days_completed} of {program.duration_days}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(program.progress_percentage)}%</span>
          </div>
          <Progress value={program.progress_percentage} className="bg-gray-400/30" />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-1" />
            <span>Started: {formatDate(program.start_date)}</span>
          </div>
          <span>Ends: {formatDate(program.end_date)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentProgramCard;
