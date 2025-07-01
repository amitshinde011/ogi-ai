
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoProgramCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 border-2 border-purple-200 w-full">
      <CardContent className="p-4 sm:p-6 text-center">
        <div className="relative">
          <Search size={40} strokeWidth={1.5} className="text-purple-500 mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12" />
          <Sparkles size={20} className="text-pink-500 absolute -top-1 -right-8 animate-pulse" />
        </div>
        <h3 className="font-bold text-purple-700 mb-2 text-sm sm:text-base">No Active Program</h3>
        <p className="text-purple-600 mb-3 sm:mb-4 text-xs sm:text-sm">Start your wellness journey today!</p>
        <Button 
          onClick={() => navigate('/subscriptions')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 hover:from-purple-600 hover:to-pink-600"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Browse Programs
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoProgramCard;
