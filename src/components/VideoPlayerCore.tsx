
import React from 'react';

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
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      onDragStart={(e) => e.preventDefault()}
      draggable={false}
    >
      <source src={videoSources[currentQuality]} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayerCore;
