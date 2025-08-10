
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useR2Upload } from '@/hooks/useR2Upload';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileFormData {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  health_issues: string;
  physical_activity_basic: number;
  physical_activity_medium: number;
  physical_activity_intense: number;
}

export const useProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { uploadToR2, uploading } = useR2Upload();
  const { user } = useAuth();

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    health_issues: '',
    physical_activity_basic: 3,
    physical_activity_medium: 3,
    physical_activity_intense: 3
  });

  // Removed automatic redirect logic - let Index.tsx handle all routing

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name || !formData.age || !formData.gender || !formData.weight || !formData.height) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (!user) throw new Error('No authenticated user');

      let profilePhotoUrl = null;
      if (selectedImage) {
        const uploadResult = await uploadToR2(selectedImage, 'community');
        if (!uploadResult) {
          setLoading(false);
          return; // Upload failed, error already shown
        }
        profilePhotoUrl = uploadResult.imageUrl;
      }

      // Convert numeric activity levels to strings for database compatibility
      const getActivityString = (value: number) => {
        const mapping = {
          1: 'never',
          2: 'rarely',
          3: 'sometimes',
          4: 'often',
          5: 'always'
        };
        return mapping[value as keyof typeof mapping] || 'sometimes';
      };

      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          health_issues: formData.health_issues,
          profile_photo_url: profilePhotoUrl,
          physical_activity_basic: getActivityString(formData.physical_activity_basic),
          physical_activity_medium: getActivityString(formData.physical_activity_medium),
          physical_activity_intense: getActivityString(formData.physical_activity_intense)
        });

      if (error) throw error;

      // Update onboarding state
      await updateOnboardingState({ profile_completed: true });

      toast({
        title: "Profile created",
        description: "Your profile has been successfully created.",
      });

      navigate('/intro-video');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    selectedImage,
    imagePreview,
    loading,
    uploading,
    handleImageSelect,
    handleImageRemove,
    handleSubmit
  };
};
