
import React, { useState } from 'react';
import { Reply, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getRelativeTime } from '@/utils/dateUtils';
import ReplyForm from './ReplyForm';

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

interface CommentProps {
  comment: Comment;
  currentUserId?: string;
  isReply?: boolean;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentCommentId: string, content: string) => void;
}

const Comment = ({ comment, currentUserId, isReply = false, onEdit, onDelete, onReply }: CommentProps) => {
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    await onEdit(comment.id, editContent.trim());
    setEditingComment(null);
    setEditContent('');
  };

  const handleReply = async (content: string) => {
    await onReply(comment.id, content);
    setReplyingTo(null);
  };

  return (
    <div className={`${isReply ? 'ml-8 mt-3' : 'mb-4'} bg-white rounded-lg p-3 border border-gray-100`}>
      <div className="flex items-start space-x-3">
        <img
          src={comment.user_avatar}
          alt={comment.user_name}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1 flex-wrap">
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
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={handleEdit}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-dark-text mb-2 break-words">{comment.content}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="text-xs text-gray-500 hover:text-blue-500 h-auto p-1"
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
                      className="text-xs text-gray-500 hover:text-green-500 h-auto p-1"
                    >
                      <Edit size={12} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(comment.id)}
                      className="text-xs text-gray-500 hover:text-red-500 h-auto p-1"
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
        <div className="ml-11 mt-3">
          <ReplyForm onSubmit={handleReply} onCancel={() => setReplyingTo(null)} />
        </div>
      )}
      
      {comment.replies && comment.replies.map(reply => (
        <Comment
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          isReply={true}
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
        />
      ))}
    </div>
  );
};

export default Comment;
