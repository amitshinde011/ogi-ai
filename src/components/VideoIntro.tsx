
import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoIntroProps {
  onShowVideo: () => void;
}

const VideoIntro = ({ onShowVideo }: VideoIntroProps) => {
  return (
    <div className="text-center space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto">
        <Play className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Introduction Video</h3>
        <p className="text-slate-600 text-base sm:text-lg">Essential guidance for your journey</p>
      </div>
      <Button 
        className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg shadow-lg transition-all duration-200 bg-indigo-600 hover:bg-indigo-700"
        onClick={onShowVideo}
      >
        <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
        Watch Video
      </Button>
    </div>
  );
};

export default VideoIntro;
