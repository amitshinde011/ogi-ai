
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Comment from './Comment';
import CommentForm from './CommentForm';

interface CommentType {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_comment_id?: string;
  user_name?: string;
  user_avatar?: string;
  replies?: CommentType[];
}

interface CommentsSectionProps {
  postId: string;
  currentUserId?: string;
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
}

const CommentsSection = ({ postId, currentUserId, onCommentAdded, onCommentDeleted }: CommentsSectionProps) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for post:', postId);
      
      const { data: commentsData, error } = await supabase
        .from('community_post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      console.log('Raw comments data:', commentsData);

      // Fetch user profiles for comments
      const commentsWithUserInfo = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('name, profile_photo_url')
            .eq('user_id', comment.user_id)
            .maybeSingle();

          return {
            ...comment,
            user_name: profile?.name || 'Unknown User',
            user_avatar: profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`
          };
        })
      );

      // Organize comments into threads (parent comments with replies)
      const parentComments = commentsWithUserInfo.filter(comment => !comment.parent_comment_id);
      const repliesMap = commentsWithUserInfo.reduce((acc, comment) => {
        if (comment.parent_comment_id) {
          if (!acc[comment.parent_comment_id]) {
            acc[comment.parent_comment_id] = [];
          }
          acc[comment.parent_comment_id].push(comment);
        }
        return acc;
      }, {} as Record<string, CommentType[]>);

      const threaded = parentComments.map(comment => ({
        ...comment,
        replies: repliesMap[comment.id] || []
      }));

      console.log('Threaded comments:', threaded);
      setComments(threaded);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({ title: "Failed to load comments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: content
        });

      if (error) throw error;

      await fetchComments();
      onCommentAdded();
      toast({ title: "Comment added successfully!" });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  };

  const handleAddReply = async (parentCommentId: string, content: string) => {
    if (!currentUserId) return;

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

      await fetchComments();
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

      await fetchComments();
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

      await fetchComments();
      onCommentDeleted();
      toast({ title: "Comment deleted successfully!" });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({ title: "Failed to delete comment", variant: "destructive" });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add new comment */}
      {currentUserId && (
        <CommentForm onSubmit={handleAddComment} />
      )}

      {/* Comments list */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReply={handleAddReply}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
