
import React from 'react';
import { Button } from '@/components/ui/button';

interface ContinueSectionProps {
  videoWatched: boolean;
  onContinue: () => void;
}

const ContinueSection = ({ videoWatched, onContinue }: ContinueSectionProps) => {
  console.log('🔘 ContinueSection received videoWatched:', videoWatched);
  
  return (
    <div className="text-center space-y-3 sm:space-y-4 px-4 sm:px-0">
      <Button 
        onClick={onContinue}
        disabled={!videoWatched}
        size="lg"
        className={`h-12 sm:h-16 px-8 sm:px-12 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-xl transition-all duration-200 w-full sm:w-auto ${
          videoWatched 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105' 
            : 'bg-slate-300 cursor-not-allowed'
        }`}
      >
        Continue to Assessment
      </Button>
      {!videoWatched && (
        <p className="text-slate-500 font-medium text-sm sm:text-base">
          Please complete the video to continue
        </p>
      )}
    </div>
  );
};

export default ContinueSection;
