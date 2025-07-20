
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share, ArrowLeft, Send, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/Layout/PageContainer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/ui/loader';

interface Comment {
  id: number;
  author_id: string;
  post_id: number;
  text: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

interface Post {
  id: number;
  author_id: string;
  image_url: string;
  caption: string;
  category: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  user_has_liked?: boolean;
}

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        navigate('/community');
        return;
      }

      const postId = parseInt(id, 10);
      if (isNaN(postId)) {
        navigate('/community');
        return;
      }

      try {
        // Fetch post details
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (postError || !postData) {
          console.error('Post not found:', postError);
          navigate('/community');
          return;
        }

        // Fetch author information from user_profiles
        let authorName = 'Unknown User';
        let authorAvatar = undefined;
        
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('name, profile_photo_url')
          .eq('user_id', postData.author_id)
          .single();

        if (userProfile) {
          authorName = userProfile.name || 'Unknown User';
          authorAvatar = userProfile.profile_photo_url;
        } else {
          // Try automation_users if not found in user_profiles
          const { data: automationUser } = await supabase
            .from('automation_users')
            .select('name, profile_photo_url')
            .eq('user_id', postData.author_id)
            .single();
          
          if (automationUser) {
            authorName = automationUser.name || 'Unknown User';
            authorAvatar = automationUser.profile_photo_url;
          }
        }

        // Check if user has liked this post
        let userHasLiked = false;
        if (user) {
          const { data: likeData } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();
          
          userHasLiked = !!likeData;
        }

        setPost({
          id: postData.id,
          author_id: postData.author_id,
          image_url: postData.image_url,
          caption: postData.caption,
          category: postData.category,
          like_count: postData.like_count,
          comment_count: postData.comment_count,
          created_at: postData.created_at,
          author_name: authorName,
          author_avatar: authorAvatar,
          user_has_liked: userHasLiked
        });

        // Fetch comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: false });

        // Fetch user information for each comment
        const commentsWithUserInfo = await Promise.all(
          (commentsData || []).map(async (comment) => {
            let userName = 'Unknown User';
            let userAvatar = undefined;

            // Try user_profiles first
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('name, profile_photo_url')
              .eq('user_id', comment.author_id)
              .single();

            if (userProfile) {
              userName = userProfile.name || 'Unknown User';
              userAvatar = userProfile.profile_photo_url;
            } else {
              // Try automation_users if not found in user_profiles
              const { data: automationUser } = await supabase
                .from('automation_users')
                .select('name, profile_photo_url')
                .eq('user_id', comment.author_id)
                .single();
              
              if (automationUser) {
                userName = automationUser.name || 'Unknown User';
                userAvatar = automationUser.profile_photo_url;
              }
            }

            return {
              ...comment,
              user_name: userName,
              user_avatar: userAvatar
            };
          })
        );

        setComments(commentsWithUserInfo);
      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/community');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, user]);

  const handleLike = async () => {
    if (!post || !user) return;
    
    try {
      if (post.user_has_liked) {
        // Unlike the post
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        setPost(prev => prev ? {
          ...prev,
          user_has_liked: false,
          like_count: prev.like_count - 1
        } : null);
      } else {
        // Like the post
        await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });
        
        setPost(prev => prev ? {
          ...prev,
          user_has_liked: true,
          like_count: prev.like_count + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async () => {
    if (!post || !newComment.trim() || !user) return;
    
    try {
      const { data: newCommentData, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          author_id: user.id,
          text: newComment.trim()
        })
        .select('*')
        .single();

      if (error) throw error;

      if (newCommentData) {
        setComments(prev => [newCommentData, ...prev]);
        setPost(prev => prev ? {
          ...prev,
          comment_count: prev.comment_count + 1
        } : null);
      }
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
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
                  <AvatarImage src={post.author_avatar || undefined} />
                  <AvatarFallback>{post.author_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h4 className="font-semibold text-stone">{post.author_name || 'Unknown User'}</h4>
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
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
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
                    <AvatarImage src={comment.user_avatar || undefined} />
                    <AvatarFallback>{comment.user_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm text-stone">{comment.user_name || 'Unknown User'}</span>
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
