
import React, { useState } from 'react';
import { Plus, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CreatePostModalProps {
  onSubmit: (content: string, imageFile?: File) => Promise<boolean>;
}

const CreatePostModal = ({ onSubmit }: CreatePostModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    const success = await onSubmit(content, imageFile || undefined);
    
    if (success) {
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setIsOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setContent('');
    setImageFile(null);
    setImagePreview(null);
  };

  const addMealPrefix = (mealType: string) => {
    const prefix = `${mealType} `;
    if (!content.startsWith(prefix)) {
      setContent(prefix + content);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => setIsOpen(true)}
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
          {/* Meal Type Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addMealPrefix('Breakfast')}
              className="text-xs"
            >
              🌅 Breakfast
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addMealPrefix('Lunch')}
              className="text-xs"
            >
              ☀️ Lunch
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addMealPrefix('Dinner')}
              className="text-xs"
            >
              🌙 Dinner
            </Button>
          </div>

          <Textarea
            placeholder="Share your wellness journey..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 rounded-xl bg-sage hover:bg-sage/90 text-white"
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
