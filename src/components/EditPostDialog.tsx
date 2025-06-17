
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface EditPostDialogProps {
  editingPost: Post | null;
  onEditingPostChange: (post: Post | null) => void;
  onSubmit: () => void;
}

const EditPostDialog = ({ editingPost, onEditingPostChange, onSubmit }: EditPostDialogProps) => {
  if (!editingPost) return null;

  return (
    <Dialog open={!!editingPost} onOpenChange={() => onEditingPostChange(null)}>
      <DialogContent className="bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Edit Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Post title..."
            value={editingPost.title}
            onChange={(e) => onEditingPostChange({ ...editingPost, title: e.target.value })}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
          />
          <Textarea
            placeholder="Share your wellness journey..."
            value={editingPost.content}
            onChange={(e) => onEditingPostChange({ ...editingPost, content: e.target.value })}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 min-h-24"
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onEditingPostChange(null)}
              className="flex-1 rounded-xl border-gray-300 text-gray-900 hover:bg-gray-100 bg-white"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-1 rounded-xl bg-sage hover:bg-sage/90 text-white"
            >
              Update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;
