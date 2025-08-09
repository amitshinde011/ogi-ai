
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileUser {
  id: string;
  user_id: string;
  name: string | null;
  profile_photo_url: string | null;
}

interface UserPost {
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
}

export const useFollowers = () => {
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { user } = useAuth();

  // Fetch current user
  const fetchCurrentUser = async () => {
    if (!user) return;
    
    try {
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
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchUserProfile = async (profileId: string) => {
    try {
      setLoading(true);

      // Fetch user profile (need auth user_id for v2 tables)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, user_id, name, profile_photo_url')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;
      setProfileUser(profile as ProfileUser);

      const targetAuthUserId = profile.user_id;

      // Fetch user posts authored by this auth user
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', targetAuthUserId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch author profile once for enrichment
      const { data: authorProfile } = await supabase
        .from('user_profiles')
        .select('user_id, name, profile_photo_url')
        .eq('user_id', targetAuthUserId)
        .maybeSingle();

      const postsWithAuthors = (posts || []).map(post => ({
        ...post,
        author: authorProfile || {
          name: 'Anonymous User',
          profile_photo_url: null
        }
      }));

      setUserPosts(postsWithAuthors);

      // Followers (v2) counts using auth user IDs
      const { count: followers } = await supabase
        .from('followers_v2')
        .select('*', { count: 'exact', head: true })
        .eq('following_user_id', targetAuthUserId);
      setFollowerCount(followers || 0);

      const { count: following } = await supabase
        .from('followers_v2')
        .select('*', { count: 'exact', head: true })
        .eq('follower_user_id', targetAuthUserId);
      setFollowingCount(following || 0);

      // Is current user following this profile? (auth IDs)
      if (currentUser?.user_id) {
        const { data: followData } = await supabase
          .from('followers_v2')
          .select('*')
          .eq('follower_user_id', currentUser.user_id)
          .eq('following_user_id', targetAuthUserId)
          .maybeSingle();
        setIsFollowing(!!followData);
      }

    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({ title: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (authUserId: string) => {
    if (!currentUser) {
      toast({ title: "Please log in to follow users", variant: "destructive" });
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('followers_v2')
          .delete()
          .eq('follower_user_id', currentUser.user_id)
          .eq('following_user_id', authUserId);

        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast({ title: "Unfollowed user" });
      } else {
        // Follow
        await supabase
          .from('followers_v2')
          .insert({
            follower_user_id: currentUser.user_id,
            following_user_id: authUserId
          });

        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast({ title: "Following user" });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({ title: "Failed to update follow status", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return {
    profileUser,
    userPosts,
    followerCount,
    followingCount,
    isFollowing,
    loading,
    fetchUserProfile,
    toggleFollow
  };
};
