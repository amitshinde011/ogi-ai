
import { useRef, useEffect } from 'react';
import { VideoPlayerHookProps } from '@/types/videoPlayer';
import { VIDEO_SOURCES_SEQUENCE } from '@/constants/videoSources';
import { detectNetworkSpeed, shouldReduceQuality } from '@/utils/videoQualityDetector';
import { setupFullscreenListener } from '@/utils/fullscreenHandler';
import { setupVideoTimeListeners } from '@/utils/videoTimeManager';
import { useVideoPlayerState } from '@/hooks/useVideoPlayerState';
import { useVideoPlayerHandlers } from '@/hooks/useVideoPlayerHandlers';
import { useVideoPlayerEvents } from '@/hooks/useVideoPlayerEvents';

export const useVideoPlayer = ({ onVideoComplete, videoWatched }: VideoPlayerHookProps) => {
  const { state, setState, videoWatchedStates, setVideoWatchedStates } = useVideoPlayerState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current video sources
  const currentVideoSources = VIDEO_SOURCES_SEQUENCE[state.currentVideoIndex];

  const handlers = useVideoPlayerHandlers({
    state,
    setState,
    videoWatchedStates,
    setVideoWatchedStates,
    onVideoComplete,
    videoRef,
    containerRef
  });

  const events = useVideoPlayerEvents({
    state,
    setState,
    videoRef
  });

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
    
    // Handlers from useVideoPlayerHandlers
    ...handlers,
    
    // Events from useVideoPlayerEvents
    ...events
  };
};
