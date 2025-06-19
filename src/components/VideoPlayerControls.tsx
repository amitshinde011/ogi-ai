
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw, Maximize, Minimize, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  videoLoaded: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  currentQuality: 'high' | 'medium' | 'low';
  onQualityChange: (quality: 'high' | 'medium' | 'low') => void;
}

const VideoPlayerControls = ({ 
  isPlaying, 
  videoLoaded, 
  currentTime, 
  duration, 
  onPlayPause, 
  onSeek, 
  onSeekBack, 
  onSeekForward,
  onToggleFullscreen,
  isFullscreen,
  currentQuality,
  onQualityChange
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

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'high': return '1080p';
      case 'medium': return '720p';
      case 'low': return '480p';
      default: return quality;
    }
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
              title="Seek back 10 seconds"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Seek Forward Button */}
            <button
              className="p-1.5 sm:p-2 text-white/80 hover:text-white transition-colors"
              onClick={onSeekForward}
              title="Seek forward 10 seconds"
            >
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Time Display */}
            <div className="text-white/90 text-xs sm:text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Quality Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1.5 sm:p-2 text-white/80 hover:text-white transition-colors flex items-center space-x-1"
                  title="Video quality"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm hidden sm:inline">
                    {getQualityLabel(currentQuality)}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                side="top"
                className="bg-black/90 border-white/20 text-white min-w-[120px]"
              >
                <DropdownMenuItem
                  onClick={() => onQualityChange('high')}
                  className={`cursor-pointer hover:bg-white/20 ${
                    currentQuality === 'high' ? 'bg-white/20' : ''
                  }`}
                >
                  1080p (High)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onQualityChange('medium')}
                  className={`cursor-pointer hover:bg-white/20 ${
                    currentQuality === 'medium' ? 'bg-white/20' : ''
                  }`}
                >
                  720p (Medium)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onQualityChange('low')}
                  className={`cursor-pointer hover:bg-white/20 ${
                    currentQuality === 'low' ? 'bg-white/20' : ''
                  }`}
                >
                  480p (Low)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen Button */}
            <button
              className="p-1.5 sm:p-2 text-white/80 hover:text-white transition-colors"
              onClick={onToggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerControls;
