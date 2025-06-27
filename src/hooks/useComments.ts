
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
            auth_user_id: user.id, // This is what we use for comments (auth.uid())
            profile_id: profile.id,
            name: profile.name || user.email?.split('@')[0] || 'User',
            profile_photo_url: profile.profile_photo_url
          });
          console.log('✅ Current user set with auth ID:', user.id);
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

      // Since comments.user_id now references auth.users.id directly,
      // we need to join with user_profiles through user_profiles.user_id = comments.user_id
      const { data: comments, error } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles!inner(
            name,
            profile_photo_url
          )
        `)
        .eq('post_id', postId)
        .eq('user_profiles.user_id', supabase.rpc('auth.uid'))
        .order('created_at', { ascending: true });

      console.log('💬 Comments with inner join result:', { comments, error });

      // If inner join fails, try a different approach with manual joining
      if (error || !comments) {
        console.log('💬 Trying alternative query approach...');
        
        const { data: rawComments, error: rawError } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        console.log('💬 Raw comments result:', { rawComments, rawError });

        if (rawError) throw rawError;

        // Manually fetch user profiles for each comment
        const commentsWithProfiles = await Promise.all(
          (rawComments || []).map(async (comment) => {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('name, profile_photo_url')
              .eq('user_id', comment.user_id)
              .maybeSingle();

            return {
              ...comment,
              user_profiles: profile
            };
          })
        );

        console.log('💬 Comments with manually fetched profiles:', commentsWithProfiles);
        setComments(commentsWithProfiles);
      } else {
        setComments(comments);
      }
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      toast({ title: "Failed to load comments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Add a new comment
  const addComment = async (commentText: string) => {
    if (!currentUser || !currentUser.auth_user_id) {
      console.log('⚠️ No current user for comment creation');
      toast({ title: "Please log in to comment", variant: "destructive" });
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
        authUserId: currentUser.auth_user_id,
        userName: currentUser.name
      });

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: currentUser.auth_user_id, // Use auth.uid() directly
          comment_text: commentText.trim()
        })
        .select()
        .single();

      console.log('💬 Comment creation result:', { data, error });

      if (error) {
        console.error('💬 Comment creation error details:', error);
        throw error;
      }

      // Manually add user profile data to the new comment
      const commentWithProfile = {
        ...data,
        user_profiles: {
          name: currentUser.name,
          profile_photo_url: currentUser.profile_photo_url
        }
      };

      // Add the new comment to the list
      setComments(prevComments => [...prevComments, commentWithProfile]);
      
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
