
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRelativeTime } from '@/utils/dateUtils';

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  user_profile_picture_url?: string;
}

interface PostHeaderProps {
  post: Post;
  currentUserId?: string;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
}

const PostHeader = ({ post, currentUserId, onEdit, onDelete }: PostHeaderProps) => {
  // Use the most reliable source for avatar and name
  const displayAvatar = post.user_profile_picture_url || post.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`;
  const displayName = post.user_name || 'Unknown User';

  console.log('PostHeader - displaying user info:', { 
    userId: post.user_id, 
    displayName, 
    displayAvatar,
    postUserName: post.user_name,
    postUserProfilePictureUrl: post.user_profile_picture_url 
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img
          src={displayAvatar}
          alt={displayName}
          className="w-10 h-10 rounded-full mr-3 object-cover"
          onError={(e) => {
            console.log('Avatar failed to load, using fallback for user:', post.user_id);
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
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(post)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostHeader;
