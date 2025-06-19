
import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoIntroProps {
  onShowVideo: () => void;
}

const VideoIntro = ({ onShowVideo }: VideoIntroProps) => {
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto">
        <Play className="w-10 h-10 text-indigo-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Introduction Video</h3>
        <p className="text-slate-600 text-lg">Essential guidance for your journey</p>
      </div>
      <Button 
        className="h-14 px-8 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 bg-indigo-600 hover:bg-indigo-700"
        onClick={onShowVideo}
      >
        <Play className="w-6 h-6 mr-3" />
        Watch Video
      </Button>
    </div>
  );
};

export default VideoIntro;
