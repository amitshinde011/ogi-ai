
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
        className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 text-indigo-600" />
        ) : (
          <Play className="w-8 h-8 text-indigo-600 ml-1" />
        )}
      </button>
    </div>
  );
};

export default VideoPlayerControls;
