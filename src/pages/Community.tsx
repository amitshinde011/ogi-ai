
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { RefreshSpinner } from '@/components/community/RefreshSpinner';
import { useCommunityFeed, CommunityPost } from '@/hooks/useCommunityFeed';
import { useAuth } from '@/hooks/useAuth';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const Community = () => {
  const { 
    posts, 
    loading, 
    createPost, 
    toggleLike,
    refreshPosts
  } = useCommunityFeed();
  
  const { user, isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>([]);

  // Keep local posts in sync with the hook's posts
  React.useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Pull-to-refresh functionality
  const {
    containerRef,
    isRefreshing,
    pullDistance,
    isVisible,
    threshold
  } = usePullToRefresh({
    onRefresh: refreshPosts,
    enabled: isAuthenticated
  });

  const handleCreatePost = async (imageUrl: string, caption: string, category?: string) => {
    const success = await createPost(imageUrl, caption, category);
    if (success) {
      setShowCreateModal(false);
      refreshPosts();
    }
    return success;
  };

  const handleDeletePost = (postId: number) => {
    setLocalPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handleUpdatePost = (updatedPost: CommunityPost) => {
    setLocalPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
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
      
      <div 
        ref={containerRef}
        className="relative p-4 sm:p-6 max-w-2xl mx-auto"
      >
        {/* Pull-to-Refresh Spinner */}
        <RefreshSpinner
          isVisible={isVisible}
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          threshold={threshold}
        />

        {/* Create Post Button */}
        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-full mb-6 bg-sage hover:bg-sage/90 flex items-center justify-center gap-2 py-3 text-base sm:text-lg"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </Button>

        {/* Posts Feed */}
        {loading && !isRefreshing ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
          </div>
        ) : localPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4 text-base sm:text-lg">No posts yet</p>
            <p className="text-sm sm:text-base text-gray-400">
              Be the first to share something with the community!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {localPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={toggleLike}
                currentUserId={user.id}
                onDeletePost={handleDeletePost}
                onUpdatePost={handleUpdatePost}
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
