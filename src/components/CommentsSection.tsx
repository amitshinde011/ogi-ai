
import React, { useState, useEffect } from 'react';
import { Send, Reply, Edit, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getRelativeTime } from '@/utils/dateUtils';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_comment_id?: string;
  user_name?: string;
  user_avatar?: string;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
  currentUserId?: string;
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
}

const CommentsSection = ({ postId, currentUserId, onCommentAdded, onCommentDeleted }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
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
      }, {} as Record<string, Comment[]>);

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

  const handleAddComment = async () => {
    if (!currentUserId || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      onCommentAdded();
      toast({ title: "Comment added successfully!" });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!currentUserId || !replyContent.trim()) return;

    try {
      const { error } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          content: replyContent.trim(),
          parent_comment_id: parentCommentId
        });

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
      await fetchComments();
      onCommentAdded();
      toast({ title: "Reply added successfully!" });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({ title: "Failed to add reply", variant: "destructive" });
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('community_post_comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      setEditingComment(null);
      setEditContent('');
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

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-3' : 'mb-4'} bg-white rounded-lg p-3 border border-gray-100`}>
      <div className="flex items-start space-x-3">
        <img
          src={comment.user_avatar}
          alt={comment.user_name}
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm text-dark-text">{comment.user_name}</span>
            <span className="text-xs text-gray-500">{getRelativeTime(comment.created_at)}</span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
          
          {editingComment === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-16"
                placeholder="Edit your comment..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-dark-text mb-2">{comment.content}</p>
              <div className="flex items-center space-x-3">
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-xs text-gray-500 hover:text-blue-500"
                  >
                    <Reply size={12} className="mr-1" />
                    Reply
                  </Button>
                )}
                {currentUserId === comment.user_id && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(comment)}
                      className="text-xs text-gray-500 hover:text-green-500"
                    >
                      <Edit size={12} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={12} className="mr-1" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {replyingTo === comment.id && (
        <div className="ml-11 mt-3 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="min-h-16"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleAddReply(comment.id)}>
              <Send size={14} className="mr-1" />
              Reply
            </Button>
            <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      {comment.replies && comment.replies.map(reply => renderComment(reply, true))}
    </div>
  );

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add new comment */}
      {currentUserId && (
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-20"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="bg-sage hover:bg-sage/90 text-white"
            >
              <Send size={14} className="mr-1" />
              Comment
            </Button>
          </div>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
