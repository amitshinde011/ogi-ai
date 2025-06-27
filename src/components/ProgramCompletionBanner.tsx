
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProgramCompletionBannerProps {
  completedSubscription: any;
}

const ProgramCompletionBanner = ({ completedSubscription }: ProgramCompletionBannerProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-green-400 to-emerald-400 text-white animate-pulse">
      <CardContent className="p-4 text-center">
        <span className="text-4xl block mb-2">🏆</span>
        <h3 className="font-bold text-lg">Congratulations! 🎉</h3>
        <p className="text-sm mb-3">You've completed your {completedSubscription.programs?.name}!</p>
        <Button 
          onClick={() => navigate('/program-complete')}
          className="bg-white text-green-600 hover:bg-gray-100 text-sm px-4 py-2"
        >
          View Your Achievement
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProgramCompletionBanner;
