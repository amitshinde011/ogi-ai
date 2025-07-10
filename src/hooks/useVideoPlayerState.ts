
import { useState } from 'react';
import { VideoPlayerState } from '@/types/videoPlayer';

export const useVideoPlayerState = () => {
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
    totalVideos: 7, // Total number of videos
  });

  const [videoWatchedStates, setVideoWatchedStates] = useState<boolean[]>(
    new Array(7).fill(false)
  );

  return {
    state,
    setState,
    videoWatchedStates,
    setVideoWatchedStates
  };
};
