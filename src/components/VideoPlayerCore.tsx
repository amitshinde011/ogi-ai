
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { MP4_SOURCES_SEQUENCE, IFRAME_URLS } from '@/constants/videoSources';

interface VideoPlayerCoreProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoSources: {
    high: string;
    medium: string;
    low: string;
  };
  currentQuality: 'high' | 'medium' | 'low';
  currentVideoIndex: number;
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
  currentVideoIndex,
  onEnded,
  onPlay,
  onPause,
  onLoadedData,
  onLoadStart,
  onCanPlay,
  onError
}: VideoPlayerCoreProps) => {
  const hlsRef = useRef<Hls | null>(null);
  const currentSourceRef = useRef<string>('');
  const [useMP4Fallback, setUseMP4Fallback] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Effect to handle video source loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video || useIframeFallback) return;

    const currentSource = useMP4Fallback 
      ? MP4_SOURCES_SEQUENCE[currentVideoIndex][currentQuality]
      : videoSources[currentQuality];
    
    // Prevent unnecessary reloads if source hasn't changed
    if (currentSourceRef.current === currentSource) {
      return;
    }
    
    currentSourceRef.current = currentSource;
    
    console.log('VideoPlayerCore: Setting video source to:', currentSource);
    console.log('VideoPlayerCore: Using MP4 fallback:', useMP4Fallback);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!useMP4Fallback && currentSource.includes('.m3u8')) {
      // Try HLS first
      if (Hls.isSupported()) {
        console.log('VideoPlayerCore: Using HLS.js for M3U8');
        const hls = new Hls();
        hlsRef.current = hls;
        
        hls.loadSource(currentSource);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('VideoPlayerCore: HLS manifest parsed successfully');
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('VideoPlayerCore: HLS error:', data);
          if (data.fatal) {
            console.log('VideoPlayerCore: Fatal HLS error, trying MP4 fallback');
            setUseMP4Fallback(true);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        console.log('VideoPlayerCore: Using native HLS support');
        video.src = currentSource;
      } else {
        // No HLS support, use MP4 fallback
        console.log('VideoPlayerCore: No HLS support, using MP4 fallback');
        setUseMP4Fallback(true);
        return;
      }
    } else {
      // Use MP4 directly
      console.log('VideoPlayerCore: Using MP4 source');
      video.src = currentSource;
    }
    
    video.crossOrigin = 'anonymous';
    
    // Set up error handler to try iframe fallback
    const handleVideoError = (e: Event) => {
      const target = e.target as HTMLVideoElement;
      console.error('VideoPlayerCore: Video error:', target.error);
      
      if (!useMP4Fallback) {
        console.log('VideoPlayerCore: HLS failed, trying MP4 fallback');
        setUseMP4Fallback(true);
      } else {
        console.log('VideoPlayerCore: MP4 failed, trying iframe fallback');
        setUseIframeFallback(true);
      }
    };
    
    video.addEventListener('error', handleVideoError, { once: true });
    
    return () => {
      video.removeEventListener('error', handleVideoError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoSources, currentQuality, currentVideoIndex, useMP4Fallback, useIframeFallback]);

  // Reset fallback states when video index changes
  useEffect(() => {
    setUseMP4Fallback(false);
    setUseIframeFallback(false);
  }, [currentVideoIndex]);

  // If we need to use iframe fallback
  if (useIframeFallback) {
    const iframeUrl = IFRAME_URLS[currentVideoIndex];
    
    return (
      <div className="w-full h-full relative">
        <iframe
          src={iframeUrl}
          className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          onLoad={() => {
            console.log('VideoPlayerCore: Iframe loaded successfully');
            onLoadedData();
          }}
          onError={() => {
            console.error('VideoPlayerCore: Iframe failed to load');
            onError({} as React.SyntheticEvent<HTMLVideoElement, Event>);
          }}
        />
        {/* Overlay for iframe interaction */}
        <div 
          className="absolute inset-0 pointer-events-none"
          onContextMenu={handleContextMenu}
        />
      </div>
    );
  }

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
      preload="auto"
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
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayerCore;
