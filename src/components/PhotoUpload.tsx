
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Image } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';

interface PhotoUploadProps {
  selectedImage: string;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  uploading?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  selectedImage,
  onImageSelect,
  onImageRemove,
  uploading = false,
  title = "Full Body Photo",
  description = "Upload your current photo",
  className = ""
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-dark-text font-medium">{title} (Optional)</Label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : selectedImage 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {selectedImage ? (
          <div className="relative animate-fade-in">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="w-40 h-56 object-cover mx-auto rounded-xl shadow-lg border-2 border-white"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0 shadow-lg hover:scale-110 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                onImageRemove();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm font-medium text-green-700">Photo ready!</p>
              <p className="text-xs text-green-600">Click to change</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <Image className="w-10 h-10 text-blue-500" />
            </div>
            <div className="space-y-3">
              <p className="text-lg font-medium text-gray-700">
                {isDragOver ? 'Drop your photo here!' : description}
              </p>
              <p className="text-sm text-gray-500">
                Drag & drop or click to browse
              </p>
              <div className="flex gap-3 justify-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photo-camera-upload"
                />
                <label htmlFor="photo-camera-upload">
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
                  id="photo-gallery-upload"
                />
                <label htmlFor="photo-gallery-upload">
                  <Button type="button" variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose from Gallery
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-center space-y-3 animate-pulse">
              <Loader size="lg" />
              <div className="space-y-1">
                <p className="text-lg font-medium text-blue-600">Uploading...</p>
                <p className="text-sm text-gray-600">Please wait</p>
              </div>
            </div>
          </div>
        )}
        
      </div>
      <p className="text-xs text-gray-500 text-center">
        For best results, use good lighting and stand against a plain background
      </p>
    </div>
  );
};

export default PhotoUpload;
