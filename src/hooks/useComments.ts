
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  user_profiles?: {
    name: string | null;
    profile_photo_url: string | null;
  } | null;
}

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user
  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setCurrentUser({
          user_id: user.id,
          name: profile?.name || user.email?.split('@')[0] || 'User',
          profile_photo_url: profile?.profile_photo_url
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Fetch comments for a post
  const fetchComments = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      console.log('💬 Fetching comments for post:', postId);

      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles!comments_user_id_fkey (
            name,
            profile_photo_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      console.log('💬 Comments query result:', { comments, error });

      if (error) throw error;

      setComments(comments || []);
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      toast({ title: "Failed to load comments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Add a new comment
  const addComment = async (commentText: string) => {
    if (!currentUser) {
      toast({ title: "Please log in to comment", variant: "destructive" });
      return false;
    }

    if (!commentText.trim()) {
      toast({ title: "Comment cannot be empty", variant: "destructive" });
      return false;
    }

    try {
      console.log('💬 Adding comment:', { postId, commentText, userId: currentUser.user_id });

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.user_id,
          comment_text: commentText.trim()
        })
        .select(`
          *,
          user_profiles!comments_user_id_fkey (
            name,
            profile_photo_url
          )
        `)
        .single();

      console.log('💬 Comment creation result:', { data, error });

      if (error) throw error;

      // Add the new comment to the list
      setComments(prevComments => [...prevComments, data]);
      
      console.log('✅ Comment added successfully');
      toast({ title: "Comment added successfully!" });
      return true;
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      toast({ title: "Failed to add comment", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return {
    comments,
    loading,
    currentUser,
    addComment,
    fetchComments
  };
};
