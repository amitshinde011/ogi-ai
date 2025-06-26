
import React from 'react';
import { useComments } from '@/hooks/useComments';
import { useCommentActions } from '@/hooks/useCommentActions';
import Comment from './Comment';
import CommentForm from './CommentForm';

interface CommentsSectionProps {
  postId: string;
  currentUserId?: string;
  onCommentAdded: () => void;
  onCommentDeleted: () => void;
}

const CommentsSection = ({ postId, currentUserId, onCommentAdded, onCommentDeleted }: CommentsSectionProps) => {
  const { comments, loading } = useComments(postId);
  const { handleAddComment, handleAddReply, handleEditComment, handleDeleteComment } = useCommentActions(
    postId,
    onCommentAdded,
    onCommentDeleted
  );

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add new comment - allow anyone to comment, but show login prompt if not authenticated */}
      <CommentForm onSubmit={(content) => handleAddComment(content, currentUserId)} />

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
              onReply={(parentCommentId, content) => handleAddReply(parentCommentId, content, currentUserId)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
