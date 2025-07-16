import React from 'react';
import { useMyPosts } from '@/hooks/useMyPosts';
import { PostCard } from '@/components/community/PostCard';
import { RefreshSpinner } from '@/components/community/RefreshSpinner';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/Layout/PageContainer';
import Header from '@/components/Header';
import Loader from '@/components/ui/loader';
import { User } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const MyPosts = () => {
  const { posts, loading, refreshPosts, currentUser, deletePost, updatePost } = useMyPosts();

  const { isRefreshing, pullDistance, isVisible, threshold, containerRef } = usePullToRefresh({
    onRefresh: async () => {
      refreshPosts();
    }
  });

  if (loading) {
    return (
      <Layout noContainer>
        <PageContainer>
          <Header title="My Posts" showBack />
          <div className="py-4">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader size="lg" className="mx-auto mb-4" />
                <p className="text-gray-600">Loading your posts...</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout noContainer>
      <PageContainer>
        <Header title="My Posts" showBack />
        
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

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-gray-500 mb-4 text-base sm:text-lg">No posts yet</p>
              <p className="text-sm sm:text-base text-gray-400 max-w-64 mx-auto">
                You haven't shared any posts yet. Start sharing your journey with the community!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser?.id}
                  onLike={() => {}} // My posts don't need like functionality
                  onDeletePost={deletePost}
                  onUpdatePost={updatePost}
                />
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </Layout>
  );
};

export default MyPosts;