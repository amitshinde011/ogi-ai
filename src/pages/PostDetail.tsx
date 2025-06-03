
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share, ArrowLeft, Send, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Layout from '@/components/Layout';

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  liked?: boolean;
}

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  mealType: string;
  image: string;
  description: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  liked?: boolean;
}

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Load post from localStorage
    const savedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    const foundPost = savedPosts.find((p: Post) => p.id === id);
    
    if (foundPost) {
      // Add some mock comments if none exist
      if (!foundPost.comments || foundPost.comments.length === 0) {
        foundPost.comments = [
          {
            id: '1',
            user: { name: 'Emma Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
            text: 'This looks absolutely delicious! 😍',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            likes: 3
          },
          {
            id: '2',
            user: { name: 'Alex Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
            text: 'Great combination of ingredients! Mind sharing the recipe?',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            likes: 1
          }
        ];
      }
      setPost(foundPost);
    } else {
      // If post not found, redirect to community
      navigate('/community');
    }
  }, [id, navigate]);

  const handleLike = () => {
    if (!post) return;
    
    const updatedPost = {
      ...post,
      liked: !post.liked,
      likes: post.liked ? post.likes - 1 : post.likes + 1
    };
    
    setPost(updatedPost);
    
    // Update in localStorage
    const savedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    const updatedPosts = savedPosts.map((p: Post) => 
      p.id === post.id ? updatedPost : p
    );
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

  const handleCommentLike = (commentId: string) => {
    if (!post) return;
    
    const updatedComments = post.comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          liked: !comment.liked,
          likes: comment.liked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    });
    
    const updatedPost = { ...post, comments: updatedComments };
    setPost(updatedPost);
    
    // Update in localStorage
    const savedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    const updatedPosts = savedPosts.map((p: Post) => 
      p.id === post.id ? updatedPost : p
    );
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

  const handleAddComment = () => {
    if (!post || !newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      user: { 
        name: 'You', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You' 
      },
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    };
    
    const updatedPost = {
      ...post,
      comments: [comment, ...post.comments]
    };
    
    setPost(updatedPost);
    setNewComment('');
    
    // Update in localStorage
    const savedPosts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    const updatedPosts = savedPosts.map((p: Post) => 
      p.id === post.id ? updatedPost : p
    );
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getMealEmoji = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  if (!post) {
    return (
      <Layout>
        <Header title="Post" showBack />
        <div className="text-center py-12 px-4">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Post" showBack />
      
      <div className="max-w-md mx-auto pb-4">
        {/* Post Content */}
        <Card className="mx-4 overflow-hidden animate-fade-in">
          <CardContent className="p-0">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src={post.user.avatar} />
                  <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h4 className="font-semibold text-stone">{post.user.name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="mr-1">{getMealEmoji(post.mealType)}</span>
                    <span className="capitalize mr-2">{post.mealType}</span>
                    <Clock size={12} className="mr-1" />
                    <span>{formatTime(post.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Image */}
            <div className="relative">
              <img
                src={post.image}
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
                    className={`p-2 ${post.liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
                  >
                    <Heart size={20} fill={post.liked ? 'currentColor' : 'none'} />
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
              {post.likes > 0 && (
                <p className="font-semibold text-sm mb-2 text-stone">
                  {post.likes} {post.likes === 1 ? 'like' : 'likes'}
                </p>
              )}

              {/* Description */}
              {post.description && (
                <p className="text-sm text-stone mb-4">
                  <span className="font-semibold mr-2">{post.user.name}</span>
                  {post.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mx-4 mt-4">
          <h3 className="text-lg font-semibold text-stone mb-4">
            Comments ({post.comments.length})
          </h3>

          {/* Add Comment */}
          <div className="flex items-center space-x-3 mb-4 p-4 bg-white rounded-xl border border-sage/20">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
              <AvatarFallback>Y</AvatarFallback>
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

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-white rounded-xl border border-sage/20">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm text-stone">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-stone mb-2">{comment.text}</p>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCommentLike(comment.id)}
                        className={`p-1 text-xs ${comment.liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
                      >
                        <Heart size={14} fill={comment.liked ? 'currentColor' : 'none'} className="mr-1" />
                        {comment.likes > 0 && comment.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 text-xs text-muted-foreground hover:text-primary"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {post.comments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle size={48} className="mx-auto mb-4 text-sage" />
              <p className="text-muted-foreground mb-2">No comments yet</p>
              <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PostDetail;
