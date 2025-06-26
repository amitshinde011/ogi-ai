
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useCommentActions = (postId: string, onCommentAdded: () => void, onCommentDeleted: () => void) => {
  const handleAddComment = async (content: string, currentUserId?: string) => {
    if (!currentUserId) {
      toast({ title: "Please log in to comment", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: content
        });

      if (error) throw error;

      onCommentAdded();
      toast({ title: "Comment added successfully!" });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string, currentUserId?: string) => {
    if (!currentUserId) {
      toast({ title: "Please log in to reply", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: content,
          parent_comment_id: parentCommentId
        });

      if (error) throw error;

      onCommentAdded();
      toast({ title: "Reply added successfully!" });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({ title: "Failed to add reply", variant: "destructive" });
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('community_post_comments')
        .update({ content: content })
        .eq('id', commentId);

      if (error) throw error;

      toast({ title: "Comment updated successfully!" });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({ title: "Failed to update comment", variant: "destructive" });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('community_post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      onCommentDeleted();
      toast({ title: "Comment deleted successfully!" });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({ title: "Failed to delete comment", variant: "destructive" });
    }
  };

  return {
    handleAddComment,
    handleAddReply,
    handleEditComment,
    handleDeleteComment
  };
};
