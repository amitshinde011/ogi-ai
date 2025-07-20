
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share, Send, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/Layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/ui/loader';
import { useOptimizedPost } from '@/hooks/useOptimizedPost';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [newComment, setNewComment] = useState('');
  
  const {
    post,
    comments,
    loading,
    error,
    addComment,
    toggleLike
  } = useOptimizedPost(id, user?.id);

  // Handle navigation when post is not found or invalid ID
  React.useEffect(() => {
    if (!loading && (error || !id)) {
      navigate('/community');
    }
  }, [loading, error, id, navigate]);

  const handleLike = async () => {
    await toggleLike();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const success = await addComment(newComment.trim());
    if (success) {
      setNewComment('');
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getMealEmoji = (category: string) => {
    switch (category) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  if (loading) {
    return (
      <Layout noContainer>
        <PageContainer>
          <Header title="Post" showBack />
          <div className="flex justify-center py-8">
            <Loader size="lg" />
          </div>
        </PageContainer>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout noContainer>
        <PageContainer>
          <Header title="Post" showBack />
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground">Post not found</p>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout noContainer>
      <PageContainer>
        <Header title="Post" showBack />
      
      <div className="pb-4">
        {/* Post Content */}
        <Card className="mx-4 overflow-hidden animate-fade-in">
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src={post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`} />
                  <AvatarFallback>{post.author_name[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h4 className="font-semibold text-stone">{post.author_name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="mr-1">{getMealEmoji(post.category)}</span>
                    <span className="capitalize mr-2">{post.category}</span>
                    <Clock size={12} className="mr-1" />
                    <span>{formatTime(post.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Image */}
            <div className="relative">
              <img
                src={post.image_url}
                alt="Meal"
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`p-2 ${post.user_has_liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
                  >
                    <Heart size={20} fill={post.user_has_liked ? 'currentColor' : 'none'} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-muted-foreground hover:text-primary"
                  >
                    <MessageCircle size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-muted-foreground hover:text-primary"
                  >
                    <Share size={20} />
                  </Button>
                </div>
              </div>

              {/* Likes Count */}
              {post.like_count > 0 && (
                <p className="font-semibold text-sm mb-2 text-stone">
                  {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
                </p>
              )}

              {/* Description */}
              {post.caption && (
                <p className="text-sm text-stone mb-4">
                  <span className="font-semibold mr-2">{post.author_name}</span>
                  {post.caption}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mx-4 mt-4">
          <h3 className="text-lg font-semibold text-stone mb-4">
            Comments ({comments.length})
          </h3>

          {/* Add Comment */}
          {user && (
            <div className="flex items-center space-x-3 mb-4 p-4 bg-white rounded-xl border border-sage/20">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} />
                <AvatarFallback>{userProfile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="border-none bg-transparent focus:ring-0 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="gradient-sage text-white px-3 py-1"
              >
                <Send size={16} />
              </Button>
            </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-white rounded-xl border border-sage/20">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_id}`} />
                    <AvatarFallback>{comment.author_name[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm text-stone">{comment.author_name}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-stone mb-2">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle size={48} className="mx-auto mb-4 text-sage" />
              <p className="text-muted-foreground mb-2">No comments yet</p>
              <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
        </div>
      </PageContainer>
    </Layout>
  );
};

export default PostDetail;
