
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import ProgramCard from './ProgramCard';

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
}

const ProgramHistorySection = ({ programs }: ProgramHistorySectionProps) => {
  if (programs.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-primary mb-2">No Program History</h3>
          <p className="text-gray-600">Your completed programs will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-primary">Program History</h2>
      {programs.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </div>
  );
};

export default ProgramHistorySection;
