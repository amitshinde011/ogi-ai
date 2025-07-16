import React from 'react';
import { useMyPosts } from '@/hooks/useMyPosts';
import { PostCard } from '@/components/community/PostCard';
import { RefreshSpinner } from '@/components/community/RefreshSpinner';
import Header from '@/components/Header';
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
      <div className="min-h-screen bg-background">
        <Header title="My Posts" showBack />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Loading your posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" ref={containerRef}>
      <Header title="My Posts" showBack />
      <RefreshSpinner 
        isVisible={isVisible}
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        threshold={threshold}
      />
      
      <div className="max-w-md mx-auto px-4 pb-20">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground text-sm max-w-64">
              You haven't shared any posts yet. Start sharing your journey with the community!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
    </div>
  );
};

export default MyPosts;