
import React, { useState } from 'react';
import { X, Plus, Salad, Sun, Moon, Apple, Camera, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useR2Upload } from '@/hooks/useR2Upload';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (imageUrl: string, caption: string, mealType?: string) => Promise<boolean>;
  showMealTypeSelection?: boolean;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onCreatePost,
  showMealTypeSelection = false
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { uploadToR2, uploading } = useR2Upload();

  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', icon: Salad },
    { id: 'lunch', name: 'Lunch', icon: Sun },
    { id: 'dinner', name: 'Dinner', icon: Moon },
    { id: 'snack', name: 'Snack', icon: Apple }
  ];

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
        caption, 
        showMealTypeSelection ? selectedMealType : undefined
      );

      if (success) {
        // Reset form and close modal
        setSelectedImage(null);
        setImagePreview(null);
        setCaption('');
        setSelectedMealType('');
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
    setSelectedMealType('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>
            {showMealTypeSelection ? 'Share Your Meal' : 'Create New Post'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          {!imagePreview ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-primary rounded-lg">
              <Plus size={48} strokeWidth={1.5} className="text-primary mb-2" />
              <span className="text-primary font-medium mb-4">Select photo</span>
              
              <div className="flex gap-3">
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Camera size={16} className="mr-2" />
                      Take Photo
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                <label className="cursor-pointer">
                  <Button type="button" variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Image size={16} className="mr-2" />
                      Gallery
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Selected"
                className="w-full max-w-md mx-auto aspect-square object-cover rounded-lg"
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

          {/* Meal Type Selection */}
          {showMealTypeSelection && imagePreview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {mealTypes.map((meal) => {
                  const IconComponent = meal.icon;
                  return (
                    <button
                      key={meal.id}
                      type="button"
                      onClick={() => setSelectedMealType(meal.id)}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center ${
                        selectedMealType === meal.id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-primary'
                      }`}
                    >
                      <IconComponent size={24} className="text-primary mb-1" />
                      <div className="text-sm font-medium">{meal.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Caption */}
          {imagePreview && (
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
          )}

          {/* Submit Button */}
          {imagePreview && (
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                uploading || 
                (showMealTypeSelection && !selectedMealType)
              }
              className="w-full"
            >
              {isSubmitting || uploading ? 'Creating Post...' : 'Share Post'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
