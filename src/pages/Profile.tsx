
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/Layout/PageContainer';
import Loader from '@/components/ui/loader';
import Header from '@/components/Header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { useFollowers } from '@/hooks/useFollowers';

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser } = useSocialPosts();
  const {
    profileUser,
    userPosts,
    followerCount,
    followingCount,
    isFollowing,
    loading,
    fetchUserProfile,
    toggleFollow
  } = useFollowers();

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId]);

  if (loading) {
    return (
      <Layout>
        <Header title="Profile" showBack />
        <div className="flex items-center justify-center py-8">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  if (!profileUser) {
    return (
      <Layout>
        <Header title="Profile" showBack />
        <div className="text-center py-12">
          <p className="text-gray-500">User not found</p>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <Layout noContainer>
      <PageContainer>
        <Header title={profileUser.name || 'Profile'} showBack />
        
      <div className="py-4">
        {/* Profile Header */}
        <div className="text-center mb-6">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage 
              src={profileUser.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.id}`} 
              alt={profileUser.name || 'User'} 
            />
            <AvatarFallback>
              {(profileUser.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-xl font-bold mb-2">{profileUser.name || 'Anonymous User'}</h1>
          
          <div className="flex justify-center space-x-8 mb-4">
            <div className="text-center">
              <div className="font-bold">{userPosts.length}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{followerCount}</div>
              <div className="text-sm text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{followingCount}</div>
              <div className="text-sm text-gray-500">Following</div>
            </div>
          </div>

          {!isOwnProfile && (
            <Button
              onClick={() => toggleFollow(profileUser.id)}
              className={`${
                isFollowing 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : ''
              }`}
              variant={isFollowing ? 'secondary' : 'default'}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-1">
          {userPosts.map((post) => (
            <div key={post.id} className="aspect-square">
              <img 
                src={post.image_url} 
                alt="Post" 
                className="w-full h-full object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
              />
            </div>
          ))}
        </div>

        {userPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts yet</p>
          </div>
        )}
        </div>
      </PageContainer>
    </Layout>
  );
};

export default Profile;
