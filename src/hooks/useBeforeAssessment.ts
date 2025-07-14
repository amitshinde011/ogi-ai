
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useR2Upload } from '@/hooks/useR2Upload';
import { useAuth } from '@/contexts/AuthContext';

interface BeforeAssessmentForm {
  walk_10km_comfort: number;
  run_10km_comfort: number;
  climb_mountain_comfort: number;
  current_health_conditions: string;
  comments: string;
}

export const useBeforeAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { onboardingState, updateOnboardingState } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { uploadToR2, uploading } = useR2Upload();

  useEffect(() => {
    // Check if before assessment was already completed for current subscription
    const checkAssessmentStatus = async () => {
      try {
        if (!user) return;

        // If onboarding shows assessment is completed, redirect to journey start
        if (onboardingState?.before_assessment_completed) {
          console.log('Before assessment already completed, redirecting to journey start');
          navigate('/journey-start');
          return;
        }

        // Check if there's an active subscription and assessment for it
        const { data: subscription } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscription) {
          const { data: assessment } = await supabase
            .from('journey_assessments')
            .select('id')
            .eq('user_id', user.id)
            .eq('subscription_id', subscription.id)
            .eq('assessment_type', 'before')
            .maybeSingle();

          if (assessment) {
            // Assessment exists, update onboarding and redirect
            await updateOnboardingState({ before_assessment_completed: true });
            navigate('/journey-start');
          }
        }
      } catch (error) {
        console.error('Error checking assessment status:', error);
      }
    };

    if (onboardingState) {
      checkAssessmentStatus();
    }
  }, [onboardingState, navigate, updateOnboardingState]);

  const form = useForm<BeforeAssessmentForm>({
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

  const onSubmit = async (data: BeforeAssessmentForm) => {
    try {
      setIsSubmitting(true);
      if (!user) throw new Error('No user found');

      // Get current active subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      let imageUrl = null;
      if (selectedImage) {
        const uploadResult = await uploadToR2(selectedImage, 'community');
        if (!uploadResult) {
          return; // Upload failed, error already shown
        }
        imageUrl = uploadResult.imageUrl;
      }

      // Convert numeric values to string format for database compatibility
      const formattedData = {
        walk_10km_comfort: getComfortString(data.walk_10km_comfort),
        run_10km_comfort: getComfortString(data.run_10km_comfort),
        climb_mountain_comfort: getComfortString(data.climb_mountain_comfort),
        current_health_conditions: data.current_health_conditions,
        comments: data.comments
      };

      // Create before assessment using journey_assessments table
      const { error } = await supabase
        .from('journey_assessments')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          assessment_type: 'before',
          ...formattedData,
          full_body_photo_url: imageUrl
        });

      if (error) throw error;

      // Update onboarding state
      await updateOnboardingState({ before_assessment_completed: true });

      toast({
        title: "Assessment Saved!",
        description: "Your initial assessment has been recorded successfully.",
      });

      navigate('/journey-start');
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
