import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CommentType {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_comment_id?: string;
  user_name?: string;
  user_avatar?: string;
  replies?: CommentType[];
}

// Database response type that includes the optional fields
interface CommentDbResponse {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_comment_id?: string;
  post_id: string;
  user_name?: string;
  user_avatar?: string;
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for post:', postId);
      
      const { data: commentsData, error } = await supabase
        .from('community_post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      console.log('Raw comments data:', commentsData);

      // Use stored user information or fetch as fallback
      const commentsWithUserInfo = await Promise.all(
        (commentsData || []).map(async (comment: CommentDbResponse) => {
          let userName = comment.user_name;
          let userAvatar = comment.user_avatar;

          // If user info is not stored in comment, fetch from profile
          if (!userName || !userAvatar) {
            console.log('Fetching profile for comment user:', comment.user_id);
            
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('name, profile_photo_url')
              .eq('user_id', comment.user_id)
              .maybeSingle();

            userName = userName || profile?.name || 'Unknown User';
            userAvatar = userAvatar || profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`;
            
            console.log('Profile found for user:', comment.user_id, { name: userName, avatar: userAvatar });
          }

          return {
            ...comment,
            user_name: userName,
            user_avatar: userAvatar
          };
        })
      );

      // Organize comments into threads (parent comments with replies)
      const parentComments = commentsWithUserInfo.filter(comment => !comment.parent_comment_id);
      const repliesMap = commentsWithUserInfo.reduce((acc, comment) => {
        if (comment.parent_comment_id) {
          if (!acc[comment.parent_comment_id]) {
            acc[comment.parent_comment_id] = [];
          }
          acc[comment.parent_comment_id].push(comment);
        }
        return acc;
      }, {} as Record<string, CommentType[]>);

      const threaded = parentComments.map(comment => ({
        ...comment,
        replies: repliesMap[comment.id] || []
      }));

      console.log('Threaded comments:', threaded);
      setComments(threaded);
      
      // Update the post's comment count in real-time
      await updatePostCommentCount(postId, commentsWithUserInfo.length);
      
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({ title: "Failed to load comments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updatePostCommentCount = async (postId: string, count: number) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ comments_count: count })
        .eq('id', postId);
      
      if (error) {
        console.error('Error updating comment count:', error);
      } else {
        console.log('Updated comment count to:', count);
      }
    } catch (error) {
      console.error('Error updating comment count:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // Set up real-time subscription for comments
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_post_comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          console.log('Real-time comment change detected, refetching...');
          // Refetch comments when any comment changes
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  return {
    comments,
    loading,
    fetchComments
  };
};
