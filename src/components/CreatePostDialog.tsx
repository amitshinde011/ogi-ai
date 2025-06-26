
import React, { useState } from 'react';
import { Plus, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newPost: { title: string; content: string };
  onPostChange: (post: { title: string; content: string }) => void;
  onSubmit: (imageFile?: File) => void;
}

const CreatePostDialog = ({ 
  isOpen, 
  onOpenChange, 
  newPost, 
  onPostChange, 
  onSubmit 
}: CreatePostDialogProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = () => {
    onSubmit(imageFile || undefined);
    // Reset form
    setImageFile(null);
    setImagePreview(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setImageFile(null);
    setImagePreview(null);
  };

  const handleButtonClick = () => {
    console.log('Share Your Journey button clicked');
    onOpenChange(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          onClick={handleButtonClick}
          className="w-full rounded-xl bg-sage hover:bg-sage/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Share Your Journey
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Create New Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Post title..."
            value={newPost.title}
            onChange={(e) => onPostChange({ ...newPost, title: e.target.value })}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
          />
          <Textarea
            placeholder="Share your wellness journey..."
            value={newPost.content}
            onChange={(e) => onPostChange({ ...newPost, content: e.target.value })}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 min-h-24"
          />
          
          {/* Image Upload Section */}
          <div className="space-y-3">
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera className="text-gray-400 mb-2 w-6 h-6" />
                <span className="text-gray-500 text-sm">Add a photo (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  onClick={handleRemoveImage}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 rounded-xl border-gray-300 text-gray-900 hover:bg-gray-100 bg-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
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
