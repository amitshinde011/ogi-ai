
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Users, Plus, Clock, Share } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
  comments: any[];
  liked?: boolean;
}

const Community = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user for proper display
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser({
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
          });
        }
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    try {
      // Load posts from localStorage
      const savedPosts = localStorage.getItem('communityPosts');
      let parsedPosts = [];
      
      if (savedPosts) {
        try {
          parsedPosts = JSON.parse(savedPosts);
        } catch (parseError) {
          console.error('Error parsing posts:', parseError);
          parsedPosts = [];
        }
      }
      
      // Ensure parsedPosts is an array
      if (!Array.isArray(parsedPosts)) {
        console.warn('Community posts data is not an array, initializing with empty array');
        parsedPosts = [];
        localStorage.setItem('communityPosts', JSON.stringify([]));
      }

      // Add some mock posts if none exist
      if (parsedPosts.length === 0) {
        const mockPosts = [
          {
            id: '1',
            user: { 
              name: 'Sarah Chen', 
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' 
            },
            mealType: 'breakfast',
            image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400',
            description: 'Healthy avocado toast with poached eggs! Starting the day right 🥑',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: 24,
            comments: []
          },
          {
            id: '2',
            user: { 
              name: 'Mike Johnson', 
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' 
            },
            mealType: 'lunch',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            description: 'Mediterranean salad bowl with quinoa and grilled chicken. Feeling energized!',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            likes: 18,
            comments: []
          }
        ];
        parsedPosts = [...mockPosts];
        localStorage.setItem('communityPosts', JSON.stringify(parsedPosts));
      }

      // Process posts to ensure proper user data
      const processedPosts = parsedPosts.map(post => ({
        ...post,
        user: {
          name: post.user?.name || currentUser?.name || 'Anonymous User',
          avatar: post.user?.avatar || currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
        }
      }));

      setPosts(processedPosts);
    } catch (error) {
      console.error('Error loading community posts:', error);
      setPosts([]);
      localStorage.setItem('communityPosts', JSON.stringify([]));
    }
  }, [currentUser]);

  const handleLike = (postId: string) => {
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.liked;
          return {
            ...post,
            liked: !isLiked,
            likes: isLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      });
      localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
      return updatedPosts;
    });
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

  return (
    <Layout>
      <Header title="Community Feed" />
      
      <div className="space-y-4 max-w-md mx-auto pb-4">
        {location.state?.uploaded && (
          <div className="mx-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="text-green-800 font-medium">🎉 Meal shared successfully!</p>
          </div>
        )}

        {Array.isArray(posts) && posts.length > 0 ? posts.map((post) => (
          <Card key={post.id} className="mx-4 overflow-hidden animate-fade-in bg-white">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar>
                    <AvatarImage src={post.user?.avatar} />
                    <AvatarFallback className="bg-sage text-white">
                      {(post.user?.name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">
                      {post.user?.name || 'Anonymous User'}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600">
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
                      onClick={() => handleLike(post.id)}
                      className={`p-2 ${post.liked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500`}
                    >
                      <Heart size={20} fill={post.liked ? 'currentColor' : 'none'} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="p-2 text-gray-600 hover:text-sage"
                    >
                      <MessageCircle size={20} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-600 hover:text-sage"
                    >
                      <Share size={20} />
                    </Button>
                  </div>
                </div>

                {/* Likes Count */}
                {post.likes > 0 && (
                  <p className="font-semibold text-sm mb-2 text-gray-900">
                    {post.likes} {post.likes === 1 ? 'like' : 'likes'}
                  </p>
                )}

                {/* Description */}
                {post.description && (
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold mr-2">
                      {post.user?.name || 'Anonymous User'}
                    </span>
                    {post.description}
                  </p>
                )}

                {/* Comments Link */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="p-0 h-auto text-gray-500 hover:text-sage mt-2"
                >
                  View all comments
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-sage" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share your meal!</p>
            <Button onClick={() => navigate('/upload')} className="rounded-xl bg-sage hover:bg-sage/90 text-white">
              Upload Your First Meal
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Community;
