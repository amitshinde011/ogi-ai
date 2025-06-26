
import React from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { useCommunity } from '@/hooks/useCommunity';
import CreatePostModal from '@/components/community/CreatePostModal';
import PostCard from '@/components/community/PostCard';

const Community = () => {
  const { posts, loading, currentUser, createPost, deletePost } = useCommunity();

  if (loading) {
    return (
      <Layout>
        <Header title="Community" />
        <div className="flex items-center justify-center min-h-screen bg-light-gray">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Community" />
      
      <div className="p-4 space-y-6 max-w-md mx-auto bg-light-gray min-h-screen">
        <CreatePostModal onSubmit={createPost} />

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No posts yet</p>
              <p className="text-sm text-gray-400">Be the first to share your wellness journey!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                onDelete={deletePost}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Community;
