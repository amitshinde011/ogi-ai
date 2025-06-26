
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
        async (payload) => {
          console.log('Comment change detected:', payload);
          
          // Get actual comment count from database
          const { count } = await supabase
            .from('community_post_comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);
          
          if (count !== null) {
            console.log('Updated comments count:', count);
            setCommentsCount(count);
            
            // Also update the post table with correct count
            const { error } = await supabase
              .from('community_posts')
              .update({ comments_count: count })
              .eq('id', postId);
              
            if (error) {
              console.error('Error updating post comments count:', error);
            } else {
              console.log('Post comments count updated successfully');
            }
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
