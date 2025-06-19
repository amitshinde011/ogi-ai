
import React from 'react';
import { Button } from '@/components/ui/button';

interface ContinueSectionProps {
  videoWatched: boolean;
  onContinue: () => void;
}

const ContinueSection = ({ videoWatched, onContinue }: ContinueSectionProps) => {
  return (
    <div className="text-center space-y-4">
      <Button 
        onClick={onContinue}
        disabled={!videoWatched}
        size="lg"
        className={`h-16 px-12 rounded-2xl font-bold text-lg shadow-xl transition-all duration-200 ${
          videoWatched 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105' 
            : 'bg-slate-300 cursor-not-allowed'
        }`}
      >
        Continue to Assessment
      </Button>
      {!videoWatched && (
        <p className="text-slate-500 font-medium">
          Please complete the video to continue
        </p>
      )}
    </div>
  );
};

export default ContinueSection;
