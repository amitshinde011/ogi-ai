
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoProgramCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white w-full max-w-md mx-auto">
      <CardContent className="p-4 sm:p-6 text-center">
        <Search size={40} strokeWidth={1.5} className="text-gray-400 mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12" />
        <h3 className="font-semibold text-primary mb-2 text-sm sm:text-base">No Active Program</h3>
        <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">Start your wellness journey today!</p>
        <Button 
          onClick={() => navigate('/subscriptions')}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
        >
          Browse Programs
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoProgramCard;
