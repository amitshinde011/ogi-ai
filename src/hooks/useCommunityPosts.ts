
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { usePostOperations } from '@/hooks/usePostOperations';

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  user_profile_picture_url?: string;
}

export const useCommunityPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      console.log('Fetching community posts...');

      const { data: posts, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      console.log('Fetched posts:', posts);

      const postsWithUserInfo = await Promise.all((posts || []).map(async (post) => {
        // Always fetch fresh user profile data
        console.log('Fetching user profile for post:', post.id, 'user:', post.user_id);
        
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, profile_photo_url')
          .eq('user_id', post.user_id)
          .maybeSingle();

        const displayName = profile?.name || 'Unknown User';
        const displayAvatar = profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`;

        console.log('Fetched profile for user:', post.user_id, { name: displayName, avatar: displayAvatar });

        // Also get the actual comment count from comments table
        const { count: actualCommentsCount } = await supabase
          .from('community_post_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        console.log('Actual comments count for post', post.id, ':', actualCommentsCount);

        // Update the post with correct comment count if it differs
        if (actualCommentsCount !== post.comments_count) {
          console.log('Updating comment count from', post.comments_count, 'to', actualCommentsCount);
          await supabase
            .from('community_posts')
            .update({ comments_count: actualCommentsCount || 0 })
            .eq('id', post.id);
        }

        return {
          ...post,
          user_name: displayName,
          user_profile_picture_url: displayAvatar,
          user_avatar: displayAvatar,
          comments_count: actualCommentsCount || 0
        };
      }));

      console.log('Posts with corrected user info and comment counts:', postsWithUserInfo);
      setPosts(postsWithUserInfo);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const { createPost, updatePost, deletePost } = usePostOperations(fetchPosts);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Set up real-time subscription for posts
  useEffect(() => {
    const channel = supabase
      .channel('community-posts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        },
        () => {
          console.log('Real-time post change detected, refetching...');
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_post_comments'
        },
        () => {
          console.log('Real-time comment change detected, refetching posts...');
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost
  };
};
