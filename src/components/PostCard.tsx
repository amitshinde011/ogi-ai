
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
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  useEffect(() => {
    checkIfLiked();
  }, [post.id, currentUserId]);

  // Set up real-time subscription for likes count
  useEffect(() => {
    const channel = supabase
      .channel(`post-${post.id}-likes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_post_likes',
          filter: `post_id=eq.${post.id}`
        },
        async () => {
          // Refetch likes count when likes change
          const { data } = await supabase
            .from('community_posts')
            .select('likes_count')
            .eq('id', post.id)
            .single();
          
          if (data) {
            setLikesCount(data.likes_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id]);

  // Set up real-time subscription for comments count
  useEffect(() => {
    const channel = supabase
      .channel(`post-${post.id}-comments`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_post_comments',
          filter: `post_id=eq.${post.id}`
        },
        async () => {
          // Refetch comments count when comments change
          const { data } = await supabase
            .from('community_posts')
            .select('comments_count')
            .eq('id', post.id)
            .single();
          
          if (data) {
            setCommentsCount(data.comments_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id]);

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
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({ title: "Failed to update like", variant: "destructive" });
    }
  };

  const handleCommentAdded = () => {
    if (onPostUpdate) onPostUpdate();
  };

  const handleCommentDeleted = () => {
    if (onPostUpdate) onPostUpdate();
  };

  // Use user_profile_picture_url first, then fall back to user_avatar, then default
  const displayAvatar = post.user_profile_picture_url || post.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`;
  const displayName = post.user_name || 'Anonymous User';

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
                console.log('Avatar failed to load, using fallback');
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
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
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
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
          >
            <Share2 size={18} />
          </Button>
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
