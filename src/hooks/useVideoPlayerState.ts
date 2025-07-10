
import { useState } from 'react';
import { VideoPlayerState } from '@/types/videoPlayer';
import { VIDEO_SOURCES_SEQUENCE } from '@/constants/videoSources';

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
    totalVideos: VIDEO_SOURCES_SEQUENCE.length,
  });

  const [videoWatchedStates, setVideoWatchedStates] = useState<boolean[]>(
    new Array(VIDEO_SOURCES_SEQUENCE.length).fill(false)
  );

  return {
    state,
    setState,
    videoWatchedStates,
    setVideoWatchedStates
  };
};
