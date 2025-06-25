
import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VideoPlayerCore from '@/components/VideoPlayerCore';
import VideoPlayerControls from '@/components/VideoPlayerControls';
import VideoPlayerStates from '@/components/VideoPlayerStates';
import { SURYA_NAMASKAR_VIDEO_SOURCES } from '@/constants/videoSources';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';

const SuryaNamaskarVideoPlayer = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    isPlaying,
    videoLoaded,
    videoError,
    currentQuality,
    currentTime,
    duration,
    isFullscreen,
    videoRef,
    containerRef,
    handlePlayPause,
    handleVideoEnd,
    handleVideoLoadedData,
    handleVideoError,
    handleVideoLoadStart,
    handleVideoCanPlay,
    handleRetry,
    handleSeek,
    handleSeekBack,
    handleSeekForward,
    handleToggleFullscreen,
    handleQualityChange,
    setIsPlaying
  } = useVideoPlayer({ 
    onVideoComplete: () => {}, 
    videoWatched: false 
  });

  const handleOpenVideo = () => {
    setIsOpen(true);
  };

  const handleCloseVideo = () => {
    setIsOpen(false);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleOpenVideo}
        className="p-1 h-6 w-6 text-orange-500 hover:text-orange-600"
      >
        <Play className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Surya Namaskar Tutorial
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseVideo}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div 
            ref={containerRef}
            className="bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden"
          >
            <div className="w-full h-full relative">
              <VideoPlayerCore
                videoRef={videoRef}
                videoSources={SURYA_NAMASKAR_VIDEO_SOURCES}
                currentQuality={currentQuality}
                currentVideoIndex={0}
                onEnded={handleVideoEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedData={handleVideoLoadedData}
                onLoadStart={handleVideoLoadStart}
                onCanPlay={handleVideoCanPlay}
                onError={handleVideoError}
              />
              
              <VideoPlayerControls
                isPlaying={isPlaying}
                videoLoaded={videoLoaded}
                currentTime={currentTime}
                duration={duration}
                isFullscreen={isFullscreen}
                currentQuality={currentQuality}
                onPlayPause={handlePlayPause}
                onSeek={handleSeek}
                onSeekBack={handleSeekBack}
                onSeekForward={handleSeekForward}
                onToggleFullscreen={handleToggleFullscreen}
                onQualityChange={handleQualityChange}
              />

              <VideoPlayerStates
                videoLoaded={videoLoaded}
                videoError={videoError}
                videoWatched={false}
                currentQuality={currentQuality}
                onRetry={handleRetry}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SuryaNamaskarVideoPlayer;
