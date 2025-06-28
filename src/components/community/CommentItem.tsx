
import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Comment } from '@/hooks/useComments';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onDelete: (commentId: number) => void;
  onUpdate: (commentId: number, newText: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onDelete,
  onUpdate
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = currentUserId === comment.author_id;

  const getAvatarUrl = (authorId: string, profileUrl?: string | null) => {
    return profileUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorId}`;
  };

  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(comment.text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('comments')
        .update({ text: editText.trim() })
        .eq('id', comment.id);

      if (error) throw error;

      onUpdate(comment.id, editText.trim());
      setIsEditing(false);
      toast({ title: "Comment updated successfully!" });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({ 
        title: "Failed to update comment", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(comment.text);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id);

      if (error) throw error;

      onDelete(comment.id);
      toast({ title: "Comment deleted successfully!" });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({ 
        title: "Failed to delete comment", 
        variant: "destructive" 
      });
    }
  };

  return (
    <>
      <div
        className="flex items-start space-x-2 group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Avatar className="w-6 h-6">
          <AvatarImage 
            src={getAvatarUrl(comment.author_id, comment.author?.profile_photo_url)}
            alt={comment.author?.name || 'User'}
          />
          <AvatarFallback>
            {(comment.author?.name || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="text-sm resize-none"
                rows={2}
                disabled={isSubmitting}
              />
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editText.trim() || isSubmitting}
                  className="h-7 px-2 text-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="h-7 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">
                    {comment.author?.name || 'Anonymous User'}
                  </span>{' '}
                  {comment.text}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(comment.created_at)}
                </p>
              </div>
              
              {isOwner && (isHovering || window.innerWidth <= 768) && (
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <Pencil size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
