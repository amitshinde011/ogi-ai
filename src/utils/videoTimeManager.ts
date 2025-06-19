
export const setupVideoTimeListeners = (
  videoRef: React.RefObject<HTMLVideoElement>,
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>,
  setDuration: React.Dispatch<React.SetStateAction<number>>,
  videoLoaded: boolean
) => {
  const video = videoRef.current;
  if (!video) return;

  const updateTime = () => {
    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
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
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>
) => {
  if (!videoRef.current) return;
  videoRef.current.currentTime = time;
  setCurrentTime(time);
};

export const seekBackward = (
  videoRef: React.RefObject<HTMLVideoElement>,
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>
) => {
  if (!videoRef.current) return;
  const newTime = Math.max(0, videoRef.current.currentTime - 10);
  videoRef.current.currentTime = newTime;
  setCurrentTime(newTime);
};

export const seekForward = (
  videoRef: React.RefObject<HTMLVideoElement>,
  duration: number,
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>
) => {
  if (!videoRef.current) return;
  const newTime = Math.min(duration, videoRef.current.currentTime + 10);
  videoRef.current.currentTime = newTime;
  setCurrentTime(newTime);
};
