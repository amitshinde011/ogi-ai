import { useState, useEffect, useCallback } from 'react';
import { VIDEO_SOURCES_SEQUENCE } from '@/constants/videoSources';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useVideoWatchedPersistence = () => {
  const { user } = useAuth();
  const [videoWatchedStates, setVideoWatchedStates] = useState<boolean[]>(
    new Array(VIDEO_SOURCES_SEQUENCE.length).fill(false)
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load watched states from database on mount
  useEffect(() => {
    const loadWatchedStates = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_video_watch_status')
          .select('video_index, watched')
          .eq('user_id', user.id)
          .order('video_index');

        if (error) {
          console.error('Error loading video watched states:', error);
          setIsLoading(false);
          return;
        }

        // Initialize array with false values
        const watchedStates = new Array(VIDEO_SOURCES_SEQUENCE.length).fill(false);
        
        // Set watched status for each video based on database data
        data?.forEach(({ video_index, watched }) => {
          if (video_index < watchedStates.length) {
            watchedStates[video_index] = watched;
          }
        });

        setVideoWatchedStates(watchedStates);
      } catch (error) {
        console.error('Error loading video watched states:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWatchedStates();
  }, [user]);

  // Update watched states in database
  const updateVideoWatchedStates = useCallback(async (newStates: boolean[]) => {
    if (!user) return;

    setVideoWatchedStates(newStates);
    
    try {
      // Update all video watch statuses
      const updates = newStates.map((watched, video_index) => ({
        user_id: user.id,
        video_index,
        watched
      }));

      const { error } = await supabase
        .from('user_video_watch_status')
        .upsert(updates, {
          onConflict: 'user_id,video_index'
        });

      if (error) {
        console.error('Error saving video watched states:', error);
      }
    } catch (error) {
      console.error('Error saving video watched states:', error);
    }
  }, [user]);

  // Mark a specific video as watched
  const markVideoAsWatched = useCallback(async (videoIndex: number) => {
    if (!user) return;

    setVideoWatchedStates(prevStates => {
      const newStates = [...prevStates];
      newStates[videoIndex] = true;
      return newStates;
    });

    try {
      const { error } = await supabase
        .from('user_video_watch_status')
        .upsert(
          {
            user_id: user.id,
            video_index: videoIndex,
            watched: true
          },
          {
            onConflict: 'user_id,video_index'
          }
        );

      if (error) {
        console.error('Error marking video as watched:', error);
      }
    } catch (error) {
      console.error('Error marking video as watched:', error);
    }
  }, [user]);

  // Check if all videos have been watched
  const allVideosWatched = videoWatchedStates.every(watched => watched);

  // Get the next unwatched video index (for auto-progression)
  const nextUnwatchedVideoIndex = videoWatchedStates.findIndex(watched => !watched);

  // Clear all watched states (for reset functionality if needed)
  const clearWatchedStates = useCallback(async () => {
    if (!user) return;

    const clearedStates = new Array(VIDEO_SOURCES_SEQUENCE.length).fill(false);
    setVideoWatchedStates(clearedStates);
    
    try {
      const { error } = await supabase
        .from('user_video_watch_status')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing video watched states:', error);
      }
    } catch (error) {
      console.error('Error clearing video watched states:', error);
    }
  }, [user]);

  return {
    videoWatchedStates,
    updateVideoWatchedStates,
    markVideoAsWatched,
    allVideosWatched,
    nextUnwatchedVideoIndex,
    clearWatchedStates,
    isLoading
  };
};