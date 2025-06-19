
import { VideoQuality } from '@/types/videoPlayer';

export const detectNetworkSpeed = (): VideoQuality => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType;
    
    console.log('Network effective type:', effectiveType);
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      console.log('Network is slow, setting quality to low');
      return 'low';
    } else if (effectiveType === '3g') {
      console.log('Network is medium, setting quality to medium');
      return 'medium';
    } else {
      console.log('Network is fast, setting quality to high');
      return 'high';
    }
  }
  return 'high';
};

export const shouldReduceQuality = (
  loadingTime: number,
  currentQuality: VideoQuality
): VideoQuality | null => {
  if (loadingTime > 10000 && currentQuality === 'high') {
    console.log('Loading is slow, reducing quality to medium');
    return 'medium';
  } else if (loadingTime > 15000 && currentQuality === 'medium') {
    console.log('Loading is very slow, reducing quality to low');
    return 'low';
  }
  return null;
};
