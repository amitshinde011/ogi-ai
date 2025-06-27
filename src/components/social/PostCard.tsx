
import React from 'react';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SocialPost } from '@/hooks/useSocialPosts';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: SocialPost;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getMealTypeDisplay = (mealType: string | null) => {
    if (!mealType) return null;
    return (
      <span className="inline-block bg-sage/20 text-sage text-xs px-2 py-1 rounded-full mb-2">
        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage 
            src={post.user_profiles?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} 
            alt={post.user_profiles?.name || 'User'} 
          />
          <AvatarFallback>
            {(post.user_profiles?.name || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">{post.user_profiles?.name || 'Anonymous'}</p>
          <p className="text-xs text-gray-500">{formatTime(post.created_at)}</p>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square">
        <img 
          src={post.image_url} 
          alt="Post" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={`p-0 h-auto hover:bg-transparent ${
              post.is_liked ? 'text-red-500' : 'text-gray-700'
            }`}
          >
            <Heart 
              className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`} 
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment(post.id)}
            className="p-0 h-auto hover:bg-transparent text-gray-700"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent text-gray-700"
          >
            <Share className="w-6 h-6" />
          </Button>
        </div>

        {/* Like count */}
        {post.like_count > 0 && (
          <p className="text-sm font-semibold mb-1">
            {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Meal type badge */}
        {getMealTypeDisplay(post.meal_type)}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold">{post.user_profiles?.name || 'User'}</span>{' '}
            {post.caption}
          </p>
        )}

        {/* Comment count */}
        {post.comment_count > 0 && (
          <button 
            onClick={() => onComment(post.id)}
            className="text-sm text-gray-500 mt-1 hover:underline"
          >
            View all {post.comment_count} comments
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
