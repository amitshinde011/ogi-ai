
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Layout from '@/components/Layout';
import Loader from '@/components/ui/loader';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { RefreshSpinner } from '@/components/community/RefreshSpinner';
import { useOptimizedCommunityFeed, CommunityPost } from '@/hooks/useOptimizedCommunityFeed';
import { useAuth } from '@/contexts/AuthContext';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { useUserProgram } from '@/hooks/useUserProgram';

const Community = () => {
  const { 
    posts, 
    loading,
    loadingMore,
    hasMore,
    currentUser,
    createPost, 
    toggleLike,
    refreshPosts,
    loadMore
  } = useOptimizedCommunityFeed();
  
  const { user, isAuthenticated } = useAuth();
  const { isCompleted } = useProgramCompletion();
  const { data: userProgram } = useUserProgram();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Pull-to-refresh functionality
  const {
    containerRef,
    isRefreshing,
    pullDistance,
    isVisible,
    threshold
  } = usePullToRefresh({
    onRefresh: async () => {
      await refreshPosts();
    },
    enabled: isAuthenticated
  });

  const handleCreatePost = async (imageUrl: string, caption: string, category?: string) => {
    const success = await createPost(imageUrl, caption, category);
    if (success) {
      setShowCreateModal(false);
    }
    return success;
  };

  const handleDeletePost = (postId: number) => {
    // Remove from local state - optimistic update
    // Real deletion will be handled by real-time updates
  };

  const handleUpdatePost = (updatedPost: CommunityPost) => {
    // Updates will be handled by real-time updates
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

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
    <Layout containerVariant="wide">
      <Header title="Community" />
      
      <div 
        ref={containerRef}
        className="relative py-4 sm:py-6"
      >
        {/* Pull-to-Refresh Spinner */}
        <RefreshSpinner
          isVisible={isVisible}
          pullDistance={pullDistance}
          isRefreshing={isRefreshing}
          threshold={threshold}
        />

        {/* Create Post Button - only show for users with active subscription */}
        {userProgram && !isCompleted ? (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full mb-6 flex items-center justify-center gap-2 py-3 text-base sm:text-lg"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </Button>
        ) : (
          <div className="w-full mb-6 p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-gray-600 text-sm">
              {isCompleted 
                ? "🎉 Program completed! Start a new journey to create posts again."
                : "📝 Subscribe to a program to start sharing posts with the community!"
              }
            </p>
          </div>
        )}

        {/* Posts Feed */}
        {loading && !isRefreshing ? (
          <div className="flex items-center justify-center py-8">
            <Loader size="lg" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4 text-base sm:text-lg">No posts yet</p>
            <p className="text-sm sm:text-base text-gray-400">
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
                currentUserId={currentUser?.id}
                onDeletePost={handleDeletePost}
                onUpdatePost={handleUpdatePost}
              />
            ))}
            
            {/* Load more spinner */}
            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader size="md" />
              </div>
            )}
            
            {/* End of posts message */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">You've reached the end</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Post Modal - only show if user has active subscription and program not completed */}
      {userProgram && !isCompleted && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreatePost={handleCreatePost}
        />
      )}
    </Layout>
  );
};

export default Community;
