
import React, { useEffect } from 'react';

interface VideoPlayerCoreProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoSources: {
    high: string;
    medium: string;
    low: string;
  };
  currentQuality: 'high' | 'medium' | 'low';
  onEnded: () => void;
  onPlay: () => void;
  onPause: () => void;
  onLoadedData: () => void;
  onLoadStart: () => void;
  onCanPlay: () => void;
  onError: (e: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
}

const VideoPlayerCore = ({
  videoRef,
  videoSources,
  currentQuality,
  onEnded,
  onPlay,
  onPause,
  onLoadedData,
  onLoadStart,
  onCanPlay,
  onError
}: VideoPlayerCoreProps) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Log current video source
  console.log('VideoPlayerCore: Using video source:', videoSources[currentQuality]);
  console.log('VideoPlayerCore: Source type detected:', videoSources[currentQuality].includes('.m3u8') ? 'HLS' : 'MP4');

  // Effect to handle HLS loading and error recovery
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadError = () => {
      console.log('Video load error detected, attempting to reload...');
      setTimeout(() => {
        if (video && video.src) {
          video.load();
        }
      }, 1000);
    };

    const handleCanPlayThrough = () => {
      console.log('Video can play through - HLS stream ready');
    };

    video.addEventListener('error', handleLoadError);
    video.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      if (video) {
        video.removeEventListener('error', handleLoadError);
        video.removeEventListener('canplaythrough', handleCanPlayThrough);
      }
    };
  }, [videoRef, videoSources[currentQuality]]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover rounded-2xl sm:rounded-3xl select-none"
      onEnded={onEnded}
      onPlay={onPlay}
      onPause={onPause}
      onLoadedData={onLoadedData}
      onLoadStart={onLoadStart}
      onCanPlay={onCanPlay}
      onError={onError}
      onContextMenu={handleContextMenu}
      controls={false}
      preload="metadata"
      crossOrigin="anonymous"
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
      key={`${currentQuality}-${videoSources[currentQuality]}`}
      src={videoSources[currentQuality]}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayerCore;
