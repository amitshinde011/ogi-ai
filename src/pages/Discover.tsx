
import React from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';

const Discover = () => {
  const { posts, loading } = useCommunityFeed();

  return (
    <Layout>
      <Header title="Discover" showBack />
      
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
