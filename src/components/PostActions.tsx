
import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostActionsProps {
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: () => void;
  onToggleComments: () => void;
}

const PostActions = ({ isLiked, likesCount, commentsCount, onLike, onToggleComments }: PostActionsProps) => {
  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
      <div className="flex items-center space-x-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            isLiked 
              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
              : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="text-sm font-medium">{likesCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleComments}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-medium">{commentsCount}</span>
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
      >
        <Share2 size={18} />
      </Button>
    </div>
  );
};

export default PostActions;
