
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
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
          .single();

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
      const { data: posts, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each post
      const postsWithUserInfo = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('name, profile_photo_url')
            .eq('user_id', post.user_id)
            .single();

          return {
            ...post,
            user_name: profile?.name || 'User',
            user_avatar: profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`
          };
        })
      );

      setPosts(postsWithUserInfo);
    } catch (error) {
      console.error('Error fetching posts:', error);
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
        {/* Create Post Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full rounded-xl bg-sage hover:bg-sage/90 text-white">
              <Plus size={16} className="mr-2" />
              Share Your Journey
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card-gray border border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-dark-text">Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500"
              />
              <Textarea
                placeholder="Share your wellness journey..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 min-h-24"
              />
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 rounded-xl border-gray-300 text-dark-text hover:bg-gray-100 bg-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  className="flex-1 rounded-xl bg-sage hover:bg-sage/90 text-white"
                >
                  Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Posts */}
        {posts.length === 0 ? (
          <Card className="bg-card-gray border border-gray-200">
            <CardContent className="p-6 text-center">
              <p className="text-dark-text">No posts yet. Be the first to share your wellness journey!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="bg-card-gray border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={post.user_avatar}
                      alt={post.user_name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-semibold text-dark-text">{post.user_name}</h4>
                      <p className="text-sm text-dark-text opacity-70">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {currentUser?.id === post.user_id && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPost(post)}
                        className="text-dark-text hover:bg-gray-100"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-dark-text mb-2">{post.title}</h3>
                <p className="text-dark-text mb-4">{post.content}</p>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full rounded-lg mb-4"
                  />
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-dark-text hover:text-red-500">
                      <Heart size={16} className="mr-1" />
                      <span className="text-sm">{post.likes_count}</span>
                    </button>
                    <button className="flex items-center text-dark-text hover:text-blue-500">
                      <MessageCircle size={16} className="mr-1" />
                      <span className="text-sm">{post.comments_count}</span>
                    </button>
                  </div>
                  <button className="flex items-center text-dark-text hover:text-green-500">
                    <Share2 size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Edit Post Dialog */}
        {editingPost && (
          <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
            <DialogContent className="bg-card-gray border border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-dark-text">Edit Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Post title..."
                  value={editingPost.title}
                  onChange={(e) => setEditingPost(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500"
                />
                <Textarea
                  placeholder="Share your wellness journey..."
                  value={editingPost.content}
                  onChange={(e) => setEditingPost(prev => prev ? { ...prev, content: e.target.value } : null)}
                  className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 min-h-24"
                />
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditingPost(null)}
                    className="flex-1 rounded-xl border-gray-300 text-dark-text hover:bg-gray-100 bg-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditPost}
                    className="flex-1 rounded-xl bg-sage hover:bg-sage/90 text-white"
                  >
                    Update
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default Community;
