
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import PostCard from '@/components/social/PostCard';
import { useSocialPosts } from '@/hooks/useSocialPosts';

const Discover = () => {
  const { 
    posts, 
    loading, 
    currentUser, 
    toggleLike, 
    fetchDiscoverFeed 
  } = useSocialPosts();

  useEffect(() => {
    fetchDiscoverFeed();
  }, []);

  const handleComment = (postId: string) => {
    // TODO: Navigate to post detail page or open comments modal
    console.log('Comment on post:', postId);
  };

  return (
    <Layout>
      <Header title="Discover" />
      
      <div className="p-4 max-w-md mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No posts to discover yet</p>
            <p className="text-sm text-gray-400">
              Be the first to share something amazing!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {posts.map((post) => (
              <div key={post.id} className="aspect-square">
                <img 
                  src={post.image_url} 
                  alt="Post" 
                  className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleComment(post.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Discover;
