
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const fetchComments = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      
      // Fetch comments for the post
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

      // Create a map of user_id to profile data
      const profileMap = new Map(
        profiles?.map(profile => [
          profile.user_id,
          { name: profile.name, profile_photo_url: profile.profile_photo_url }
        ]) || []
      );

      const commentsWithAuthors = commentsData?.map(comment => ({
        ...comment,
        author: profileMap.get(comment.author_id) || {
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

    if (!user) {
      toast({ title: "Please log in to comment", variant: "destructive" });
      return false;
    }

    try {

      const { error } = await supabase
        .from('comments')
        .insert({
          author_id: user.id,
          post_id: postId,
          text: text,
          parent_comment_id: parentCommentId || null
        });

      if (error) throw error;

      // Refresh comments to get the updated list
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
