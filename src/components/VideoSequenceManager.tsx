
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
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">Video Sequence</h3>
      <div className="flex items-center space-x-3">
        {Array.from({ length: totalVideos }, (_, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => onVideoSelect(index)}
              disabled={index > 0 && !videoWatched[index - 1]}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
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
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
            {index < totalVideos - 1 && (
              <div className={`h-0.5 w-8 ${
                videoWatched[index] ? 'bg-green-600' : 'bg-slate-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-3 text-sm text-slate-600">
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
