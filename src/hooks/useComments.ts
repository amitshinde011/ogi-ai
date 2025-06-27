
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

  // Get current user with profile data
  const fetchCurrentUser = async () => {
    try {
      console.log('🔍 Fetching current user for comments...');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('👤 Got auth user:', user.id);
        
        // Get user profile for display purposes
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, name, profile_photo_url')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('👤 User profile query result:', { profile, profileError });

        if (profile) {
          setCurrentUser({
            auth_user_id: user.id,
            profile_id: profile.id, // This is what we need for the foreign key
            name: profile.name || user.email?.split('@')[0] || 'User',
            profile_photo_url: profile.profile_photo_url
          });
          console.log('✅ Current user set with profile ID:', profile.id);
        } else {
          console.log('⚠️ No user profile found, user needs to complete profile setup');
          toast({ 
            title: "Please complete your profile setup first", 
            variant: "destructive" 
          });
        }
      }
    } catch (error) {
      console.error('❌ Error fetching current user:', error);
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
    if (!currentUser || !currentUser.profile_id) {
      console.log('⚠️ No current user or profile ID for comment creation');
      toast({ title: "Please log in and complete your profile to comment", variant: "destructive" });
      return false;
    }

    if (!commentText.trim()) {
      toast({ title: "Comment cannot be empty", variant: "destructive" });
      return false;
    }

    try {
      console.log('💬 Adding comment:', { 
        postId, 
        commentText, 
        profileId: currentUser.profile_id,
        userName: currentUser.name
      });

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.profile_id, // Use profile_id, not auth user_id
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

      if (error) {
        console.error('💬 Comment creation error details:', error);
        throw error;
      }

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
