
import { useRef, useCallback } from 'react';
import { VideoPlayerState } from '@/types/videoPlayer';

interface UseVideoPlayerEventsProps {
  state: VideoPlayerState;
  setState: React.Dispatch<React.SetStateAction<VideoPlayerState>>;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const useVideoPlayerEvents = ({
  state,
  setState,
  videoRef
}: UseVideoPlayerEventsProps) => {
  
  const handleVideoLoadedData = useCallback(() => {
    setState(prev => ({ ...prev, videoLoaded: true }));
  }, [setState]);

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e.currentTarget.error);
    
    setState(prev => ({
      ...prev,
      videoError: true,
      videoLoaded: false
    }));
  }, [setState]);

  const handleVideoLoadStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      videoLoaded: false,
      videoError: false,
      loadingStartTime: prev.loadingStartTime || Date.now()
    }));
  }, [setState]);

  const handleVideoCanPlay = useCallback(() => {
    // Video can play
  }, []);

  return {
    handleVideoLoadedData,
    handleVideoError,
    handleVideoLoadStart,
    handleVideoCanPlay
  };
};
