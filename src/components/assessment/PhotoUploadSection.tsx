
import React, { useState } from 'react';
import { Camera, X, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoUploadSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

const PhotoUploadSection = ({ formData, setFormData }: PhotoUploadSectionProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setImagePreview(preview);
      setFormData((prev: any) => ({ ...prev, full_body_photo_url: preview }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview('');
    setFormData((prev: any) => ({ ...prev, full_body_photo_url: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Body Photo (Optional)
        </label>
        <p className="text-xs text-gray-600 mb-4">
          Take a photo to track your transformation journey
        </p>
        
        {!imagePreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Upload a full body photo</p>
            
            <div className="flex gap-3 justify-center">
              <input
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="hidden"
                id="photo-camera"
              />
              <label htmlFor="photo-camera">
                <Button type="button" variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </span>
                </Button>
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-gallery"
              />
              <label htmlFor="photo-gallery">
                <Button type="button" variant="outline" className="cursor-pointer" asChild>
                  <span>
                    <Image className="w-4 h-4 mr-2" />
                    Choose from Gallery
                  </span>
                </Button>
              </label>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleImageRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploadSection;
