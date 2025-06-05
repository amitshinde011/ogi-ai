
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
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

      const postsWithUserInfo = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('name, profile_photo_url')
            .eq('user_id', post.user_id)
            .maybeSingle();

          const { data: { user } } = await supabase.auth.getUser();
          const fallbackName = user?.email?.split('@')[0] || 'User';

          return {
            ...post,
            user_name: profile?.name || fallbackName,
            user_avatar: profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`
          };
        })
      );

      console.log('Posts with user info:', postsWithUserInfo);
      setPosts(postsWithUserInfo);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (currentUser: any, newPost: { title: string; content: string }) => {
    if (!currentUser || !newPost.title.trim() || !newPost.content.trim()) return false;

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: currentUser.id,
          title: newPost.title,
          content: newPost.content
        });

      if (error) throw error;

      fetchPosts();
      toast({ title: "Post created successfully!" });
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: "Failed to create post", variant: "destructive" });
      return false;
    }
  };

  const updatePost = async (editingPost: Post) => {
    if (!editingPost || !editingPost.title.trim() || !editingPost.content.trim()) return false;

    try {
      const { error } = await supabase
        .from('community_posts')
        .update({
          title: editingPost.title,
          content: editingPost.content
        })
        .eq('id', editingPost.id);

      if (error) throw error;

      fetchPosts();
      toast({ title: "Post updated successfully!" });
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      toast({ title: "Failed to update post", variant: "destructive" });
      return false;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      fetchPosts();
      toast({ title: "Post deleted successfully!" });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: "Failed to delete post", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchPosts();
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
