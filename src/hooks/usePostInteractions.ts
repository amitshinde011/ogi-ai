
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePostLikes = (postId: string, initialLikesCount: number, currentUserId?: string) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  useEffect(() => {
    if (currentUserId) {
      checkIfLiked();
    }
  }, [postId, currentUserId]);

  const checkIfLiked = async () => {
    if (!currentUserId) return;

    try {
      const { data } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const toggleLike = async () => {
    if (!currentUserId) {
      toast({ title: "Please log in to like posts", variant: "destructive" });
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);

        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: currentUserId
          });

        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({ title: "Failed to update like", variant: "destructive" });
    }
  };

  return {
    isLiked,
    likesCount,
    toggleLike
  };
};

export const usePostComments = (postId: string) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const parentComments = (data || []).filter(comment => !comment.parent_comment_id);
      const repliesMap = (data || []).reduce((acc, comment) => {
        if (comment.parent_comment_id) {
          if (!acc[comment.parent_comment_id]) {
            acc[comment.parent_comment_id] = [];
          }
          acc[comment.parent_comment_id].push(comment);
        }
        return acc;
      }, {} as Record<string, any[]>);

      const threaded = parentComments.map(comment => ({
        ...comment,
        replies: repliesMap[comment.id] || []
      }));

      setComments(threaded);
      setCommentsCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({ title: "Failed to load comments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, currentUserId?: string, parentCommentId?: string) => {
    if (!currentUserId) {
      toast({ title: "Please log in to comment", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: content.trim(),
          parent_comment_id: parentCommentId
        });

      if (error) throw error;

      await fetchComments();
      toast({ title: "Comment added successfully!" });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('community_post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      toast({ title: "Comment deleted successfully!" });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({ title: "Failed to delete comment", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchComments();

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
    commentsCount,
    addComment,
    deleteComment,
    fetchComments
  };
};
