
import React from 'react';
import { Heart, MessageCircle, Share2, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
}

const PostCard = ({ post, currentUserId, onEdit, onDelete }: PostCardProps) => {
  return (
    <Card className="bg-card-gray border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={post.user_avatar}
              alt={post.user_name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <h4 className="font-semibold text-dark-text">{post.user_name}</h4>
              <p className="text-sm text-dark-text opacity-70">
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
                className="text-dark-text hover:bg-gray-100"
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(post.id)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-dark-text mb-2">{post.title}</h3>
        <p className="text-dark-text mb-4">{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full rounded-lg mb-4"
          />
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-dark-text hover:text-red-500">
              <Heart size={16} className="mr-1" />
              <span className="text-sm">{post.likes_count}</span>
            </button>
            <button className="flex items-center text-dark-text hover:text-blue-500">
              <MessageCircle size={16} className="mr-1" />
              <span className="text-sm">{post.comments_count}</span>
            </button>
          </div>
          <button className="flex items-center text-dark-text hover:text-green-500">
            <Share2 size={16} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
