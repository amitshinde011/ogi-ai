
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  videoLoaded: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
}

const VideoPlayerControls = ({ 
  isPlaying, 
  videoLoaded, 
  currentTime, 
  duration, 
  onPlayPause, 
  onSeek, 
  onSeekBack, 
  onSeekForward 
}: VideoPlayerControlsProps) => {
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!videoLoaded) return;

    const timer = setTimeout(() => {
      if (isPlaying && !isDragging) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls, isPlaying, videoLoaded, isDragging]);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    onSeek(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!videoLoaded) return null;

  return (
    <div 
      className={`absolute inset-0 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowControls(true)}
    >
      {/* Center Play/Pause Button */}
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

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 sm:p-4">
        {/* Progress Bar */}
        <div className="mb-3">
          <div 
            className="w-full h-1 sm:h-1.5 bg-white/30 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-200"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Seek Back Button */}
            <button
              className="p-1.5 sm:p-2 text-white/80 hover:text-white transition-colors"
              onClick={onSeekBack}
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Seek Forward Button */}
            <button
              className="p-1.5 sm:p-2 text-white/80 hover:text-white transition-colors"
              onClick={onSeekForward}
            >
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Time Display */}
          <div className="text-white/90 text-xs sm:text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerControls;
