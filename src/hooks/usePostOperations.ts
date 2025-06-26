
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { validateCommunityPost } from '@/utils/inputValidation';
import { useR2Upload } from '@/hooks/useR2Upload';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  user_profile_picture_url?: string;
}

export const usePostOperations = (fetchPosts: () => void) => {
  const { uploadToR2 } = useR2Upload();

  const createPost = async (currentUser: any, content: string, imageFile?: File) => {
    if (!currentUser) {
      toast({ title: "Authentication required", variant: "destructive" });
      return false;
    }

    // Validate content
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

      // Upload image to R2 if provided
      if (imageFile) {
        const uploadResult = await uploadToR2(imageFile, 'community');
        if (!uploadResult) {
          toast({ title: "Failed to upload image", variant: "destructive" });
          return false;
        }
        imageUrl = uploadResult.imageUrl;
      }

      // The trigger will automatically populate user_name and user_profile_picture_url
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: currentUser.id,
          content: content.trim(),
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

    if (!editingPost.content.trim()) {
      toast({ 
        title: "Content required", 
        description: "Please add a description to your post",
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
          content: editingPost.content.trim()
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

  return {
    createPost,
    updatePost,
    deletePost
  };
};
