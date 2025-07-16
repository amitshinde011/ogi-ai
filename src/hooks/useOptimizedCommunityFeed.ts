import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { communityFeedRefreshService } from '@/utils/communityFeedRefreshService';

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

const PAGE_SIZE = 10;

export const useOptimizedCommunityFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user once with caching
  const fetchCurrentUser = useCallback(async () => {
    try {
      if (!user) return;
      
      // Check if we already have the user cached
      if (currentUser?.id === user.id) return;
      
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
  }, [user, currentUser?.id]);

  // Optimized query using materialized view and caching
  const fetchPosts = useCallback(async (offset = 0, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      if (!currentUser) {
        console.warn('No current user found for community feed');
        if (reset) setPosts([]);
        setHasMore(false);
        return;
      }

      console.log(`🚀 Fetching community feed: offset=${offset}, reset=${reset}`);
      const startTime = performance.now();

      // Use optimized database function with materialized view
      const { data: postsData, error: postsError } = await supabase.rpc('get_community_feed', {
        p_user_id: currentUser.id,
        p_limit: PAGE_SIZE,
        p_offset: offset
      });

      const endTime = performance.now();
      console.log(`⚡ Community feed fetched in ${(endTime - startTime).toFixed(2)}ms`);

      if (postsError) {
        console.error('❌ Error fetching community feed:', postsError);
        throw postsError;
      }

      if (!postsData?.length) {
        console.log('📭 No more posts available');
        if (reset) setPosts([]);
        setHasMore(false);
        return;
      }

      // Process posts - data comes pre-optimized from materialized view
      const processedPosts = postsData.map(post => ({
        id: post.id,
        author_id: post.author_id,
        image_url: post.image_url,
        caption: post.caption,
        category: post.category,
        like_count: post.like_count,
        comment_count: post.comment_count,
        created_at: post.created_at,
        author: {
          name: post.author_name,
          profile_photo_url: post.author_avatar
        },
        is_liked: post.user_has_liked
      }));

      console.log(`📦 Processed ${processedPosts.length} posts`);

      if (reset) {
        setPosts(processedPosts);
      } else {
        setPosts(prev => {
          // Prevent duplicates when loading more
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = processedPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      }

      setHasMore(processedPosts.length === PAGE_SIZE);
    } catch (error) {
      console.error('❌ Error fetching community posts:', error);
      toast({ title: "Failed to load community feed", variant: "destructive" });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentUser]);

  // Load more posts
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPosts(posts.length, false);
    }
  }, [posts.length, loadingMore, hasMore, fetchPosts]);

  // Refresh posts
  const refreshPosts = useCallback(() => {
    fetchPosts(0, true);
  }, [fetchPosts]);

  // Create post
  const createPost = useCallback(async (imageUrl: string, caption: string, category?: string) => {
    if (!currentUser) {
      toast({ title: "Please log in to create posts", variant: "destructive" });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: currentUser.id,
          image_url: imageUrl,
          caption: caption || null,
          category: category || null
        })
        .select('*')
        .single();

      if (error) throw error;

      // Add new post to the beginning of the list with correct structure
      const newPost: CommunityPost = {
        id: data.id,
        image_url: data.image_url,
        caption: data.caption,
        category: data.category,
        created_at: data.created_at,
        like_count: data.like_count,
        comment_count: data.comment_count,
        author_id: data.author_id,
        author: {
          name: currentUser.name || 'Unknown User',
          profile_photo_url: currentUser.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`
        },
        is_liked: false
      };

      setPosts(prev => [newPost, ...prev]);
      toast({ title: "Post created successfully!" });
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: "Failed to create post", variant: "destructive" });
      return false;
    }
  }, [currentUser]);

  // Toggle like with optimistic updates
  const toggleLike = useCallback(async (postId: number) => {
    if (!currentUser) {
      toast({ title: "Please log in to like posts", variant: "destructive" });
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? {
              ...p,
              is_liked: !p.is_liked,
              like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1
            }
          : p
      )
    );

    try {
      if (post.is_liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('post_id', postId);
      } else {
        await supabase
          .from('likes')
          .insert({
            user_id: currentUser.id,
            post_id: postId
          });
      }
    } catch (error) {
      // Revert optimistic update on error
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                is_liked: post.is_liked,
                like_count: post.like_count
              }
            : p
        )
      );
      console.error('Error toggling like:', error);
      toast({ title: "Failed to update like", variant: "destructive" });
    }
  }, [currentUser, posts]);

  // Initialize and setup refresh service
  useEffect(() => {
    fetchCurrentUser();
    
    // Start the background refresh service
    communityFeedRefreshService.startListening();
    
    return () => {
      // Cleanup refresh service
      communityFeedRefreshService.stopListening();
    };
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (currentUser !== null) {
      fetchPosts(0, true);
    }
  }, [currentUser, fetchPosts]);

  // Real-time updates - optimized to only add new posts
  useEffect(() => {
    if (!currentUser) return;

    let channel: any = null;

    const setupRealtimeSubscription = () => {
      // Clean up existing channel
      if (channel) {
        supabase.removeChannel(channel);
      }

      channel = supabase
        .channel('public:posts')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'posts' 
        }, async (payload) => {
          if (payload.new.author_id !== currentUser?.id) {
            // Fetch the new post with author info
            const { data: postData } = await supabase
              .from('posts')
              .select('*')
              .eq('id', payload.new.id)
              .single();

            if (postData) {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('name, profile_photo_url')
                .eq('user_id', postData.author_id)
                .single();

              const newPost: CommunityPost = {
                ...postData,
                author: {
                  name: profile?.name || 'Anonymous User',
                  profile_photo_url: profile?.profile_photo_url || null
                },
                is_liked: false
              };
              setPosts(prev => [newPost, ...prev]);
            }
          }
        })
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'posts' 
        }, (payload) => {
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
          table: 'posts' 
        }, (payload) => {
          setPosts(prev =>
            prev.filter(post => post.id !== payload.old.id)
          );
        })
        .subscribe();
    };

    // Handle visibility change to reconnect when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Tab became visible, reconnecting realtime...');
        // Don't refresh data to prevent re-rendering on tab focus
        // refreshPosts();
        // Don't reconnect realtime subscription on visibility change
        // setupRealtimeSubscription();
      }
    };

    // Set up initial subscription
    setupRealtimeSubscription();

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [currentUser]);

  return {
    posts,
    loading,
    loadingMore,
    hasMore,
    currentUser,
    createPost,
    toggleLike,
    refreshPosts,
    loadMore
  };
};