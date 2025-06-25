
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinalAssessmentForm {
  walk_10km_comfort: number;
  run_10km_comfort: number;
  climb_mountain_comfort: number;
  current_health_conditions: string;
  comments: string;
}

export const useFinalAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Check if program is completed and final assessment is appropriate
    const checkProgramStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        const today = new Date().toISOString().split('T')[0];
        
        // Get active subscription that has ended (completed program)
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('id, end_date')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .lte('end_date', today)
          .maybeSingle();

        if (!subscription) {
          // No completed program, redirect to home
          console.log('No completed program found, redirecting to home');
          navigate('/home');
          return;
        }

        // Check if final assessment already exists
        const { data: finalAssessment } = await supabase
          .from('final_assessments')
          .select('id')
          .eq('user_id', user.id)
          .eq('subscription_id', subscription.id)
          .maybeSingle();

        if (finalAssessment) {
          // Final assessment already done, redirect to comparison
          console.log('Final assessment already completed, redirecting to comparison');
          navigate('/comparison');
          return;
        }
      } catch (error) {
        console.error('Error checking program status:', error);
        navigate('/home');
      }
    };

    checkProgramStatus();
  }, [navigate]);

  const form = useForm<FinalAssessmentForm>({
    defaultValues: {
      walk_10km_comfort: 3,
      run_10km_comfort: 3,
      climb_mountain_comfort: 3,
      current_health_conditions: '',
      comments: ''
    }
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

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/final-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('assessments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('assessments')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getComfortString = (value: number) => {
    const mapping = {
      1: 'very_uncomfortable',
      2: 'uncomfortable',
      3: 'somewhat_comfortable',
      4: 'comfortable',
      5: 'very_comfortable'
    };
    return mapping[value as keyof typeof mapping] || 'somewhat_comfortable';
  };

  const onSubmit = async (data: FinalAssessmentForm) => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get current active subscription that has ended (completed program)
      const today = new Date().toISOString().split('T')[0];
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lte('end_date', today)
        .maybeSingle();

      if (!subscription) {
        throw new Error('No completed program found');
      }

      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          return; // Upload failed, error already shown
        }
      }

      // Convert numeric values to string format for database compatibility
      const formattedData = {
        walk_10km_comfort: getComfortString(data.walk_10km_comfort),
        run_10km_comfort: getComfortString(data.run_10km_comfort),
        climb_mountain_comfort: getComfortString(data.climb_mountain_comfort),
        current_health_conditions: data.current_health_conditions,
        comments: data.comments
      };

      // Create final assessment
      const { data: finalAssessment, error } = await supabase
        .from('final_assessments')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          ...formattedData,
          full_body_photo_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Assessment Completed!",
        description: "Congratulations on completing your wellness journey!",
      });

      navigate('/comparison', { state: { finalAssessmentId: finalAssessment.id } });
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    selectedImage,
    imagePreview,
    uploading,
    isSubmitting,
    handleImageSelect,
    handleImageRemove,
    onSubmit
  };
};
