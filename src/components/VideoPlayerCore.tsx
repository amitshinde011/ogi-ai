
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

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
  const hlsRef = useRef<Hls | null>(null);
  const currentSourceRef = useRef<string>('');
  const [useIframe, setUseIframe] = useState(false);
  const [videoId, setVideoId] = useState<string>('');

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Extract video ID from Cloudflare Stream URL
  const extractVideoId = (url: string): string => {
    const match = url.match(/\/([a-f0-9]{32})\//);
    return match ? match[1] : '';
  };

  // Convert to MP4 URL as fallback
  const getMP4Url = (originalUrl: string, quality: 'high' | 'medium' | 'low'): string => {
    const videoId = extractVideoId(originalUrl);
    if (!videoId) return originalUrl;
    
    // Use Cloudflare Stream's MP4 download URLs
    const qualityMap = {
      high: '1080p',
      medium: '720p', 
      low: '480p'
    };
    
    return `https://customer-cnlj15s4to2idzsi.cloudflarestream.com/${videoId}/downloads/default.mp4`;
  };

  // Effect to handle video source loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video || useIframe) return;

    const currentSource = videoSources[currentQuality];
    
    // Prevent unnecessary reloads if source hasn't changed
    if (currentSourceRef.current === currentSource) {
      return;
    }
    
    currentSourceRef.current = currentSource;
    const extractedVideoId = extractVideoId(currentSource);
    setVideoId(extractedVideoId);
    
    console.log('VideoPlayerCore: Setting video source to:', currentSource);
    console.log('VideoPlayerCore: Extracted video ID:', extractedVideoId);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Try MP4 first as it's more reliable
    const mp4Url = getMP4Url(currentSource, currentQuality);
    console.log('VideoPlayerCore: Trying MP4 URL:', mp4Url);
    
    video.src = mp4Url;
    video.crossOrigin = 'anonymous';
    
    // Set up error handler to try iframe fallback
    const handleVideoError = () => {
      console.log('VideoPlayerCore: MP4 failed, trying iframe fallback');
      setUseIframe(true);
    };
    
    video.addEventListener('error', handleVideoError, { once: true });
    
    return () => {
      video.removeEventListener('error', handleVideoError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoSources, currentQuality, onLoadedData, useIframe]);

  // If we need to use iframe fallback
  if (useIframe && videoId) {
    return (
      <div className="w-full h-full relative">
        <iframe
          src={`https://customer-cnlj15s4to2idzsi.cloudflarestream.com/${videoId}/iframe`}
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
