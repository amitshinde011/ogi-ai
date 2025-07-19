import { useState, useEffect, useCallback } from 'react';
import { VIDEO_SOURCES_SEQUENCE } from '@/constants/videoSources';

const STORAGE_KEY = 'intro-videos-watched';

export const useVideoWatchedPersistence = () => {
  const [videoWatchedStates, setVideoWatchedStates] = useState<boolean[]>(
    new Array(VIDEO_SOURCES_SEQUENCE.length).fill(false)
  );

  // Load watched states from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedStates = JSON.parse(stored) as boolean[];
        // Ensure the array length matches the current video count
        if (Array.isArray(parsedStates)) {
          const adjustedStates = new Array(VIDEO_SOURCES_SEQUENCE.length).fill(false);
          parsedStates.forEach((watched, index) => {
            if (index < adjustedStates.length) {
              adjustedStates[index] = watched;
            }
          });
          setVideoWatchedStates(adjustedStates);
        }
      }
    } catch (error) {
      console.error('Error loading video watched states:', error);
    }
  }, []);

  // Save watched states to localStorage whenever they change
  const updateVideoWatchedStates = useCallback((newStates: boolean[]) => {
    setVideoWatchedStates(newStates);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStates));
    } catch (error) {
      console.error('Error saving video watched states:', error);
    }
  }, []);

  // Mark a specific video as watched
  const markVideoAsWatched = useCallback((videoIndex: number) => {
    setVideoWatchedStates(prevStates => {
      const newStates = [...prevStates];
      newStates[videoIndex] = true;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStates));
      } catch (error) {
        console.error('Error saving video watched state:', error);
      }
      return newStates;
    });
  }, []);

  // Check if all videos have been watched
  const allVideosWatched = videoWatchedStates.every(watched => watched);

  // Get the next unwatched video index (for auto-progression)
  const nextUnwatchedVideoIndex = videoWatchedStates.findIndex(watched => !watched);

  // Clear all watched states (for reset functionality if needed)
  const clearWatchedStates = useCallback(() => {
    const clearedStates = new Array(VIDEO_SOURCES_SEQUENCE.length).fill(false);
    setVideoWatchedStates(clearedStates);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing video watched states:', error);
    }
  }, []);

  return {
    videoWatchedStates,
    updateVideoWatchedStates,
    markVideoAsWatched,
    allVideosWatched,
    nextUnwatchedVideoIndex,
    clearWatchedStates
  };
};