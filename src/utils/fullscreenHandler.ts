
export const toggleFullscreen = async (containerRef: React.RefObject<HTMLDivElement>) => {
  if (!containerRef.current) return;

  try {
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.error('Error toggling fullscreen:', error);
  }
};

export const setupFullscreenListener = (
  setState: React.Dispatch<React.SetStateAction<any>>
) => {
  const handleFullscreenChange = () => {
    setState((prev: any) => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
};
