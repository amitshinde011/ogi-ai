
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useR2Upload } from '@/hooks/useR2Upload';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (imageUrl: string, caption: string, category?: string) => Promise<boolean>;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onCreatePost
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { uploadToR2, uploading } = useR2Upload();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;

    setIsSubmitting(true);
    try {
      // Upload image to R2
      const uploadResult = await uploadToR2(selectedImage, 'community');
      if (!uploadResult) {
        setIsSubmitting(false);
        return;
      }

      // Create post
      const success = await onCreatePost(
        uploadResult.imageUrl, 
        caption.trim(),
        category.trim() || undefined
      );

      if (success) {
        // Reset form and close modal
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setCaption('');
    setCategory('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-sage rounded-lg cursor-pointer hover:bg-sage/5 transition-colors">
              <Plus size={48} strokeWidth={1.5} className="text-sage mb-2" />
              <span className="text-sage font-medium">Tap to select photo</span>
              <span className="text-sm text-gray-500 mt-1">or take a new one</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                capture="environment"
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Selected"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white/90"
              >
                <X size={18} strokeWidth={1.5} />
              </Button>
            </div>
          )}

          {/* Caption and Category */}
          {imagePreview && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption
                </label>
                <Textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="min-h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (optional)
                </label>
                <Input
                  placeholder="e.g., fitness, recipe, motivation..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          {imagePreview && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || uploading}
              className="w-full bg-sage hover:bg-sage/90"
            >
              {isSubmitting || uploading ? 'Creating Post...' : 'Share Post'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
