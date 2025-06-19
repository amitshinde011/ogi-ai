
import React from 'react';
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
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-3xl">
          <div className="text-center text-white">
            <div className="text-lg mb-2">Loading video...</div>
            <div className="text-sm opacity-75">Quality: {currentQuality}</div>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 rounded-3xl">
          <div className="text-white text-lg text-center">
            <p>Video failed to load</p>
            <button 
              className="mt-2 px-4 py-2 bg-white text-red-600 rounded"
              onClick={onRetry}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Video completed indicator */}
      {videoWatched && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full flex items-center space-x-2">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Completed</span>
        </div>
      )}
    </>
  );
};

export default VideoPlayerStates;
