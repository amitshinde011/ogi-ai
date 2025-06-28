
import React, { useState } from 'react';
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
import { CommunityPost } from '@/hooks/useCommunityFeed';
import { CommentSection } from './CommentSection';
import { PostHeader } from './PostHeader';
import { PostActions } from './PostActions';
import { PostEditForm } from './PostEditForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PostCardProps {
  post: CommunityPost;
  onLike: (postId: number) => void;
  currentUserId?: string;
  onDeletePost: (postId: number) => void;
  onUpdatePost: (updatedPost: CommunityPost) => void;
}

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
        <PostHeader
          authorId={post.author_id}
          authorName={post.author?.name}
          profilePhotoUrl={post.author?.profile_photo_url}
          createdAt={post.created_at}
          isOwner={isOwner}
          onEdit={handleEdit}
          onDelete={() => {
            setShowDeleteConfirm(true);
            setShowPopover(false);
          }}
          showPopover={showPopover}
          setShowPopover={setShowPopover}
        />

        <div className="aspect-square">
          <img 
            src={post.image_url} 
            alt="Post content" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4">
          <PostActions
            isLiked={post.is_liked}
            likeCount={post.like_count}
            onLike={() => onLike(post.id)}
            onToggleComments={() => setShowComments(!showComments)}
          />

          {isEditing ? (
            <PostEditForm
              caption={editCaption}
              category={editCategory}
              onCaptionChange={setEditCaption}
              onCategoryChange={setEditCategory}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
              isSubmitting={isSubmitting}
            />
          ) : (
            post.caption && (
              <p className="text-sm mb-2">
                <span className="font-semibold">{post.author?.name || 'Anonymous User'}</span>{' '}
                {post.caption}
              </p>
            )
          )}

          {post.comment_count > 0 && (
            <button 
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-gray-500 hover:underline mb-2"
            >
              View all {post.comment_count} comments
            </button>
          )}

          {showComments && (
            <CommentSection postId={post.id} currentUserId={currentUserId} />
          )}
        </div>
      </div>

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
