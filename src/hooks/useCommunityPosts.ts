
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { validateCommunityPost, sanitizeHtml } from '@/utils/inputValidation';
import { useR2Upload } from '@/hooks/useR2Upload';

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
  const { uploadToR2 } = useR2Upload();

  const fetchPosts = async () => {
    try {
      console.log('Fetching community posts...');
      
      // Verify authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Authentication required for fetching posts');
        toast({ title: "Authentication required", variant: "destructive" });
        return;
      }

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
          // Fetch user profile for each post
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('name, profile_photo_url')
            .eq('user_id', post.user_id)
            .maybeSingle();

          // Create display name and avatar
          let displayName = 'Anonymous User';
          let displayAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`;

          if (profile?.name) {
            displayName = profile.name;
          } else if (post.user_id === user.id) {
            // For current user, we can use their email
            displayName = user.email?.split('@')[0] || 'You';
          }

          if (profile?.profile_photo_url) {
            displayAvatar = profile.profile_photo_url;
          }

          console.log('Post user info:', { 
            postId: post.id, 
            userId: post.user_id, 
            profileName: profile?.name, 
            displayName, 
            displayAvatar 
          });

          return {
            ...post,
            user_name: displayName,
            user_avatar: displayAvatar
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

  const ensureUserProfile = async (user: any) => {
    try {
      // Check if user profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id, name, profile_photo_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create a basic profile if it doesn't exist
        const defaultName = user.email?.split('@')[0] || 'User';
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            name: defaultName
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          console.log('Created basic user profile for:', user.id);
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error);
    }
  };

  const createPost = async (currentUser: any, newPost: { title: string; content: string }, imageFile?: File) => {
    if (!currentUser) {
      toast({ title: "Authentication required", variant: "destructive" });
      return false;
    }

    // Ensure user profile exists before creating post
    await ensureUserProfile(currentUser);

    // Validate and sanitize input
    const validation = validateCommunityPost(newPost);
    if (!validation.isValid) {
      toast({ 
        title: "Invalid input", 
        description: validation.errors.join(', '),
        variant: "destructive" 
      });
      return false;
    }

    try {
      let imageUrl = null;

      // Upload image to R2 if provided
      if (imageFile) {
        const uploadResult = await uploadToR2(imageFile, 'community');
        if (!uploadResult) {
          toast({ title: "Failed to upload image", variant: "destructive" });
          return false;
        }
        imageUrl = uploadResult.imageUrl;
      }

      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: currentUser.id,
          title: validation.sanitized.title,
          content: validation.sanitized.content,
          image_url: imageUrl
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
    if (!editingPost) return false;

    // Validate and sanitize input
    const validation = validateCommunityPost({
      title: editingPost.title,
      content: editingPost.content
    });
    
    if (!validation.isValid) {
      toast({ 
        title: "Invalid input", 
        description: validation.errors.join(', '),
        variant: "destructive" 
      });
      return false;
    }

    try {
      // Verify user owns the post
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== editingPost.user_id) {
        toast({ title: "Unauthorized", variant: "destructive" });
        return false;
      }

      const { error } = await supabase
        .from('community_posts')
        .update({
          title: validation.sanitized.title,
          content: validation.sanitized.content
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
      // Verify user owns the post
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication required", variant: "destructive" });
        return;
      }

      // Get post to verify ownership
      const { data: post } = await supabase
        .from('community_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (!post || post.user_id !== user.id) {
        toast({ title: "Unauthorized", variant: "destructive" });
        return;
      }

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
