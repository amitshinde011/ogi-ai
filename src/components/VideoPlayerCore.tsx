
import React, { useEffect, useRef } from 'react';
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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Effect to handle video source loading with hls.js
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentSource = videoSources[currentQuality];
    
    // Prevent unnecessary reloads if source hasn't changed
    if (currentSourceRef.current === currentSource) {
      return;
    }
    
    currentSourceRef.current = currentSource;
    console.log('VideoPlayerCore: Setting video source to:', currentSource);

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // For HLS streams
    if (currentSource.includes('.m3u8')) {
      console.log('VideoPlayerCore: Loading HLS stream');
      
      // Check if browser supports HLS natively (Safari does)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('VideoPlayerCore: Browser supports HLS natively');
        video.src = currentSource;
        video.crossOrigin = 'anonymous';
      } else if (Hls.isSupported()) {
        console.log('VideoPlayerCore: Using hls.js for HLS support');
        const hls = new Hls({
          debug: false,
          enableWorker: true,
          lowLatencyMode: true,
          xhrSetup: function(xhr, url) {
            // Add CORS headers for Cloudflare Stream
            console.log('VideoPlayerCore: Setting up XHR for URL:', url);
          }
        });
        
        hlsRef.current = hls;
        hls.loadSource(currentSource);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('VideoPlayerCore: HLS manifest parsed successfully');
          onLoadedData();
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('VideoPlayerCore: HLS error:', data);
          console.error('VideoPlayerCore: HLS error details:', {
            type: data.type,
            details: data.details,
            fatal: data.fatal,
            url: data.url,
            response: data.response
          });
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('VideoPlayerCore: Fatal network error encountered, trying to recover');
                console.error('VideoPlayerCore: This might be a CORS/CSP issue with Cloudflare Stream');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('VideoPlayerCore: Fatal media error encountered, trying to recover');
                hls.recoverMediaError();
                break;
              default:
                console.error('VideoPlayerCore: Fatal error, cannot recover');
                hls.destroy();
                hlsRef.current = null;
                break;
            }
          }
        });
      } else {
        console.error('VideoPlayerCore: HLS is not supported in this browser');
        video.src = currentSource;
        video.crossOrigin = 'anonymous';
      }
    } else {
      // Regular MP4 or other formats
      console.log('VideoPlayerCore: Loading regular video format');
      video.src = currentSource;
      video.crossOrigin = 'anonymous';
    }
    
    // Load the video
    video.load();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoSources, currentQuality, onLoadedData]);

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
      key={`${currentQuality}-${videoSources[currentQuality]}`}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayerCore;
