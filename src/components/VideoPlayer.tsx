
import React from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import VideoIntro from '@/components/VideoIntro';
import VideoPlayerCore from '@/components/VideoPlayerCore';
import VideoPlayerControls from '@/components/VideoPlayerControls';
import VideoPlayerStates from '@/components/VideoPlayerStates';
import VideoSequenceManager from '@/components/VideoSequenceManager';

interface VideoPlayerProps {
  onVideoComplete: () => void;
  videoWatched: boolean;
}

const VideoPlayer = ({ onVideoComplete, videoWatched }: VideoPlayerProps) => {
  const {
    isPlaying,
    showVideo,
    videoLoaded,
    videoError,
    currentQuality,
    currentTime,
    duration,
    isFullscreen,
    currentVideoIndex,
    totalVideos,
    videoWatchedStates,
    videoRef,
    containerRef,
    videoSources,
    handlePlayPause,
    handleShowVideo,
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
    handleVideoSelect,
    setIsPlaying
  } = useVideoPlayer({ onVideoComplete, videoWatched });

  console.log('VideoPlayer render - showVideo:', showVideo, 'videoLoaded:', videoLoaded, 'videoError:', videoError);

  return (
    <div className="space-y-6">
      {showVideo && (
        <VideoSequenceManager
          currentVideoIndex={currentVideoIndex}
          totalVideos={totalVideos}
          videoWatched={videoWatchedStates}
          onVideoSelect={handleVideoSelect}
        />
      )}
      
      <div 
        ref={containerRef}
        className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl sm:rounded-3xl aspect-video flex items-center justify-center shadow-inner overflow-hidden"
      >
        {!showVideo ? (
          <VideoIntro onShowVideo={handleShowVideo} />
        ) : (
          <div className="w-full h-full relative bg-black rounded-2xl sm:rounded-3xl">
            <VideoPlayerCore
              videoRef={videoRef}
              videoSources={videoSources}
              currentQuality={currentQuality}
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
              videoWatched={videoWatchedStates[currentVideoIndex]}
              currentQuality={currentQuality}
              onRetry={handleRetry}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
