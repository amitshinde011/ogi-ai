
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_name: string;
  user_profile_picture_url: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string;
  user_name: string;
  user_avatar: string;
  replies?: PostComment[];
}

export const useCommunity = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user with profile data
  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, profile_photo_url')
          .eq('user_id', user.id)
          .maybeSingle();

        const displayName = profile?.name || user.email?.split('@')[0] || 'User';
        const displayAvatar = profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

        setCurrentUser({
          id: user.id,
          name: displayName,
          avatar: displayAvatar
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Fetch posts from database
  const fetchPosts = async () => {
    try {
      setLoading(true);
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
      setPosts(posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Create new post
  const createPost = async (content: string, imageFile?: File) => {
    if (!currentUser) {
      toast({ title: "Authentication required", variant: "destructive" });
      return false;
    }

    if (!content.trim()) {
      toast({ 
        title: "Content required", 
        description: "Please add a description to your post",
        variant: "destructive" 
      });
      return false;
    }

    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('community-uploads')
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({ title: "Failed to upload image", variant: "destructive" });
          return false;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('community-uploads')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      // Create post (triggers will populate user info)
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: currentUser.id,
          content: content.trim(),
          image_url: imageUrl
        });

      if (error) throw error;

      await fetchPosts();
      toast({ title: "Post created successfully!" });
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: "Failed to create post", variant: "destructive" });
      return false;
    }
  };

  // Delete post
  const deletePost = async (postId: string) => {
    try {
      if (!currentUser) {
        toast({ title: "Authentication required", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      await fetchPosts();
      toast({ title: "Post deleted successfully!" });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: "Failed to delete post", variant: "destructive" });
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();

    const channel = supabase
      .channel('community-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        },
        () => {
          console.log('Real-time post change detected');
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
    currentUser,
    createPost,
    deletePost,
    fetchPosts
  };
};
