
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProfileImageUploadProps {
  selectedImage: string;
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  uploading?: boolean;
  className?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  selectedImage,
  onImageSelect,
  onImageRemove,
  uploading = false,
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
      <Label className="text-dark-text font-medium">Profile Picture</Label>
      <div
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-primary bg-primary/5 transform scale-105' 
            : selectedImage 
              ? 'border-gray-200 bg-gray-50' 
              : 'border-gray-300 hover:border-primary hover:bg-primary/5'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {selectedImage ? (
          <div className="relative">
            <img 
              src={selectedImage} 
              alt="Profile preview" 
              className="w-32 h-32 object-cover mx-auto rounded-2xl shadow-lg border-4 border-white"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onImageRemove();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {isDragOver ? 'Drop your photo here' : 'Upload your profile picture'}
              </p>
              <p className="text-xs text-gray-500">
                Drag & drop or click to browse
              </p>
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Photo
                </div>
              </div>
            </div>
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <p className="text-xs text-gray-500 text-center">
        Recommended: Square image, at least 400x400px
      </p>
    </div>
  );
};

export default ProfileImageUpload;
