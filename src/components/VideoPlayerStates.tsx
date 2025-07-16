
import React, { memo } from 'react';
import { CheckCircle } from 'lucide-react';

interface VideoPlayerStatesProps {
  videoLoaded: boolean;
  videoError: boolean;
  videoWatched: boolean;
  currentQuality: 'high' | 'medium' | 'low';
  onRetry: () => void;
}

const VideoPlayerStates = ({ 
  videoLoaded, 
  videoError, 
  videoWatched, 
  currentQuality, 
  onRetry 
}: VideoPlayerStatesProps) => {
  return (
    <>
      {/* Loading indicator with quality info */}
      {!videoLoaded && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-2xl sm:rounded-3xl">
          <div className="text-center text-white px-4">
            <div className="text-base sm:text-lg mb-2">Loading video...</div>
            <div className="text-sm opacity-75">Quality: {currentQuality}</div>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 rounded-2xl sm:rounded-3xl">
          <div className="text-white text-base sm:text-lg text-center px-4">
            <p className="mb-2">Video failed to load</p>
            <button 
              className="mt-2 px-4 py-2 bg-white text-red-600 rounded text-sm sm:text-base"
              onClick={onRetry}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Video completed indicator */}
      {videoWatched && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-green-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full flex items-center space-x-1 sm:space-x-2">
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">Completed</span>
        </div>
      )}
    </>
  );
};

export default memo(VideoPlayerStates);
