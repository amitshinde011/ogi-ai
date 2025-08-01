
import { useRef, useCallback } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { VideoPlayerState } from '@/types/videoPlayer';
import { VIDEO_SOURCES_SEQUENCE } from '@/constants/videoSources';
import { toggleFullscreen } from '@/utils/fullscreenHandler';
import { seekToTime, seekBackward, seekForward } from '@/utils/videoTimeManager';

interface UseVideoPlayerHandlersProps {
  state: VideoPlayerState;
  setState: React.Dispatch<React.SetStateAction<VideoPlayerState>>;
  videoWatchedStates: boolean[];
  setVideoWatchedStates: React.Dispatch<React.SetStateAction<boolean[]>>;
  markVideoAsWatched: (videoIndex: number) => void;
  onVideoComplete: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const useVideoPlayerHandlers = ({
  state,
  setState,
  videoWatchedStates,
  setVideoWatchedStates,
  markVideoAsWatched,
  onVideoComplete,
  videoRef,
  containerRef
}: UseVideoPlayerHandlersProps) => {
  const { trackButtonClick } = useAnalytics();

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

  const handleVideoEnd = async () => {
    console.log('Video ended, index:', state.currentVideoIndex);
    
    // Mark current video as watched using persistent storage
    await markVideoAsWatched(state.currentVideoIndex);

    setState(prev => ({ ...prev, isPlaying: false }));

    // Check if this is the last video
    if (state.currentVideoIndex === VIDEO_SOURCES_SEQUENCE.length - 1) {
      // All videos completed - call onVideoComplete after database update
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

  const setIsPlaying = useCallback((isPlaying: boolean) => {
    setState(prev => ({ ...prev, isPlaying }));
  }, [setState]);

  return {
    handlePlayPause,
    handleShowVideo,
    handleVideoEnd,
    handleSeek,
    handleSeekBack,
    handleSeekForward,
    handleToggleFullscreen,
    handleQualityChange,
    handleVideoSelect,
    handleRetry,
    setIsPlaying
  };
};
