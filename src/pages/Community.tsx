import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import PostList from '@/components/PostList';
import CreatePostDialog from '@/components/CreatePostDialog';
import EditPostDialog from '@/components/EditPostDialog';
import { supabase } from '@/integrations/supabase/client';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

const Community = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [content, setContent] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { posts, loading, fetchPosts, createPost, updatePost, deletePost } = useCommunityPosts();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Set up real-time subscription for new posts
  useEffect(() => {
    const channel = supabase
      .channel('community-posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts'
        },
        () => {
          // Refetch posts when a new post is added
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'community_posts'
        },
        () => {
          // Refetch posts when a post is deleted
          fetchPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_posts'
        },
        () => {
          // Refetch posts when a post is updated
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user profile information
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, profile_photo_url')
          .eq('user_id', user.id)
          .maybeSingle();

        const displayName = profile?.name || user.email?.split('@')[0] || 'User';
        const displayAvatar = profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

        setCurrentUser({
          id: user.id,
          name: displayName,
          avatar: displayAvatar
        });

        console.log('Current user set:', { id: user.id, name: displayName, avatar: displayAvatar });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleCreatePost = async (imageFile?: File) => {
    const success = await createPost(currentUser, content, imageFile);
    if (success) {
      setContent('');
      setIsDialogOpen(false);
    }
  };

  const handleEditPost = async () => {
    if (!editingPost) return;
    const success = await updatePost(editingPost);
    if (success) {
      setEditingPost(null);
    }
  };

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
        <CreatePostDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          content={content}
          onContentChange={setContent}
          onSubmit={handleCreatePost}
        />

        <PostList
          posts={posts}
          currentUserId={currentUser?.id}
          onEdit={setEditingPost}
          onDelete={deletePost}
          onPostUpdate={fetchPosts}
        />

        <EditPostDialog
          editingPost={editingPost}
          onEditingPostChange={setEditingPost}
          onSubmit={handleEditPost}
        />
      </div>
    </Layout>
  );
};

export default Community;
