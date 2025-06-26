
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePostComments = (postId: string, initialCommentsCount: number) => {
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);

  // Set up real-time subscription for comments count
  useEffect(() => {
    const channel = supabase
      .channel(`post-${postId}-comments`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_post_comments',
          filter: `post_id=eq.${postId}`
        },
        async () => {
          // Refetch comments count when comments change
          const { data } = await supabase
            .from('community_posts')
            .select('comments_count')
            .eq('id', postId)
            .single();
          
          if (data) {
            setCommentsCount(data.comments_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return { commentsCount };
};
