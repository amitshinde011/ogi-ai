
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

export interface SocialPost {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  meal_type: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  user_profiles: {
    name: string | null;
    profile_photo_url: string | null;
  };
  is_liked?: boolean;
}

export const useSocialPosts = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { createNotification } = useNotifications();

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setCurrentUser({
          id: profile?.id,
          user_id: user.id,
          name: profile?.name || user.email?.split('@')[0] || 'User',
          profile_photo_url: profile?.profile_photo_url
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Fetch posts from following users (home feed)
  const fetchHomeFeed = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // First, get the IDs of users the current user follows
      const { data: followingData, error: followingError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      if (followingError) throw followingError;

      // Extract the following IDs into an array
      const followingIds = followingData?.map(f => f.following_id) || [];
      
      // If no following users, show empty feed
      if (followingIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get posts from followed users
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles!posts_user_id_fkey (
            name,
            profile_photo_url
          )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Check which posts current user has liked
      const postIds = posts?.map(p => p.id) || [];
      const { data: userLikes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', currentUser.id)
        .in('post_id', postIds);

      const likedPostIds = new Set(userLikes?.map(l => l.post_id));

      const postsWithLikes = posts?.map(post => ({
        ...post,
        is_liked: likedPostIds.has(post.id)
      })) || [];

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error fetching home feed:', error);
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch discover feed (all posts)
  const fetchDiscoverFeed = async () => {
    try {
      setLoading(true);
      
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles!posts_user_id_fkey (
            name,
            profile_photo_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Check which posts current user has liked
      if (currentUser) {
        const postIds = posts?.map(p => p.id) || [];
        const { data: userLikes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUser.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(userLikes?.map(l => l.post_id));

        const postsWithLikes = posts?.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id)
        })) || [];

        setPosts(postsWithLikes);
      } else {
        setPosts(posts || []);
      }
    } catch (error) {
      console.error('Error fetching discover feed:', error);
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (imageUrl: string, caption: string, mealType?: string) => {
    if (!currentUser) {
      toast({ title: "Please log in to create posts", variant: "destructive" });
      return false;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.user_id, // Use user_id from auth.users
          image_url: imageUrl,
          caption: caption.trim() || null,
          meal_type: mealType || null
        });

      if (error) throw error;

      toast({ title: "Post created successfully!" });
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: "Failed to create post", variant: "destructive" });
      return false;
    }
  };

  // Toggle like on a post
  const toggleLike = async (postId: string) => {
    if (!currentUser) {
      toast({ title: "Please log in to like posts", variant: "destructive" });
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', currentUser.user_id)
          .eq('post_id', postId);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            user_id: currentUser.user_id,
            post_id: postId
          });

        // Create notification for post owner
        await createNotification(post.user_id, 'like', postId);
      }

      // Update local state immediately
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? {
                ...p,
                is_liked: !p.is_liked,
                like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({ title: "Failed to update like", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return {
    posts,
    loading,
    currentUser,
    createPost,
    toggleLike,
    fetchHomeFeed,
    fetchDiscoverFeed
  };
};
