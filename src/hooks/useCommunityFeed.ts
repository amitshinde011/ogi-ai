
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCommunityUser } from './useCommunityUser';
import { useCommunityPosts } from './useCommunityPosts';
import { useCommunityActions } from './useCommunityActions';

export interface CommunityPost {
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
  user_has_reported: boolean;
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
  const { currentUser } = useCommunityUser();
  const { posts, setPosts, loading, fetchPosts } = useCommunityPosts(currentUser);
  const { createPost: createPostAction, toggleLike: toggleLikeAction } = useCommunityActions(currentUser);

  const createPost = async (imageUrl: string, caption: string, category?: string) => {
    return await createPostAction(imageUrl, caption, category);
  };

  const toggleLike = async (postId: number) => {
    await toggleLikeAction(postId, posts, setPosts);
  };

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
          fetchPosts();
        } else if (payload.eventType === 'UPDATE') {
          setPosts(prevPosts =>
            prevPosts.map(post =>
              post.id === payload.new.id
                ? { ...post, ...payload.new }
                : post
            )
          );
        } else if (payload.eventType === 'DELETE') {
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

  return {
    posts,
    loading,
    currentUser,
    createPost,
    toggleLike,
    refreshPosts: fetchPosts
  };
};
