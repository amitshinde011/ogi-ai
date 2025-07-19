
import { useState, useEffect } from 'react';
import { VideoPlayerState } from '@/types/videoPlayer';
import { VIDEO_SOURCES_SEQUENCE } from '@/constants/videoSources';
import { useVideoWatchedPersistence } from '@/hooks/useVideoWatchedPersistence';

export const useVideoPlayerState = () => {
  const {
    videoWatchedStates,
    updateVideoWatchedStates: setVideoWatchedStates,
    markVideoAsWatched,
    allVideosWatched,
    nextUnwatchedVideoIndex
  } = useVideoWatchedPersistence();

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

  // Set initial video index to first unwatched video on mount
  useEffect(() => {
    if (nextUnwatchedVideoIndex !== -1) {
      setState(prev => ({
        ...prev,
        currentVideoIndex: nextUnwatchedVideoIndex
      }));
    }
  }, [nextUnwatchedVideoIndex]);

  return {
    state,
    setState,
    videoWatchedStates,
    setVideoWatchedStates,
    markVideoAsWatched,
    allVideosWatched
  };
};
