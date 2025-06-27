
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SocialPost } from './useSocialPosts';

interface ProfileUser {
  id: string;
  name: string | null;
  profile_photo_url: string | null;
}

export const useFollowers = () => {
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [userPosts, setUserPosts] = useState<SocialPost[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, name, profile_photo_url')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfileUser(profile);

      // Fetch user posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles!posts_user_id_fkey (
            name,
            profile_photo_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setUserPosts(posts || []);

      // Fetch follower count
      const { count: followers } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      setFollowerCount(followers || 0);

      // Fetch following count
      const { count: following } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      setFollowingCount(following || 0);

      // Check if current user follows this user
      if (currentUser) {
        const { data: followData } = await supabase
          .from('followers')
          .select('*')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId)
          .single();

        setIsFollowing(!!followData);
      }

    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({ title: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (userId: string) => {
    if (!currentUser) {
      toast({ title: "Please log in to follow users", variant: "destructive" });
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', userId);

        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
        toast({ title: "Unfollowed user" });
      } else {
        // Follow
        await supabase
          .from('followers')
          .insert({
            follower_id: currentUser.id,
            following_id: userId
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
