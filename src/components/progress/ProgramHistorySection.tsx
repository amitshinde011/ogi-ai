
import React from 'react';
import { History, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface ProgramHistorySectionProps {
  programs: ProgramData[];
  onItemClick?: (programId: string) => void;
}

const ProgramHistorySection = ({ programs, onItemClick }: ProgramHistorySectionProps) => {
  if (programs.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (program: ProgramData) => {
    const today = new Date();
    const endDate = new Date(program.end_date + 'T00:00:00');
    
    if (program.status === 'completed') {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    } else if (endDate < today) {
      return <Badge className="bg-blue-100 text-blue-800">Finished</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-5 h-5 text-primary" />
          Program History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {programs.map((program) => (
          <div
            key={program.id}
            onClick={() => onItemClick?.(program.id)}
            className={`p-4 border border-gray-200 rounded-lg transition-all ${
              onItemClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{program.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(program.start_date)} - {formatDate(program.end_date)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(program)}
                {onItemClick && (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600">
                  {program.days_completed} of {program.duration_days} days
                </span>
              </div>
              <span className="font-medium text-primary">
                {Math.round(program.progress_percentage)}% Complete
              </span>
            </div>

            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${program.progress_percentage}%` }}
                />
              </div>
            </div>

            {onItemClick && program.progress_percentage === 100 && (
              <div className="mt-3 text-xs text-blue-600 font-medium">
                Click to view your transformation results →
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProgramHistorySection;
