
import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CommunityPost } from '@/hooks/useCommunityFeed';
import { CommentSection } from './CommentSection';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: CommunityPost;
  onLike: (postId: number) => void;
  currentUserId?: string;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, currentUserId }) => {
  const [showComments, setShowComments] = useState(false);

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getAvatarUrl = (authorId: string, profileUrl?: string | null) => {
    return profileUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage 
              src={getAvatarUrl(post.author_id, post.author?.profile_photo_url)}
              alt={post.author?.name || 'User'}
            />
            <AvatarFallback>
              {(post.author?.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">
              {post.author?.name || 'Anonymous User'}
            </p>
            <p className="text-xs text-gray-500">{formatTime(post.created_at)}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="p-2">
          <MoreHorizontal size={16} />
        </Button>
      </div>

      {/* Image */}
      <div className="aspect-square">
        <img 
          src={post.image_url} 
          alt="Post content" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions and Content */}
      <div className="p-4">
        {/* Action Buttons */}
        <div className="flex items-center space-x-4 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={`p-0 h-auto hover:bg-transparent ${
              post.is_liked ? 'text-red-500' : 'text-gray-700'
            }`}
          >
            <Heart 
              size={24}
              strokeWidth={1.5}
              className={post.is_liked ? 'fill-current' : ''} 
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="p-0 h-auto hover:bg-transparent text-gray-700"
          >
            <MessageCircle size={24} strokeWidth={1.5} />
          </Button>
        </div>

        {/* Like Count */}
        {post.like_count > 0 && (
          <p className="text-sm font-semibold mb-2">
            {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm mb-2">
            <span className="font-semibold">{post.author?.name || 'Anonymous User'}</span>{' '}
            {post.caption}
          </p>
        )}

        {/* Comment Count */}
        {post.comment_count > 0 && (
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-gray-500 hover:underline mb-2"
          >
            View all {post.comment_count} comments
          </button>
        )}

        {/* Comments Section */}
        {showComments && (
          <CommentSection postId={post.id} currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
};
