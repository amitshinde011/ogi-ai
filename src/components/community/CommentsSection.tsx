
import React, { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getRelativeTime } from '@/utils/dateUtils';
import ReplyForm from '@/components/ReplyForm';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
  currentUserId?: string;
  comments: Comment[];
  onAddComment: (content: string, currentUserId?: string, parentCommentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const CommentsSection = ({ 
  postId, 
  currentUserId, 
  comments, 
  onAddComment, 
  onDeleteComment 
}: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim(), currentUserId);
    setNewComment('');
  };

  const handleSubmitReply = (content: string, parentCommentId: string) => {
    onAddComment(content, currentUserId, parentCommentId);
    setReplyingTo(null);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-6 mt-2' : 'mb-3'} bg-gray-50 rounded-lg p-3`}>
      <div className="flex items-start space-x-3">
        <img
          src={comment.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`}
          alt={comment.user_name}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-gray-900">{comment.user_name}</span>
              <span className="text-xs text-gray-500">{getRelativeTime(comment.created_at)}</span>
            </div>
            
            {currentUserId === comment.user_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteComment(comment.id)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={12} />
              </Button>
            )}
          </div>
          
          <p className="text-sm text-gray-800 mb-2 break-words">{comment.content}</p>
          
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-xs text-gray-500 hover:text-blue-600 h-6 px-2 -ml-2"
            >
              Reply
            </Button>
          )}
        </div>
      </div>
      
      {replyingTo === comment.id && (
        <div className="ml-11 mt-3">
          <ReplyForm
            onSubmit={(content) => handleSubmitReply(content, comment.id)}
            onCancel={handleCancelReply}
          />
        </div>
      )}
      
      {comment.replies && comment.replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Add new comment */}
      <div className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-16 resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="bg-sage hover:bg-sage/90 text-white h-8 px-4 text-sm"
          >
            <Send size={14} className="mr-1" />
            Comment
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
