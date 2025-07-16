
import React, { useState } from 'react';
import { Heart, MessageSquare, Plus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';

interface SocialPost {
  id: string;
  user_id: string;
  image_url: string;
  caption?: string;
  meal_type?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  is_liked?: boolean;
  user_profiles?: {
    name: string | null;
    profile_photo_url: string | null;
  };
}

interface PostCardProps {
  post: SocialPost;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  console.log('🎨 Rendering PostCard for post:', {
    id: post.id,
    user_id: post.user_id,
    user_profiles: post.user_profiles,
    caption: post.caption?.substring(0, 30) + '...'
  });

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getMealTypeDisplay = (mealType: string | null) => {
    if (!mealType) return null;
    return (
      <span className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded-full mb-2">
        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
      </span>
    );
  };

  const handleCommentClick = () => {
    console.log('💬 Comment clicked for post:', post.id);
    setShowComments(!showComments);
    onComment(post.id);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    console.log('📝 Adding comment:', newComment, 'to post:', post.id);
    // Note: This would need to be implemented with the new comment system
    setNewComment('');
  };

  // Generate fallback data
  const userName = post.user_profiles?.name || 'Anonymous User';
  const userAvatar = post.user_profiles?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`;

  console.log('👤 User display data:', { userName, userAvatar, hasProfiles: !!post.user_profiles });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage 
            src={userAvatar} 
            alt={userName}
          />
          <AvatarFallback>
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">{userName}</p>
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
              size={28}
              strokeWidth={1.5}
              className={post.is_liked ? 'fill-current' : ''} 
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCommentClick}
            className="p-0 h-auto hover:bg-transparent text-gray-700"
          >
            <MessageSquare size={28} strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent text-gray-700"
          >
            <Plus size={28} strokeWidth={1.5} />
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
            <span className="font-semibold">{userName}</span>{' '}
            {post.caption}
          </p>
        )}

        {/* Comment count */}
        {post.comment_count > 0 && (
          <button 
            onClick={handleCommentClick}
            className="text-sm text-gray-500 mt-1 hover:underline"
          >
            View all {post.comment_count} comments
          </button>
        )}

        {/* Comments Section - Simplified for now */}
        {showComments && (
          <div className="mt-4 border-t pt-4">
            <div className="text-sm text-gray-500 mb-4">
              Comments would be loaded here with the new community system
            </div>
            
            {/* Add comment input */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser`} />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-3 py-1"
                >
                  <Plus size={16} strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
