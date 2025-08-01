
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CommunityPost } from './useCommunityFeed';

export const useCommunityPosts = (currentUser: any) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const authorIds = [...new Set(postsData?.map(post => post.author_id) || [])];
      
      // Get user profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, name, profile_photo_url')
        .in('user_id', authorIds);

      // Get automation users (for bot posts)
      const { data: automationProfiles } = await supabase
        .from('automation_users')
        .select('user_id, name, profile_photo_url')
        .in('user_id', authorIds);

      // Create profile map from both sources
      const profileMap = new Map();
      
      // Add regular user profiles
      profiles?.forEach(profile => {
        profileMap.set(profile.user_id, {
          name: profile.name,
          profile_photo_url: profile.profile_photo_url
        });
      });

      // Add automation user profiles (will override if there's a conflict)
      automationProfiles?.forEach(profile => {
        profileMap.set(profile.user_id, {
          name: profile.name,
          profile_photo_url: profile.profile_photo_url
        });
      });

      let userLikes: any[] = [];
      if (currentUser) {
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUser.id);
        userLikes = likesData || [];
      }

      const likedPostIds = new Set(userLikes.map(like => like.post_id));

      const postsWithAuthors = postsData?.map(post => ({
        ...post,
        user_has_reported: false, // This hook doesn't handle reporting
        author: profileMap.get(post.author_id) || {
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

  useEffect(() => {
    if (currentUser !== null) {
      fetchPosts();
    }
  }, [currentUser]);

  return { posts, setPosts, loading, fetchPosts };
};
