
import { useState, useRef, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { VideoPlayerHookProps, VideoPlayerState, VideoSources } from '@/types/videoPlayer';
import { VIDEO_SOURCES, generateSignedVideoSources } from '@/constants/videoSources';
import { detectNetworkSpeed, shouldReduceQuality } from '@/utils/videoQualityDetector';
import { toggleFullscreen, setupFullscreenListener } from '@/utils/fullscreenHandler';
import { setupVideoTimeListeners, seekToTime, seekBackward, seekForward } from '@/utils/videoTimeManager';

export const useVideoPlayer = ({ onVideoComplete, videoWatched }: VideoPlayerHookProps) => {
  const { trackButtonClick } = useAnalytics();
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    showVideo: false,
    videoLoaded: false,
    videoError: false,
    currentQuality: 'high',
    loadingStartTime: null,
    currentTime: 0,
    duration: 0,
    isFullscreen: false,
  });

  const [videoSources, setVideoSources] = useState<VideoSources>(VIDEO_SOURCES);
  const [signedUrlsLoaded, setSignedUrlsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load signed video URLs when component mounts
  useEffect(() => {
    console.log('useVideoPlayer: Starting to load signed URLs');
    const loadSignedUrls = async () => {
      try {
        console.log('useVideoPlayer: Calling generateSignedVideoSources');
        const signedSources = await generateSignedVideoSources();
        console.log('useVideoPlayer: Received signed sources:', signedSources);
        setVideoSources(signedSources);
        setSignedUrlsLoaded(true);
        console.log('useVideoPlayer: Successfully loaded signed video URLs');
      } catch (error) {
        console.error('useVideoPlayer: Failed to load signed URLs:', error);
        console.log('useVideoPlayer: Will use fallback URLs for development');
        setSignedUrlsLoaded(false);
      }
    };

    loadSignedUrls();
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    return setupFullscreenListener(setState);
  }, []);

  // Network speed detection
  useEffect(() => {
    const quality = detectNetworkSpeed();
    setState(prev => ({ ...prev, currentQuality: quality }));
  }, []);

  // Video time update listener
  useEffect(() => {
    return setupVideoTimeListeners(videoRef, setState, state.videoLoaded);
  }, [state.videoLoaded]);

  // Monitor showVideo state changes
  useEffect(() => {
    console.log('showVideo state changed:', state.showVideo);
    if (state.showVideo && videoRef.current) {
      console.log('Video element exists after showVideo=true:', videoRef.current);
      console.log('Using signed URLs loaded:', signedUrlsLoaded);
      console.log('Current video sources:', videoSources);
      videoRef.current.load();
    }
  }, [state.showVideo, signedUrlsLoaded, videoSources]);

  // Monitor loading time and adjust quality if needed
  useEffect(() => {
    if (state.loadingStartTime && state.videoLoaded) {
      const loadingTime = Date.now() - state.loadingStartTime;
      console.log('Video loading time:', loadingTime, 'ms');
      
      const newQuality = shouldReduceQuality(loadingTime, state.currentQuality);
      if (newQuality) {
        setState(prev => ({ ...prev, currentQuality: newQuality }));
      }
    }
  }, [state.videoLoaded, state.loadingStartTime, state.currentQuality]);

  const handleToggleFullscreen = () => toggleFullscreen(containerRef);

  const handlePlayPause = () => {
    console.log('Play/Pause clicked, video ref:', videoRef.current);
    if (!videoRef.current) return;

    if (state.isPlaying) {
      videoRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleSeek = (time: number) => {
    seekToTime(videoRef, time, setState);
  };

  const handleSeekBack = () => {
    seekBackward(videoRef, setState);
  };

  const handleSeekForward = () => {
    seekForward(videoRef, state.duration, setState);
  };

  const handleQualityChange = (quality: 'high' | 'medium' | 'low') => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    const wasPlaying = state.isPlaying;
    
    console.log('Quality change requested:', quality);
    
    setState(prev => ({
      ...prev,
      currentQuality: quality,
      videoLoaded: false,
      videoError: false,
      loadingStartTime: Date.now()
    }));
    
    // Reload video with new quality
    videoRef.current.load();
    
    // Restore playback state after video loads
    if (videoRef.current) {
      const restorePlayback = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
          if (wasPlaying) {
            videoRef.current.play().catch(console.error);
          }
        }
      };
      
      videoRef.current.addEventListener('loadeddata', restorePlayback, { once: true });
    }
  };

  const handleShowVideo = () => {
    console.log('Show video button clicked - BEFORE state change');
    console.log('Current showVideo state:', state.showVideo);
    console.log('Selected video quality:', state.currentQuality);
    console.log('Using video sources:', videoSources);
    console.log('Signed URLs loaded:', signedUrlsLoaded);
    setState(prev => ({
      ...prev,
      showVideo: true,
      videoError: false,
      videoLoaded: false,
      loadingStartTime: Date.now()
    }));
    console.log('Show video button clicked - AFTER setting showVideo to true');
    trackButtonClick('Show Video Player', 'Intro Video Page');
  };

  const handleVideoEnd = () => {
    setState(prev => ({ ...prev, isPlaying: false }));
    onVideoComplete();
  };

  const handleVideoLoadedData = () => {
    setState(prev => ({ ...prev, videoLoaded: true }));
    console.log('Video loaded successfully with quality:', state.currentQuality);
    console.log('Video loaded from signed URLs:', signedUrlsLoaded);
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e.currentTarget.error);
    console.error('Video error details:', {
      code: e.currentTarget.error?.code,
      message: e.currentTarget.error?.message,
      currentSrc: e.currentTarget.currentSrc,
      signedUrlsLoaded: signedUrlsLoaded
    });
    
    // If we're using signed URLs and get an error, don't try to fall back to unsigned URLs
    if (signedUrlsLoaded) {
      console.log('Error with signed URLs - this might be a network issue or expired token');
      setState(prev => ({
        ...prev,
        videoError: true,
        videoLoaded: false
      }));
      return;
    }
    
    // Quality fallback logic for development/fallback URLs
    if (state.currentQuality === 'high') {
      console.log('High quality failed, trying medium quality');
      setState(prev => ({
        ...prev,
        currentQuality: 'medium',
        videoError: false,
        videoLoaded: false
      }));
      if (videoRef.current) {
        videoRef.current.load();
      }
    } else if (state.currentQuality === 'medium') {
      console.log('Medium quality failed, trying low quality');
      setState(prev => ({
        ...prev,
        currentQuality: 'low',
        videoError: false,
        videoLoaded: false
      }));
      if (videoRef.current) {
        videoRef.current.load();
      }
    } else {
      setState(prev => ({
        ...prev,
        videoError: true,
        videoLoaded: false
      }));
    }
  };

  const handleVideoLoadStart = () => {
    console.log('Video load started with quality:', state.currentQuality);
    console.log('Video load started with signed URLs:', signedUrlsLoaded);
    setState(prev => ({
      ...prev,
      videoLoaded: false,
      videoError: false,
      loadingStartTime: prev.loadingStartTime || Date.now()
    }));
  };

  const handleVideoCanPlay = () => {
    console.log('Video can play');
  };

  const handleRetry = () => {
    console.log('Retry button clicked');
    setState(prev => ({
      ...prev,
      videoError: false,
      videoLoaded: false,
      loadingStartTime: Date.now()
    }));
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const setIsPlaying = (isPlaying: boolean) => {
    setState(prev => ({ ...prev, isPlaying }));
  };

  return {
    // State
    isPlaying: state.isPlaying,
    showVideo: state.showVideo,
    videoLoaded: state.videoLoaded,
    videoError: state.videoError,
    currentQuality: state.currentQuality,
    currentTime: state.currentTime,
    duration: state.duration,
    isFullscreen: state.isFullscreen,
    videoRef,
    containerRef,
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
    handleToggleFullscreen,
    handleQualityChange,
    
    // Setters for state updates
    setIsPlaying
  };
};
