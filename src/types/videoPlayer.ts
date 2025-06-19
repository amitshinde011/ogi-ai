
export interface VideoPlayerHookProps {
  onVideoComplete: () => void;
  videoWatched: boolean;
}

export interface VideoSources {
  high: string;
  medium: string;
  low: string;
}

export type VideoQuality = 'high' | 'medium' | 'low';

export interface VideoPlayerState {
  isPlaying: boolean;
  showVideo: boolean;
  videoLoaded: boolean;
  videoError: boolean;
  currentQuality: VideoQuality;
  loadingStartTime: number | null;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
}
