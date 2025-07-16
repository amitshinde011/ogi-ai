
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ProgramInfoCardProps {
  programName?: string;
}

const ProgramInfoCard = ({ programName }: ProgramInfoCardProps) => {
  if (!programName) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 max-w-md mx-auto">
      <CardContent className="p-4">
        <h3 className="font-semibold text-indigo-900 mb-1">{programName}</h3>
        <p className="text-sm text-indigo-600">Program recipes available below</p>
      </CardContent>
    </Card>
  );
};

export default ProgramInfoCard;
