
import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CommunityPost } from '@/hooks/useCommunityFeed';
import { CommentSection } from './CommentSection';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PostCardProps {
  post: CommunityPost;
  onLike: (postId: number) => void;
  currentUserId?: string;
  onDeletePost: (postId: number) => void;
  onUpdatePost: (updatedPost: CommunityPost) => void;
}

const categories = [
  'general',
  'nutrition',
  'exercise',
  'meditation',
  'progress',
  'recipe',
  'motivation'
];

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  currentUserId,
  onDeletePost,
  onUpdatePost
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [editCategory, setEditCategory] = useState(post.category || 'general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = currentUserId === post.author_id;

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const getAvatarUrl = (authorId: string, profileUrl?: string | null) => {
    return profileUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditCaption(post.caption || '');
    setEditCategory(post.category || 'general');
    setShowPopover(false);
  };

  const handleSaveEdit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('posts')
        .update({
          caption: editCaption.trim() || null,
          category: editCategory || null
        })
        .eq('id', post.id);

      if (error) throw error;

      const updatedPost = {
        ...post,
        caption: editCaption.trim() || null,
        category: editCategory || null
      };

      onUpdatePost(updatedPost);
      setIsEditing(false);
      toast({ title: "Post updated successfully!" });
    } catch (error) {
      console.error('Error updating post:', error);
      toast({ 
        title: "Failed to update post", 
        description: "Please try again.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditCaption(post.caption || '');
    setEditCategory(post.category || 'general');
  };

  const handleDeletePost = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      onDeletePost(post.id);
      setShowDeleteConfirm(false);
      toast({ title: "Post deleted successfully!" });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ 
        title: "Failed to delete post", 
        variant: "destructive" 
      });
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={getAvatarUrl(post.author_id, post.author?.profile_photo_url)}
                alt={post.author?.name || 'User'}
              />
              <AvatarFallback>
                {(post.author?.name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {post.author?.name || 'Anonymous User'}
              </p>
              <p className="text-xs text-gray-500">{formatTime(post.created_at)}</p>
            </div>
          </div>
          
          {isOwner && (
            <Popover open={showPopover} onOpenChange={setShowPopover}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="ghost"
                    onClick={handleEdit}
                    className="flex items-center justify-start space-x-3 h-10 px-3"
                  >
                    <Pencil size={16} />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDeleteConfirm(true);
                      setShowPopover(false);
                    }}
                    className="flex items-center justify-start space-x-3 h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Image */}
        <div className="aspect-square">
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Actions and Content */}
        <div className="p-4">
          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={`p-0 h-auto hover:bg-transparent ${
                post.is_liked ? 'text-red-500' : 'text-gray-700'
              }`}
            >
              <Heart 
                size={24}
                strokeWidth={1.5}
                className={post.is_liked ? 'fill-current' : ''} 
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="p-0 h-auto hover:bg-transparent text-gray-700"
            >
              <MessageCircle size={24} strokeWidth={1.5} />
            </Button>
          </div>

          {/* Like Count */}
          {post.like_count > 0 && (
            <p className="text-sm font-semibold mb-2">
              {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
            </p>
          )}

          {/* Caption - Inline Edit or Display */}
          {isEditing ? (
            <div className="space-y-3 mb-3">
              <Textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                placeholder="What's on your mind?"
                rows={3}
                className="resize-none"
                disabled={isSubmitting}
              />
              <div className="flex items-center space-x-2">
                <Select value={editCategory} onValueChange={setEditCategory} disabled={isSubmitting}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isSubmitting}
                  className="bg-sage hover:bg-sage/90"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            post.caption && (
              <p className="text-sm mb-2">
                <span className="font-semibold">{post.author?.name || 'Anonymous User'}</span>{' '}
                {post.caption}
              </p>
            )
          )}

          {/* Comment Count */}
          {post.comment_count > 0 && (
            <button 
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-gray-500 hover:underline mb-2"
            >
              View all {post.comment_count} comments
            </button>
          )}

          {/* Comments Section */}
          {showComments && (
            <CommentSection postId={post.id} currentUserId={currentUserId} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
