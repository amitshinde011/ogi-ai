
import { useState, useRef, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { VideoPlayerHookProps, VideoPlayerState, VideoSources } from '@/types/videoPlayer';
import { VIDEO_SOURCES_SEQUENCE } from '@/constants/videoSources';
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
    currentVideoIndex: 0,
    totalVideos: VIDEO_SOURCES_SEQUENCE.length,
  });

  const [videoWatchedStates, setVideoWatchedStates] = useState<boolean[]>(
    new Array(VIDEO_SOURCES_SEQUENCE.length).fill(false)
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current video sources
  const currentVideoSources = VIDEO_SOURCES_SEQUENCE[state.currentVideoIndex];

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

  // Monitor showVideo state changes and reload video when sources change
  useEffect(() => {
    console.log('showVideo state changed:', state.showVideo);
    if (state.showVideo && videoRef.current) {
      console.log('Video element exists after showVideo=true:', videoRef.current);
      console.log('Current video index:', state.currentVideoIndex);
      console.log('Current video sources:', currentVideoSources);
      console.log('Will load video with source:', currentVideoSources[state.currentQuality]);
      
      // Force reload the video element
      videoRef.current.load();
    }
  }, [state.showVideo, state.currentVideoIndex, currentVideoSources, state.currentQuality]);

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
    console.log('New video source will be:', currentVideoSources[quality]);
    
    setState(prev => ({
      ...prev,
      currentQuality: quality,
      videoLoaded: false,
      videoError: false,
      loadingStartTime: Date.now()
    }));
  };

  const handleVideoSelect = (index: number) => {
    // Check if previous videos are watched (except for first video)
    if (index > 0 && !videoWatchedStates[index - 1]) {
      return; // Don't allow selecting if previous video not watched
    }

    setState(prev => ({
      ...prev,
      currentVideoIndex: index,
      videoLoaded: false,
      videoError: false,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      loadingStartTime: Date.now()
    }));
  };

  const handleShowVideo = () => {
    console.log('Show video button clicked');
    setState(prev => ({
      ...prev,
      showVideo: true,
      videoError: false,
      videoLoaded: false,
      loadingStartTime: Date.now()
    }));
    trackButtonClick('Show Video Player', 'Intro Video Page');
  };

  const handleVideoEnd = () => {
    console.log('Video ended, index:', state.currentVideoIndex);
    
    // Mark current video as watched
    const newVideoWatchedStates = [...videoWatchedStates];
    newVideoWatchedStates[state.currentVideoIndex] = true;
    setVideoWatchedStates(newVideoWatchedStates);

    setState(prev => ({ ...prev, isPlaying: false }));

    // Check if this is the last video
    if (state.currentVideoIndex === VIDEO_SOURCES_SEQUENCE.length - 1) {
      // All videos completed
      onVideoComplete();
    } else {
      // Auto-advance to next video after a short delay
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          currentVideoIndex: prev.currentVideoIndex + 1,
          videoLoaded: false,
          videoError: false,
          currentTime: 0,
          duration: 0,
          loadingStartTime: Date.now()
        }));
      }, 2000);
    }
  };

  const handleVideoLoadedData = () => {
    console.log('Video loaded successfully with quality:', state.currentQuality);
    console.log('Video loaded from source:', currentVideoSources[state.currentQuality]);
    setState(prev => ({ ...prev, videoLoaded: true }));
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e.currentTarget.error);
    console.error('Video error details:', {
      code: e.currentTarget.error?.code,
      message: e.currentTarget.error?.message,
      currentSrc: e.currentTarget.currentSrc,
      networkState: e.currentTarget.networkState,
      readyState: e.currentTarget.readyState
    });
    
    setState(prev => ({
      ...prev,
      videoError: true,
      videoLoaded: false
    }));
  };

  const handleVideoLoadStart = () => {
    console.log('Video load started with quality:', state.currentQuality);
    console.log('Video load started with source:', currentVideoSources[state.currentQuality]);
    setState(prev => ({
      ...prev,
      videoLoaded: false,
      videoError: false,
      loadingStartTime: prev.loadingStartTime || Date.now()
    }));
  };

  const handleVideoCanPlay = () => {
    console.log('Video can play - source:', currentVideoSources[state.currentQuality]);
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

  const allVideosWatched = videoWatchedStates.every(watched => watched);

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
    currentVideoIndex: state.currentVideoIndex,
    totalVideos: state.totalVideos,
    videoWatchedStates,
    allVideosWatched,
    videoRef,
    containerRef,
    videoSources: currentVideoSources,
    
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
    handleVideoSelect,
    
    // Setters for state updates
    setIsPlaying
  };
};
