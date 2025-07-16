
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

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

interface ProgramCardProps {
  program: ProgramData;
}

const ProgramCard = ({ program }: ProgramCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string, endDate: string) => {
    const today = new Date();
    const isCompleted = new Date(endDate + 'T00:00:00') < today;
    
    if (isCompleted) {
      return <Badge className="bg-green-500">Completed</Badge>;
    } else if (status === 'active') {
      return <Badge className="bg-blue-500">In Progress</Badge>;
    } else {
      return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-primary">{program.name}</h3>
            <p className="text-sm text-gray-600">
              {formatDate(program.start_date)} - {formatDate(program.end_date)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(program.status, program.end_date)}
            {program.progress_percentage >= 100 && (
              <Trophy className="w-5 h-5 text-yellow-500" />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Completion</span>
            <span>{Math.round(program.progress_percentage)}%</span>
          </div>
          <Progress value={program.progress_percentage} className="h-2" />
          <p className="text-xs text-gray-500">
            {program.days_completed} of {program.duration_days} days completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramCard;
