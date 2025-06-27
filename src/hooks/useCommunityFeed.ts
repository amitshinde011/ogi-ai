
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CommunityPost {
  id: number;
  author_id: string;
  image_url: string;
  caption: string | null;
  category: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  author?: {
    name: string | null;
    profile_photo_url: string | null;
  };
  is_liked?: boolean;
}

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

export const useCommunityFeed = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user
  const fetchCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        // Get user profile for display name and avatar
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, profile_photo_url')
          .eq('user_id', user.id)
          .single();

        setCurrentUser({
          id: user.id,
          email: user.email,
          name: profile?.name || user.email?.split('@')[0] || 'Anonymous',
          profile_photo_url: profile?.profile_photo_url
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Fetch all posts with author information
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch posts with denormalized counts for performance
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get unique author IDs
      const authorIds = [...new Set(postsData?.map(post => post.author_id) || [])];
      
      // Fetch author profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, name, profile_photo_url')
        .in('user_id', authorIds);

      // Check which posts current user has liked
      let userLikes: any[] = [];
      if (currentUser) {
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUser.id);
        userLikes = likesData || [];
      }

      const likedPostIds = new Set(userLikes.map(like => like.post_id));

      // Combine posts with author info and like status
      const postsWithAuthors = postsData?.map(post => ({
        ...post,
        author: profiles?.find(profile => profile.user_id === post.author_id) || {
          name: 'Anonymous User',
          profile_photo_url: null
        },
        is_liked: likedPostIds.has(post.id)
      })) || [];

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ title: "Failed to load community feed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (imageUrl: string, caption: string, category?: string) => {
    if (!currentUser) {
      toast({ title: "Please log in to create posts", variant: "destructive" });
      return false;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: currentUser.id,
          image_url: imageUrl,
          caption: caption || null,
          category: category || null
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
  const toggleLike = async (postId: number) => {
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
          .eq('user_id', currentUser.id)
          .eq('post_id', postId);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            user_id: currentUser.id,
            post_id: postId
          });
      }

      // Optimistically update local state
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

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'posts' 
      }, (payload) => {
        console.log('Real-time update:', payload);
        
        if (payload.eventType === 'INSERT') {
          // Refresh posts to get the new post with author info
          fetchPosts();
        } else if (payload.eventType === 'UPDATE') {
          // Update the specific post (usually for count changes)
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === payload.new.id
                ? { ...post, ...payload.new }
                : post
            )
          );
        } else if (payload.eventType === 'DELETE') {
          // Remove deleted post
          setPosts(prevPosts =>
            prevPosts.filter(post => post.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser !== null) {
      fetchPosts();
    }
  }, [currentUser]);

  return {
    posts,
    loading,
    currentUser,
    createPost,
    toggleLike,
    refreshPosts: fetchPosts
  };
};
