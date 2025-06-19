
export const setupVideoTimeListeners = (
  videoRef: React.RefObject<HTMLVideoElement>,
  setState: React.Dispatch<React.SetStateAction<any>>,
  videoLoaded: boolean
) => {
  const video = videoRef.current;
  if (!video) return;

  const updateTime = () => {
    setState((prev: any) => ({
      ...prev,
      currentTime: video.currentTime,
      duration: video.duration || 0
    }));
  };

  video.addEventListener('timeupdate', updateTime);
  video.addEventListener('loadedmetadata', updateTime);

  return () => {
    video.removeEventListener('timeupdate', updateTime);
    video.removeEventListener('loadedmetadata', updateTime);
  };
};

export const seekToTime = (
  videoRef: React.RefObject<HTMLVideoElement>,
  time: number,
  setState: React.Dispatch<React.SetStateAction<any>>
) => {
  if (!videoRef.current) return;
  videoRef.current.currentTime = time;
  setState((prev: any) => ({ ...prev, currentTime: time }));
};

export const seekBackward = (
  videoRef: React.RefObject<HTMLVideoElement>,
  setState: React.Dispatch<React.SetStateAction<any>>
) => {
  if (!videoRef.current) return;
  const newTime = Math.max(0, videoRef.current.currentTime - 10);
  videoRef.current.currentTime = newTime;
  setState((prev: any) => ({ ...prev, currentTime: newTime }));
};

export const seekForward = (
  videoRef: React.RefObject<HTMLVideoElement>,
  duration: number,
  setState: React.Dispatch<React.SetStateAction<any>>
) => {
  if (!videoRef.current) return;
  const newTime = Math.min(duration, videoRef.current.currentTime + 10);
  videoRef.current.currentTime = newTime;
  setState((prev: any) => ({ ...prev, currentTime: newTime }));
};
