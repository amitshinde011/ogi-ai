
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePostLikes = (postId: string, initialLikesCount: number, currentUserId?: string) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  useEffect(() => {
    checkIfLiked();
  }, [postId, currentUserId]);

  // Set up real-time subscription for likes count
  useEffect(() => {
    const channel = supabase
      .channel(`post-${postId}-likes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_post_likes',
          filter: `post_id=eq.${postId}`
        },
        async () => {
          // Refetch likes count when likes change
          const { data } = await supabase
            .from('community_posts')
            .select('likes_count')
            .eq('id', postId)
            .single();
          
          if (data) {
            setLikesCount(data.likes_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const checkIfLiked = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
        return;
      }

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast({ title: "Please log in to like posts", variant: "destructive" });
      return;
    }

    try {
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);

        if (error) throw error;

        setIsLiked(false);
      } else {
        // Like the post
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: currentUserId
          });

        if (error) throw error;

        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({ title: "Failed to update like", variant: "destructive" });
    }
  };

  return {
    isLiked,
    likesCount,
    handleLike
  };
};
