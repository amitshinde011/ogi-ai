
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import PhotoUpload from '@/components/PhotoUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BeforeAssessmentForm {
  walk_10km_comfort: string;
  run_10km_comfort: string;
  climb_mountain_comfort: string;
  current_health_conditions: string;
  comments: string;
}

const BeforeAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const form = useForm<BeforeAssessmentForm>({
    defaultValues: {
      walk_10km_comfort: '',
      run_10km_comfort: '',
      climb_mountain_comfort: '',
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
      const fileName = `${user.id}/before-${Date.now()}.${fileExt}`;

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

  const onSubmit = async (data: BeforeAssessmentForm) => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
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
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          return; // Upload failed, error already shown
        }
      }

      // Create before assessment using journey_assessments table
      const { error } = await supabase
        .from('journey_assessments')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          assessment_type: 'before',
          ...data,
          full_body_photo_url: imageUrl
        });

      if (error) throw error;

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

  const comfortOptions = [
    { value: 'very_comfortable', label: 'Very Comfortable' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'somewhat_comfortable', label: 'Somewhat Comfortable' },
    { value: 'uncomfortable', label: 'Uncomfortable' },
    { value: 'very_uncomfortable', label: 'Very Uncomfortable' }
  ];

  return (
    <Layout>
      <Header title="Before We Start" />
      
      <div className="min-h-screen bg-gradient-peaceful p-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-primary mb-2">How do you feel right now?</CardTitle>
              <p className="text-gray-600">
                Let's capture your starting point for this wellness journey
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Photo Upload */}
                  <PhotoUpload
                    selectedImage={imagePreview}
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    uploading={uploading}
                    title="Starting Photo"
                    description="Capture your fitness journey beginning"
                  />

                  {/* Comfort Level Questions */}
                  <FormField
                    control={form.control}
                    name="walk_10km_comfort"
                    rules={{ required: "Please select your comfort level" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How comfortable do you feel walking 10km?</FormLabel>
                        <FormControl>
                          <RadioGroup value={field.value} onValueChange={field.onChange}>
                            {comfortOptions.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`walk-${option.value}`} />
                                <Label htmlFor={`walk-${option.value}`}>{option.label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="run_10km_comfort"
                    rules={{ required: "Please select your comfort level" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How comfortable do you feel running 10km?</FormLabel>
                        <FormControl>
                          <RadioGroup value={field.value} onValueChange={field.onChange}>
                            {comfortOptions.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`run-${option.value}`} />
                                <Label htmlFor={`run-${option.value}`}>{option.label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="climb_mountain_comfort"
                    rules={{ required: "Please select your comfort level" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How comfortable do you feel climbing a small mountain?</FormLabel>
                        <FormControl>
                          <RadioGroup value={field.value} onValueChange={field.onChange}>
                            {comfortOptions.map((option) => (
                              <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`climb-${option.value}`} />
                                <Label htmlFor={`climb-${option.value}`}>{option.label}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="current_health_conditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Health Conditions (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe any current health conditions..."
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Comments (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Share your thoughts about starting the program..."
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isSubmitting || uploading}
                  >
                    {isSubmitting ? 'Saving Assessment...' : uploading ? 'Uploading Photo...' : 'Start My Journey'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BeforeAssessment;
