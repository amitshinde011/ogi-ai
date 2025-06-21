
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

  // Effect to handle video source loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentSource = videoSources[currentQuality];
    console.log('VideoPlayerCore: Setting video source to:', currentSource);

    // For HLS streams, check if the browser supports it natively
    if (currentSource.includes('.m3u8')) {
      console.log('VideoPlayerCore: Loading HLS stream');
      
      // Check if browser supports HLS natively (Safari does)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('VideoPlayerCore: Browser supports HLS natively');
        video.src = currentSource;
      } else {
        console.log('VideoPlayerCore: Browser does not support HLS natively');
        // For browsers that don't support HLS natively, we'll still try to load it
        // In a production environment, you would use hls.js library here
        video.src = currentSource;
      }
    } else {
      // Regular MP4 or other formats
      video.src = currentSource;
    }
    
    // Load the video
    video.load();

    const handleLoadError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      console.error('VideoPlayerCore: Video load error:', {
        error: target.error,
        errorCode: target.error?.code,
        errorMessage: target.error?.message,
        src: target.src,
        networkState: target.networkState,
        readyState: target.readyState
      });
    };

    const handleCanPlayThrough = () => {
      console.log('VideoPlayerCore: Video can play through - stream ready');
    };

    const handleLoadedMetadata = () => {
      console.log('VideoPlayerCore: Video metadata loaded successfully');
      console.log('VideoPlayerCore: Video duration:', video.duration);
      console.log('VideoPlayerCore: Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    };

    const handleProgress = () => {
      console.log('VideoPlayerCore: Video loading progress');
    };

    video.addEventListener('error', handleLoadError);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);

    return () => {
      if (video) {
        video.removeEventListener('error', handleLoadError);
        video.removeEventListener('canplaythrough', handleCanPlayThrough);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('progress', handleProgress);
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
      playsInline
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
      key={`${currentQuality}-${videoSources[currentQuality]}`}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayerCore;
