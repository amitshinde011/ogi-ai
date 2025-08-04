import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, RefreshCw } from 'lucide-react';
import { useOptimizedCommunityFeed, useCreatePost, useToggleLike } from '@/hooks/useOptimizedData';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostModal } from '@/components/community/CreatePostModal';

export const OptimizedCommunityContent = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 10;
  
  const { 
    data: posts = [], 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useOptimizedCommunityFeed(limit, page * limit);
  
  const createPostMutation = useCreatePost();
  const toggleLikeMutation = useToggleLike();

  const handleCreatePost = async (imageUrl: string, caption: string, category?: string): Promise<boolean> => {
    try {
      const postData = { imageUrl, caption, category };
      await createPostMutation.mutateAsync(postData);
      setIsCreateModalOpen(false);
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      return false;
    }
  };

  const handleToggleLike = async (postId: number) => {
    try {
      await toggleLikeMutation.mutateAsync(postId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  if (isLoading && page === 0) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
        
        {/* Post skeletons */}
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-64 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">Failed to load community posts.</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Post Button */}
      <Card className="border-0 shadow-md bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Community</h1>
              <p className="text-muted-foreground">Connect with fellow wellness enthusiasts</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={isFetching}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No posts yet. Be the first to share!</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleToggleLike(post.id)}
              onDeletePost={(postId) => console.log('Delete post:', postId)}
              onUpdatePost={(updatedPost) => console.log('Update post:', updatedPost)}
            />
          ))}
          
          {/* Load More Button */}
          {posts.length >= limit && (
            <div className="text-center">
              <Button 
                onClick={handleLoadMore}
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Posts'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePost={handleCreatePost}
      />
    </div>
  );
};