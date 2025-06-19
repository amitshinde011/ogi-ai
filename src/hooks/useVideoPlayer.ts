import { useState, useRef, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface VideoPlayerHookProps {
  onVideoComplete: () => void;
  videoWatched: boolean;
}

export const useVideoPlayer = ({ onVideoComplete, videoWatched }: VideoPlayerHookProps) => {
  const { trackButtonClick } = useAnalytics();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video quality sources
  const videoSources = {
    high: "https://mxigbftmmkqnhmocyeeo.supabase.co/storage/v1/object/sign/videos/pArts.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNDBlZGRiZS05OTQxLTQwODktYjRjZi03OGJiZjJkMTQyMGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvcEFydHMubXA0IiwiaWF0IjoxNzUwMzMwMzg4LCJleHAiOjE5MDgwMTAzODh9.aFAPFE-DGjM4-fl0tk40VEELJBIgjDDy3ZXHvwP-T4s",
    medium: "https://mxigbftmmkqnhmocyeeo.supabase.co/storage/v1/object/sign/videos/pArts.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNDBlZGRiZS05OTQxLTQwODktYjRjZi03OGJiZjJkMTQyMGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvcEFydHMubXA0IiwiaWF0IjoxNzUwMzMwMzg4LCJleHAiOjE5MDgwMTAzODh9.aFAPFE-DGjM4-fl0tk40VEELJBIgjDDy3ZXHvwP-T4s",
    low: "https://mxigbftmmkqnhmocyeeo.supabase.co/storage/v1/object/sign/videos/pArts.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8yNDBlZGRiZS05OTQxLTQwODktYjRjZi03OGJiZjJkMTQyMGIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvcEFydHMubXA0IiwiaWF0IjoxNzUwMzMwMzg4LCJleHAiOjE5MDgwMTAzODh9.aFAPFE-DGjM4-fl0tk40VEELJBIgjDDy3ZXHvwP-T4s"
  };

  // Network speed detection
  useEffect(() => {
    const detectNetworkSpeed = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const effectiveType = connection?.effectiveType;
        
        console.log('Network effective type:', effectiveType);
        
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setCurrentQuality('low');
          console.log('Network is slow, setting quality to low');
        } else if (effectiveType === '3g') {
          setCurrentQuality('medium');
          console.log('Network is medium, setting quality to medium');
        } else {
          setCurrentQuality('high');
          console.log('Network is fast, setting quality to high');
        }
      }
    };

    detectNetworkSpeed();
  }, []);

  // Video time update listener
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateTime);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateTime);
    };
  }, [videoLoaded]);

  // Monitor showVideo state changes
  useEffect(() => {
    console.log('showVideo state changed:', showVideo);
    if (showVideo && videoRef.current) {
      console.log('Video element exists after showVideo=true:', videoRef.current);
      videoRef.current.load();
    }
  }, [showVideo]);

  // Monitor loading time and adjust quality if needed
  useEffect(() => {
    if (loadingStartTime && videoLoaded) {
      const loadingTime = Date.now() - loadingStartTime;
      console.log('Video loading time:', loadingTime, 'ms');
      
      if (loadingTime > 10000 && currentQuality === 'high') {
        console.log('Loading is slow, reducing quality to medium');
        setCurrentQuality('medium');
      } else if (loadingTime > 15000 && currentQuality === 'medium') {
        console.log('Loading is very slow, reducing quality to low');
        setCurrentQuality('low');
      }
    }
  }, [videoLoaded, loadingStartTime, currentQuality]);

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

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSeekBack = () => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeekForward = () => {
    if (!videoRef.current) return;
    const newTime = Math.min(duration, videoRef.current.currentTime + 10);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleShowVideo = () => {
    console.log('Show video button clicked - BEFORE state change');
    console.log('Current showVideo state:', showVideo);
    console.log('Selected video quality:', currentQuality);
    setShowVideo(true);
    setVideoError(false);
    setVideoLoaded(false);
    setLoadingStartTime(Date.now());
    console.log('Show video button clicked - AFTER setting showVideo to true');
    trackButtonClick('Show Video Player', 'Intro Video Page');
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onVideoComplete();
  };

  const handleVideoLoadedData = () => {
    setVideoLoaded(true);
    console.log('Video loaded successfully with quality:', currentQuality);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e.currentTarget.error);
    console.error('Video error details:', {
      code: e.currentTarget.error?.code,
      message: e.currentTarget.error?.message
    });
    
    if (currentQuality === 'high') {
      console.log('High quality failed, trying medium quality');
      setCurrentQuality('medium');
      setVideoError(false);
      setVideoLoaded(false);
      if (videoRef.current) {
        videoRef.current.load();
      }
    } else if (currentQuality === 'medium') {
      console.log('Medium quality failed, trying low quality');
      setCurrentQuality('low');
      setVideoError(false);
      setVideoLoaded(false);
      if (videoRef.current) {
        videoRef.current.load();
      }
    } else {
      setVideoError(true);
      setVideoLoaded(false);
    }
  };

  const handleVideoLoadStart = () => {
    console.log('Video load started with quality:', currentQuality);
    setVideoLoaded(false);
    setVideoError(false);
    if (!loadingStartTime) {
      setLoadingStartTime(Date.now());
    }
  };

  const handleVideoCanPlay = () => {
    console.log('Video can play');
  };

  const handleRetry = () => {
    console.log('Retry button clicked');
    setVideoError(false);
    setVideoLoaded(false);
    setLoadingStartTime(Date.now());
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return {
    // State
    isPlaying,
    showVideo,
    videoLoaded,
    videoError,
    currentQuality,
    currentTime,
    duration,
    videoRef,
    videoSources,
    
    // Handlers
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
    
    // Setters for state updates
    setIsPlaying
  };
};
