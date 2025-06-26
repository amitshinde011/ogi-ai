
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePostLikes } from '@/hooks/usePostLikes';
import { usePostComments } from '@/hooks/usePostComments';
import PostHeader from './PostHeader';
import PostActions from './PostActions';
import CommentsSection from './CommentsSection';

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

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onPostUpdate?: () => void;
}

const PostCard = ({ post, currentUserId, onEdit, onDelete, onPostUpdate }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  
  const { isLiked, likesCount, handleLike } = usePostLikes(post.id, post.likes_count, currentUserId);
  const { commentsCount } = usePostComments(post.id, post.comments_count);

  const handleCommentAdded = () => {
    if (onPostUpdate) onPostUpdate();
  };

  const handleCommentDeleted = () => {
    if (onPostUpdate) onPostUpdate();
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <PostHeader
          post={post}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-700 mb-4">{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post"
            className="w-full rounded-lg mb-4 object-cover max-h-96"
          />
        )}
        
        <PostActions
          isLiked={isLiked}
          likesCount={likesCount}
          commentsCount={commentsCount}
          onLike={handleLike}
          onToggleComments={() => setShowComments(!showComments)}
        />
        
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <CommentsSection
              postId={post.id}
              currentUserId={currentUserId}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
