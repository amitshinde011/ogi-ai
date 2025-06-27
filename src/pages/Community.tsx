
import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/social/PostCard';
import CreatePostModal from '@/components/social/CreatePostModal';
import { useSocialPosts } from '@/hooks/useSocialPosts';

const Community = () => {
  const navigate = useNavigate();
  const { 
    posts, 
    loading, 
    currentUser, 
    createPost, 
    toggleLike, 
    fetchDiscoverFeed 
  } = useSocialPosts();
  
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Fetch all posts for the community page
    fetchDiscoverFeed();
  }, []);

  const handleCreatePost = async (imageUrl: string, caption: string) => {
    const success = await createPost(imageUrl, caption);
    if (success) {
      fetchDiscoverFeed(); // Refresh all posts
    }
    return success;
  };

  const handleComment = (postId: string) => {
    // Navigate to post detail page
    navigate(`/post/${postId}`);
  };

  if (!currentUser) {
    return (
      <Layout>
        <Header title="Community" />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please log in to view the community feed</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Community" />
      
      <div className="p-4 max-w-md mx-auto">
        {/* Create Post Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-full mb-6 bg-sage hover:bg-sage/90 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </Button>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No posts yet</p>
            <p className="text-sm text-gray-400">
              Be the first to share something with the community!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={toggleLike}
                onComment={handleComment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePost={handleCreatePost}
        showMealTypeSelection={false}
      />
    </Layout>
  );
};

export default Community;
