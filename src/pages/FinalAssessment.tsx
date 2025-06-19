import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import PhotoUpload from '@/components/PhotoUpload';
import ComfortSlider from '@/components/ComfortSlider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinalAssessmentForm {
  walk_10km_comfort: number;
  run_10km_comfort: number;
  climb_mountain_comfort: number;
  current_health_conditions: string;
  comments: string;
}

const FinalAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

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

  return (
    <Layout>
      <Header title="Final Assessment" />
      
      <div className="min-h-screen bg-gradient-peaceful p-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-primary mb-2">How do you feel now?</CardTitle>
              <p className="text-gray-600">
                Let's capture your amazing transformation!
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Photo Upload */}
                  <PhotoUpload
                    selectedImage={imagePreview}
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    uploading={uploading}
                    title="Final Photo"
                    description="Show off your amazing progress!"
                  />

                  {/* Comfort Level Questions with Sliders */}
                  <FormField
                    control={form.control}
                    name="walk_10km_comfort"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ComfortSlider
                            label="How comfortable do you feel walking 10km?"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="run_10km_comfort"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ComfortSlider
                            label="How comfortable do you feel running 10km?"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="climb_mountain_comfort"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ComfortSlider
                            label="How comfortable do you feel climbing a small mountain?"
                            value={field.value}
                            onChange={field.onChange}
                          />
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
                            placeholder="Share your thoughts about the program..."
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isSubmitting || uploading}
                  >
                    {isSubmitting ? 'Completing Assessment...' : uploading ? 'Uploading Photo...' : 'Complete My Journey'}
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

export default FinalAssessment;
