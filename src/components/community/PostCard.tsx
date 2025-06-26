
import React, { useState } from 'react';
import { Heart, MessageCircle, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRelativeTime } from '@/utils/dateUtils';
import { usePostLikes, usePostComments } from '@/hooks/usePostInteractions';
import { CommunityPost } from '@/hooks/useCommunity';
import CommentsSection from './CommentsSection';

interface PostCardProps {
  post: CommunityPost;
  currentUserId?: string;
  onDelete: (postId: string) => void;
}

const PostCard = ({ post, currentUserId, onDelete }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  
  const { isLiked, likesCount, toggleLike } = usePostLikes(post.id, post.likes_count, currentUserId);
  const { comments, commentsCount, addComment, deleteComment } = usePostComments(post.id);

  const displayAvatar = post.user_profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`;
  const displayName = post.user_name || 'Unknown User';

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-10 h-10 rounded-full mr-3 object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`;
              }}
            />
            <div>
              <h4 className="font-semibold text-gray-900">{displayName}</h4>
              <p className="text-sm text-gray-500">
                {getRelativeTime(post.created_at)}
              </p>
            </div>
          </div>
          
          {currentUserId === post.user_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-700 mb-4">{post.content}</p>
        
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full rounded-lg mb-4 object-cover max-h-96"
          />
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLike}
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
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">{commentsCount}</span>
            </Button>
          </div>
        </div>
        
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <CommentsSection
              postId={post.id}
              currentUserId={currentUserId}
              comments={comments}
              onAddComment={addComment}
              onDeleteComment={deleteComment}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
