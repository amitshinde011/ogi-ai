
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newPost: { title: string; content: string };
  onPostChange: (post: { title: string; content: string }) => void;
  onSubmit: () => void;
}

const CreatePostDialog = ({ 
  isOpen, 
  onOpenChange, 
  newPost, 
  onPostChange, 
  onSubmit 
}: CreatePostDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            onChange={(e) => onPostChange({ ...newPost, title: e.target.value })}
            className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500"
          />
          <Textarea
            placeholder="Share your wellness journey..."
            value={newPost.content}
            onChange={(e) => onPostChange({ ...newPost, content: e.target.value })}
            className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 min-h-24"
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border-gray-300 text-dark-text hover:bg-gray-100 bg-white"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-1 rounded-xl bg-sage hover:bg-sage/90 text-white"
            >
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
