
import React, { useState, useRef, useEffect } from 'react';
import { Play, CheckCircle, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';

interface VideoPlayerProps {
  onVideoComplete: () => void;
  videoWatched: boolean;
}

const VideoPlayer = ({ onVideoComplete, videoWatched }: VideoPlayerProps) => {
  const { trackButtonClick } = useAnalytics();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Add useEffect to monitor showVideo state changes
  useEffect(() => {
    console.log('showVideo state changed:', showVideo);
    if (showVideo && videoRef.current) {
      console.log('Video element exists after showVideo=true:', videoRef.current);
      // Force video to load
      videoRef.current.load();
    }
  }, [showVideo]);

  const handlePlayPause = () => {
    console.log('Play/Pause clicked, video ref:', videoRef.current);
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
      setIsPlaying(true);
    }
  };

  const handleShowVideo = () => {
    console.log('Show video button clicked - BEFORE state change');
    console.log('Current showVideo state:', showVideo);
    setShowVideo(true);
    setVideoError(false);
    setVideoLoaded(false);
    console.log('Show video button clicked - AFTER setting showVideo to true');
    trackButtonClick('Show Video Player', 'Intro Video Page');
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onVideoComplete();
  };

  const handleVideoLoadedData = () => {
    setVideoLoaded(true);
    console.log('Video loaded successfully');
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e.currentTarget.error);
    console.error('Video error details:', {
      code: e.currentTarget.error?.code,
      message: e.currentTarget.error?.message
    });
    setVideoError(true);
    setVideoLoaded(false);
  };

  const handleVideoLoadStart = () => {
    console.log('Video load started');
    setVideoLoaded(false);
    setVideoError(false);
  };

  const handleVideoCanPlay = () => {
    console.log('Video can play');
  };

  // Prevent right-click context menu on video
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  console.log('VideoPlayer render - showVideo:', showVideo, 'videoLoaded:', videoLoaded, 'videoError:', videoError);

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl aspect-video flex items-center justify-center shadow-inner overflow-hidden">
      {!showVideo ? (
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
            onClick={handleShowVideo}
          >
            <Play className="w-6 h-6 mr-3" />
            Watch Video
          </Button>
        </div>
      ) : (
        <div className="w-full h-full relative bg-black rounded-3xl">
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-3xl select-none"
            onEnded={handleVideoEnd}
            onPlay={() => {
              console.log('Video started playing');
              setIsPlaying(true);
            }}
            onPause={() => {
              console.log('Video paused');
              setIsPlaying(false);
            }}
            onLoadedData={handleVideoLoadedData}
            onLoadStart={handleVideoLoadStart}
            onCanPlay={handleVideoCanPlay}
            onError={handleVideoError}
            onContextMenu={handleContextMenu}
            controls={false}
            preload="metadata"
            style={{ 
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
            onDragStart={(e) => e.preventDefault()}
            draggable={false}
          >
            <source src="https://mxigbftmmkqnhmocyeeo.supabase.co/storage/v1/object/sign/videos/pArts.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNDBlZGRiZS05OTQxLTQwODktYjRjZi03OGJiZjJkMTQyMGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvcEFydHMubXA0IiwiaWF0IjoxNzUwMzMwMzg4LCJleHAiOjE5MDgwMTAzODh9.aFAPFE-DGjM4-fl0tk40VEELJBIgjDDy3ZXHvwP-T4s" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Custom play/pause overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            {videoLoaded && (
              <button
                className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-indigo-600" />
                ) : (
                  <Play className="w-8 h-8 text-indigo-600 ml-1" />
                )}
              </button>
            )}
          </div>

          {/* Loading indicator */}
          {!videoLoaded && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-3xl">
              <div className="text-white text-lg">Loading video...</div>
            </div>
          )}

          {/* Error indicator */}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 rounded-3xl">
              <div className="text-white text-lg text-center">
                <p>Video failed to load</p>
                <button 
                  className="mt-2 px-4 py-2 bg-white text-red-600 rounded"
                  onClick={() => {
                    console.log('Retry button clicked');
                    setVideoError(false);
                    setVideoLoaded(false);
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}
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
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
