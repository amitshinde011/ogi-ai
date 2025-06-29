import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';
import { convertToWebP, needsWebPConversion } from '@/utils/imageConversion';

interface ProfileFormData {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  health_issues: string;
  physical_activity_basic: string;
  physical_activity_medium: string;
  physical_activity_intense: string;
}

export const useProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    health_issues: '',
    physical_activity_basic: 'never',
    physical_activity_medium: 'never',
    physical_activity_intense: 'never'
  });

  useEffect(() => {
    // Check if user is already onboarded, if so, redirect to home
    const checkOnboardingStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        console.log('User profile exists, redirecting to home');
        navigate('/home');
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

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

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let fileToUpload = file;
      
      // Convert to WebP if needed
      if (needsWebPConversion(file)) {
        console.log('Converting profile image to WebP format...');
        try {
          fileToUpload = await convertToWebP(file, 0.85); // Good balance for profile photos
          console.log('Profile image converted to WebP successfully');
        } catch (conversionError) {
          console.warn('WebP conversion failed, uploading original:', conversionError);
          // Continue with original file if conversion fails
        }
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(fileName, fileToUpload);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      let profilePhotoUrl = null;
      if (selectedImage) {
        profilePhotoUrl = await uploadProfileImage(selectedImage);
        if (!profilePhotoUrl) {
          return; // Upload failed, error already shown
        }
      }

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
          physical_activity_basic: formData.physical_activity_basic,
          physical_activity_medium: formData.physical_activity_medium,
          physical_activity_intense: formData.physical_activity_intense
        });

      if (error) throw error;

      // Update onboarding state
      await updateOnboardingState({ profile_completed: true });

      toast({
        title: "Profile created",
        description: "Your profile has been successfully created.",
      });

      navigate('/subscriptions');
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
