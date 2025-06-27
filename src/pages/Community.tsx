
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';
import { useAuth } from '@/hooks/useAuth';

const Community = () => {
  const { 
    posts, 
    loading, 
    createPost, 
    toggleLike 
  } = useCommunityFeed();
  
  const { user, isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreatePost = async (imageUrl: string, caption: string, category?: string) => {
    const success = await createPost(imageUrl, caption, category);
    if (success) {
      setShowCreateModal(false);
    }
    return success;
  };

  if (!isAuthenticated || !user) {
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
          <div className="space-y-0">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={toggleLike}
                currentUserId={user.id}
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
      />
    </Layout>
  );
};

export default Community;
