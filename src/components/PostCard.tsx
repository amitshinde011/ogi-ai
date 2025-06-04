
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRelativeTime } from '@/utils/dateUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  onPostUpdate?: () => void;
}

const PostCard = ({ post, currentUserId, onEdit, onDelete, onPostUpdate }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  useEffect(() => {
    checkIfLiked();
  }, [post.id, currentUserId]);

  const checkIfLiked = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
        return;
      }

      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast({ title: "Please log in to like posts", variant: "destructive" });
      return;
    }

    try {
      if (isLiked) {
        // Unlike the post
        const { error } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUserId);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like the post
        const { error } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: post.id,
            user_id: currentUserId
          });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({ title: "Failed to update like", variant: "destructive" });
    }
  };

  const handleCommentAdded = () => {
    setCommentsCount(prev => prev + 1);
    if (onPostUpdate) onPostUpdate();
  };

  const handleCommentDeleted = () => {
    setCommentsCount(prev => prev - 1);
    if (onPostUpdate) onPostUpdate();
  };

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
            <button 
              onClick={handleLike}
              className={`flex items-center transition-colors ${
                isLiked ? 'text-red-500' : 'text-dark-text hover:text-red-500'
              }`}
            >
              <Heart size={16} className="mr-1" fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{likesCount}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center text-dark-text hover:text-blue-500 transition-colors"
            >
              <MessageCircle size={16} className="mr-1" />
              <span className="text-sm">{commentsCount}</span>
            </button>
          </div>
          <button className="flex items-center text-dark-text hover:text-green-500 transition-colors">
            <Share2 size={16} />
          </button>
        </div>
        
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
