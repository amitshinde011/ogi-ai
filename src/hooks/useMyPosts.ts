import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface MyPost {
  id: number;
  author_id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  report_count: number;
  is_reported: boolean;
  report_threshold_reached: boolean;
  author?: {
    name: string | null;
    profile_photo_url: string | null;
  };
  is_liked?: boolean;
}

export const useMyPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user profile
  const fetchCurrentUser = useCallback(async () => {
    try {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name, profile_photo_url')
        .eq('user_id', user.id)
        .maybeSingle();

      setCurrentUser({
        id: user.id,
        email: user.email,
        name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
        profile_photo_url: profile?.profile_photo_url
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }, [user]);

  // Fetch user's own posts
  const fetchMyPosts = useCallback(async () => {
    try {
      if (!user) {
        setPosts([]);
        setLoading(false);
        return;
      }

      console.log('🚀 Fetching my posts...');
      const startTime = performance.now();

      // Fetch posts where author_id matches current user
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          author_id,
          image_url,
          caption,
          category,
          like_count,
          comment_count,
          created_at,
          report_count,
          is_reported,
          report_threshold_reached
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      const endTime = performance.now();
      console.log(`⚡ My posts fetched in ${(endTime - startTime).toFixed(2)}ms`);

      if (postsError) {
        console.error('❌ Error fetching my posts:', postsError);
        throw postsError;
      }

      if (!postsData?.length) {
        console.log('📭 No posts found for user');
        setPosts([]);
        return;
      }

      // Get user profile for author info
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name, profile_photo_url')
        .eq('user_id', user.id)
        .maybeSingle();

      // Process posts with author info
      const processedPosts = postsData.map(post => ({
        ...post,
        author: {
          name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
          profile_photo_url: profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
        },
        is_liked: false // User can't like their own posts
      }));

      console.log(`📦 Processed ${processedPosts.length} posts`);
      setPosts(processedPosts);

    } catch (error) {
      console.error('❌ Error fetching my posts:', error);
      toast({ title: "Failed to load your posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh posts
  const refreshPosts = useCallback(() => {
    setLoading(true);
    fetchMyPosts();
  }, [fetchMyPosts]);

  // Delete post
  const deletePost = useCallback(async (postId: number) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user?.id); // Ensure user can only delete their own posts

      if (error) throw error;

      // Update local state
      setPosts(prev => prev.filter(post => post.id !== postId));
      toast({ title: "Post deleted successfully" });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: "Failed to delete post", variant: "destructive" });
    }
  }, [user?.id]);

  // Update post
  const updatePost = useCallback(async (updatedPost: MyPost) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          caption: updatedPost.caption,
          category: updatedPost.category
        })
        .eq('id', updatedPost.id)
        .eq('author_id', user?.id); // Ensure user can only update their own posts

      if (error) throw error;

      // Update local state
      setPosts(prev => 
        prev.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        )
      );
      toast({ title: "Post updated successfully" });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({ title: "Failed to update post", variant: "destructive" });
    }
  }, [user?.id]);

  // Initialize
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (currentUser !== null) {
      fetchMyPosts();
    }
  }, [currentUser, fetchMyPosts]);

  // Real-time updates for user's posts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('my-posts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'posts',
        filter: `author_id=eq.${user.id}`
      }, (payload) => {
        console.log('New post added:', payload);
        refreshPosts();
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'posts',
        filter: `author_id=eq.${user.id}`
      }, (payload) => {
        console.log('Post updated:', payload);
        setPosts(prev =>
          prev.map(post =>
            post.id === payload.new.id
              ? { ...post, ...payload.new }
              : post
          )
        );
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'posts',
        filter: `author_id=eq.${user.id}`
      }, (payload) => {
        console.log('Post deleted:', payload);
        setPosts(prev =>
          prev.filter(post => post.id !== payload.old.id)
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshPosts]);

  return {
    posts,
    loading,
    currentUser,
    refreshPosts,
    deletePost,
    updatePost
  };
};