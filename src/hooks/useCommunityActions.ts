
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CommunityPost } from './useCommunityFeed';

export const useCommunityActions = (currentUser: any) => {
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

  const toggleLike = async (postId: number, posts: CommunityPost[], setPosts: (posts: CommunityPost[]) => void) => {
    if (!currentUser) {
      toast({ title: "Please log in to like posts", variant: "destructive" });
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

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

      setPosts(
        posts.map(p =>
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

  return { createPost, toggleLike };
};
