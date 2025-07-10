
import React from 'react';
import { CheckCircle, Play } from 'lucide-react';

interface VideoSequenceManagerProps {
  currentVideoIndex: number;
  totalVideos: number;
  videoWatched: boolean[];
  onVideoSelect: (index: number) => void;
}

const VideoSequenceManager = ({ 
  currentVideoIndex, 
  totalVideos, 
  videoWatched, 
  onVideoSelect 
}: VideoSequenceManagerProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-lg">
      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3">Video Sequence</h3>
      <div className="flex items-center justify-start space-x-2 sm:space-x-3 overflow-x-auto pb-2 px-2">
        {Array.from({ length: totalVideos }, (_, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => onVideoSelect(index)}
              disabled={index > 0 && !videoWatched[index - 1]}
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-200 flex-shrink-0 ${
                index === currentVideoIndex
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : videoWatched[index]
                  ? 'bg-green-600 text-white'
                  : index > 0 && !videoWatched[index - 1]
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {videoWatched[index] ? (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />
              )}
            </button>
            {index < totalVideos - 1 && (
              <div className={`h-0.5 w-4 sm:w-6 md:w-8 flex-shrink-0 ${
                videoWatched[index] ? 'bg-green-600' : 'bg-slate-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600 text-center sm:text-left">
        Video {currentVideoIndex + 1} of {totalVideos}
        {currentVideoIndex > 0 && !videoWatched[currentVideoIndex - 1] && (
          <span className="block text-orange-600 mt-1">
            Complete the previous video to unlock this one
          </span>
        )}
      </div>
    </div>
  );
};

export default VideoSequenceManager;
