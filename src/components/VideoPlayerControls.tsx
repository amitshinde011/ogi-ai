
import React from 'react';
import { Play, Pause } from 'lucide-react';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  videoLoaded: boolean;
  onPlayPause: () => void;
}

const VideoPlayerControls = ({ isPlaying, videoLoaded, onPlayPause }: VideoPlayerControlsProps) => {
  if (!videoLoaded) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <button
        className="w-12 h-12 sm:w-16 sm:h-16 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
        ) : (
          <Play className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 ml-0.5 sm:ml-1" />
        )}
      </button>
    </div>
  );
};

export default VideoPlayerControls;
