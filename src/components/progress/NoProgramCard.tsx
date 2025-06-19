
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoProgramCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white">
      <CardContent className="p-6 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="font-semibold text-primary mb-2">No Active Program</h3>
        <p className="text-gray-600 mb-4">Start your wellness journey today!</p>
        <Button 
          onClick={() => navigate('/subscriptions')}
          className="bg-gradient-sage text-white"
        >
          Browse Programs
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoProgramCard;
