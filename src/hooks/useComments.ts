
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Comment {
  id: number;
  author_id: string;
  post_id: number;
  text: string;
  parent_comment_id: number | null;
  created_at: string;
  author?: {
    name: string | null;
    profile_photo_url: string | null;
  };
}

export const useComments = (postId: number | null) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get author profiles for comments
      const authorIds = [...new Set(commentsData?.map(comment => comment.author_id) || [])];
      
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, name, profile_photo_url')
        .in('user_id', authorIds);

      const commentsWithAuthors = commentsData?.map(comment => ({
        ...comment,
        author: profiles?.find(profile => profile.user_id === comment.author_id) || {
          name: 'Anonymous User',
          profile_photo_url: null
        }
      })) || [];

      setComments(commentsWithAuthors);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (text: string, parentCommentId?: number) => {
    if (!postId) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please log in to comment", variant: "destructive" });
        return false;
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          author_id: user.id,
          post_id: postId,
          text: text,
          parent_comment_id: parentCommentId || null
        });

      if (error) throw error;

      // Refresh comments
      await fetchComments();
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: "Failed to add comment", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return {
    comments,
    loading,
    addComment,
    refreshComments: fetchComments
  };
};
