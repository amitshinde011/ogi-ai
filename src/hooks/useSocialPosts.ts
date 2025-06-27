
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
  } | null;
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
      console.log('🔍 Fetching current user...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 Auth user:', { user, authError });
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        return;
      }

      if (user) {
        console.log('👤 Got authenticated user:', user.id);
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('👤 User profile query result:', { profile, profileError });

        const userData = {
          auth_id: user.id, // This is auth.users.id - use for RLS operations
          profile_id: profile?.id, // This is user_profiles.id - use for profile references
          name: profile?.name || user.email?.split('@')[0] || 'User',
          profile_photo_url: profile?.profile_photo_url
        };

        setCurrentUser(userData);
        console.log('✅ Current user set:', userData);
      } else {
        console.log('⚠️ No authenticated user found');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('❌ Error fetching current user:', error);
      setCurrentUser(null);
    }
  };

  // Fetch posts from following users (home feed)
  const fetchHomeFeed = async () => {
    if (!currentUser) {
      console.log('⚠️ No current user, skipping home feed fetch');
      return;
    }

    try {
      setLoading(true);
      console.log('🏠 Fetching home feed for user:', currentUser.profile_id);
      
      // First, get the IDs of users the current user follows
      const { data: followingData, error: followingError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', currentUser.profile_id);

      console.log('👥 Following data:', { followingData, followingError });

      if (followingError) throw followingError;

      // Extract the following IDs into an array
      const followingIds = followingData?.map(f => f.following_id) || [];
      console.log('📝 Following IDs:', followingIds);
      
      // If no following users, show empty feed
      if (followingIds.length === 0) {
        console.log('📭 No following users, empty feed');
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

      console.log('📋 Posts query result:', { posts, error });

      if (error) throw error;

      // Check which posts current user has liked
      const postIds = posts?.map(p => p.id) || [];
      const { data: userLikes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', currentUser.auth_id) // Use auth_id for likes
        .in('post_id', postIds);

      console.log('❤️ User likes:', userLikes);

      const likedPostIds = new Set(userLikes?.map(l => l.post_id));

      const postsWithLikes = posts?.map(post => ({
        ...post,
        is_liked: likedPostIds.has(post.id)
      })) || [];

      console.log('✅ Final posts with likes:', postsWithLikes);
      setPosts(postsWithLikes);
    } catch (error) {
      console.error('❌ Error fetching home feed:', error);
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch discover feed (all posts)
  const fetchDiscoverFeed = async () => {
    try {
      setLoading(true);
      console.log('🌐 Fetching discover feed (all posts)...');
      
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

      console.log('📋 Discover posts query result:', { posts, error, count: posts?.length });
      
      if (posts) {
        posts.forEach((post, index) => {
          console.log(`📝 Post ${index + 1}:`, {
            id: post.id,
            user_id: post.user_id,
            caption: post.caption?.substring(0, 50) + '...',
            user_profiles: post.user_profiles,
            created_at: post.created_at
          });
        });
      }

      if (error) throw error;

      // Check which posts current user has liked
      if (currentUser) {
        console.log('❤️ Checking likes for current user auth_id:', currentUser.auth_id);
        const postIds = posts?.map(p => p.id) || [];
        const { data: userLikes, error: likesError } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUser.auth_id) // Use auth_id for likes
          .in('post_id', postIds);

        console.log('❤️ User likes query result:', { userLikes, likesError });

        const likedPostIds = new Set(userLikes?.map(l => l.post_id));

        const postsWithLikes = posts?.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.id)
        })) || [];

        console.log('✅ Final posts with likes set:', postsWithLikes.length);
        setPosts(postsWithLikes);
      } else {
        console.log('⚠️ No current user, setting posts without like status');
        setPosts(posts || []);
      }
    } catch (error) {
      console.error('❌ Error fetching discover feed:', error);
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (imageUrl: string, caption: string, mealType?: string) => {
    if (!currentUser || !currentUser.auth_id) {
      console.log('⚠️ No current user or auth_id for post creation');
      toast({ title: "Please log in to create posts", variant: "destructive" });
      return false;
    }

    try {
      console.log('📝 Creating post with data:', { 
        imageUrl, 
        caption, 
        mealType, 
        authId: currentUser.auth_id 
      });
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: currentUser.auth_id, // Use auth.users.id for RLS
          image_url: imageUrl,
          caption: caption.trim() || null,
          meal_type: mealType || null
        })
        .select()
        .single();

      console.log('📝 Post creation result:', { data, error });

      if (error) {
        console.error('❌ Post creation error:', error);
        throw error;
      }

      console.log('✅ Post created successfully:', data);
      toast({ title: "Post created successfully!" });
      return true;
    } catch (error) {
      console.error('❌ Error creating post:', error);
      toast({ title: "Failed to create post", variant: "destructive" });
      return false;
    }
  };

  // Toggle like on a post
  const toggleLike = async (postId: string) => {
    if (!currentUser || !currentUser.auth_id) {
      console.log('⚠️ No current user for like toggle');
      toast({ title: "Please log in to like posts", variant: "destructive" });
      return;
    }

    try {
      console.log('❤️ Toggling like for post:', postId, 'user auth_id:', currentUser.auth_id);
      
      const post = posts.find(p => p.id === postId);
      if (!post) {
        console.log('⚠️ Post not found:', postId);
        return;
      }

      if (post.is_liked) {
        console.log('💔 Unliking post...');
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', currentUser.auth_id) // Use auth_id for likes
          .eq('post_id', postId);

        if (error) throw error;
      } else {
        console.log('❤️ Liking post...');
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: currentUser.auth_id, // Use auth_id for likes
            post_id: postId
          });

        if (error) throw error;

        // Create notification for post owner if we have their profile_id
        if (currentUser.profile_id) {
          await createNotification(post.user_id, 'like', postId);
        }
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
      
      console.log('✅ Like toggled successfully');
    } catch (error) {
      console.error('❌ Error toggling like:', error);
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
