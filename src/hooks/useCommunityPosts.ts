
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { usePostOperations } from '@/hooks/usePostOperations';

interface Post {
  id: string;
  user_id: string;
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

      // Get actual comment counts and ensure user info is present
      const postsWithUserInfo = await Promise.all((posts || []).map(async (post) => {
        // Get the actual comment count from comments table
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
          comments_count: actualCommentsCount || 0,
          user_avatar: post.user_profile_picture_url
        };
      }));

      console.log('Posts with corrected comment counts:', postsWithUserInfo);
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
