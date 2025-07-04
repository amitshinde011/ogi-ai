
import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostActionsProps {
  isLiked?: boolean;
  likeCount: number;
  onLike: () => void;
  onToggleComments: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({
  isLiked,
  likeCount,
  onLike,
  onToggleComments
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={`p-0 h-auto hover:bg-transparent ${
            isLiked ? 'text-red-500' : 'text-gray-700'
          }`}
        >
          <Heart 
            size={32}
            strokeWidth={1.5}
            className={isLiked ? 'fill-current' : ''} 
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleComments}
          className="p-0 h-auto hover:bg-transparent text-gray-700"
        >
          <MessageCircle size={32} strokeWidth={1.5} />
        </Button>
      </div>

      {likeCount > 0 && (
        <p className="text-sm font-semibold">
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </p>
      )}
    </div>
  );
};
