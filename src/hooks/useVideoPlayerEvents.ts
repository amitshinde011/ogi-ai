
import { useRef } from 'react';
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
  
  const handleVideoLoadedData = () => {
    console.log('Video loaded successfully with quality:', state.currentQuality);
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

  return {
    handleVideoLoadedData,
    handleVideoError,
    handleVideoLoadStart,
    handleVideoCanPlay
  };
};
