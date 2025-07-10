
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { Input } from '@/components/ui/input';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  postId: number;
  currentUserId?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, currentUserId }) => {
  const { comments, loading, addComment, refreshComments } = useComments(postId);
  const { userProfile, user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await addComment(newComment.trim());
    if (success) {
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  const getAvatarUrl = (authorId: string, profileUrl?: string | null) => {
    return profileUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`;
  };

  const handleDeleteComment = (commentId: number) => {
    // Comment will be removed via real-time updates
    refreshComments();
  };

  const handleUpdateComment = (commentId: number, newText: string) => {
    // Comment will be updated via real-time updates
    refreshComments();
  };

  return (
    <div className="mt-3 border-t pt-3">
      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader size="md" />
        </div>
      ) : (
        <div className="space-y-3 mb-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={handleDeleteComment}
              onUpdate={handleUpdateComment}
            />
          ))}
        </div>
      )}
      
      {/* Add Comment Input */}
      <div className="flex items-center space-x-2">
        <Avatar className="w-6 h-6">
          <AvatarImage 
            src={userProfile?.profile_photo_url || (user ? getAvatarUrl(user.id) : undefined)}
            alt="You"
          />
          <AvatarFallback>
            {userProfile?.name?.charAt(0).toUpperCase() || 'Y'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex items-center space-x-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
            disabled={isSubmitting}
          />
          <Button
            size="sm"
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="px-3 py-1"
          >
            <Send size={16} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
};
