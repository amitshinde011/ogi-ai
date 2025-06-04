
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import PostCard from '@/components/PostCard';
import CreatePostDialog from '@/components/CreatePostDialog';
import EditPostDialog from '@/components/EditPostDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

const Community = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setCurrentUser({
          id: user.id,
          name: profile?.name || user.email?.split('@')[0] || 'User',
          avatar: profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      console.log('Fetching community posts...');
      const { data: posts, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      console.log('Fetched posts:', posts);

      // Fetch user profiles for each post
      const postsWithUserInfo = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('name, profile_photo_url')
            .eq('user_id', post.user_id)
            .maybeSingle();

          const { data: { user } } = await supabase.auth.getUser();
          const fallbackName = user?.email?.split('@')[0] || 'User';

          return {
            ...post,
            user_name: profile?.name || fallbackName,
            user_avatar: profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`
          };
        })
      );

      console.log('Posts with user info:', postsWithUserInfo);
      setPosts(postsWithUserInfo);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!currentUser || !newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: currentUser.id,
          title: newPost.title,
          content: newPost.content
        });

      if (error) throw error;

      setNewPost({ title: '', content: '' });
      setIsDialogOpen(false);
      fetchPosts();
      toast({ title: "Post created successfully!" });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ title: "Failed to create post", variant: "destructive" });
    }
  };

  const handleEditPost = async () => {
    if (!editingPost || !editingPost.title.trim() || !editingPost.content.trim()) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .update({
          title: editingPost.title,
          content: editingPost.content
        })
        .eq('id', editingPost.id);

      if (error) throw error;

      setEditingPost(null);
      fetchPosts();
      toast({ title: "Post updated successfully!" });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({ title: "Failed to update post", variant: "destructive" });
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      fetchPosts();
      toast({ title: "Post deleted successfully!" });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: "Failed to delete post", variant: "destructive" });
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
          newPost={newPost}
          onPostChange={setNewPost}
          onSubmit={handleCreatePost}
        />

        {posts.length === 0 ? (
          <Card className="bg-card-gray border border-gray-200">
            <CardContent className="p-6 text-center">
              <p className="text-dark-text">No posts yet. Be the first to share your wellness journey!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              onEdit={setEditingPost}
              onDelete={handleDeletePost}
              onPostUpdate={fetchPosts}
            />
          ))
        )}

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
