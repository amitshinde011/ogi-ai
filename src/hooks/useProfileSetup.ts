
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';

interface FormData {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  physical_activity_basic: number;
  physical_activity_medium: number;
  physical_activity_intense: number;
  health_issues: string;
}

export const useProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    physical_activity_basic: 3,
    physical_activity_medium: 3,
    physical_activity_intense: 3,
    health_issues: ''
  });

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

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('assessments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('assessments')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getActivityString = (value: number) => {
    const mapping = {
      1: 'exhausted',
      2: 'slightly-tired', 
      3: 'slightly-tired',
      4: 'energized',
      5: 'energized'
    };
    return mapping[value as keyof typeof mapping] || 'slightly-tired';
  };

  const validateForm = () => {
    if (!formData.name || !formData.age || !formData.weight || !formData.height || !formData.gender) {
      throw new Error('Please fill in all required fields (Name, Age, Gender, Weight, Height)');
    }

    const age = parseInt(formData.age);
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);

    if (isNaN(age) || age <= 0 || age > 150) {
      throw new Error('Please enter a valid age between 1 and 150');
    }

    if (isNaN(weight) || weight <= 0 || weight > 500) {
      throw new Error('Please enter a valid weight between 1 and 500 kg');
    }

    if (isNaN(height) || height <= 0 || height > 300) {
      throw new Error('Please enter a valid height between 1 and 300 cm');
    }

    return { age, weight, height };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting profile save process...');
      console.log('Form data:', formData);

      const { age, weight, height } = validateForm();

      console.log('Validation passed. Getting user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User authentication error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }

      if (!user) {
        console.error('No user found');
        throw new Error('No authenticated user found. Please log in again.');
      }

      console.log('User found:', user.id);

      // Upload profile image if selected
      let profileImageUrl = null;
      if (selectedImage) {
        profileImageUrl = await uploadProfileImage(selectedImage);
        if (!profileImageUrl) {
          return; // Upload failed, error already shown
        }
      }

      const profileData = {
        user_id: user.id,
        name: formData.name.trim(),
        age: age,
        gender: formData.gender,
        weight: weight,
        height: height,
        physical_activity_basic: getActivityString(formData.physical_activity_basic),
        physical_activity_medium: getActivityString(formData.physical_activity_medium),
        physical_activity_intense: getActivityString(formData.physical_activity_intense),
        health_issues: formData.health_issues.trim() || null,
        profile_photo_url: profileImageUrl
      };

      console.log('Attempting to save profile with data:', profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData)
        .select();

      if (error) {
        console.error('Supabase upsert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Profile saved successfully:', data);
      console.log('Updating onboarding state...');

      await updateOnboardingState({ profile_completed: true });
      
      console.log('Onboarding state updated successfully');

      toast({
        title: "Profile Created!",
        description: "Your profile has been successfully saved.",
      });

      // Navigate immediately without showing final message
      navigate('/subscriptions');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
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
