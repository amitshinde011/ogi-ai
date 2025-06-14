
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Camera, Upload } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';

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
  const { updateOnboardingState } = useOnboarding();
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-before-${Date.now()}.${fileExt}`;

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

      // Create before assessment
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

      // Update onboarding state
      await updateOnboardingState({ before_assessment_completed: true });

      toast({
        title: "Assessment Completed!",
        description: "Your before assessment has been saved successfully.",
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
      <Header title="Before Assessment" />
      
      <div className="min-h-screen bg-light-gray p-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-center text-primary">How do you feel now?</CardTitle>
              <p className="text-center text-gray-600 text-sm">
                Please provide your current status before starting the program
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <Label>Full Body Photo (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img src={imagePreview} alt="Preview" className="w-32 h-48 object-cover mx-auto rounded" />
                          <Button type="button" variant="outline" size="sm" onClick={() => {
                            setSelectedImage(null);
                            setImagePreview('');
                          }}>
                            Remove Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-600">Upload your current photo</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="photo-upload"
                          />
                          <Label htmlFor="photo-upload" className="cursor-pointer">
                            <div className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Photo
                            </div>
                          </Label>
                        </div>
                      )}
                    </div>
                    {uploading && <p className="text-sm text-gray-600">Uploading photo...</p>}
                  </div>

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
                    className="w-full bg-gradient-sage text-white"
                    disabled={isSubmitting || uploading}
                  >
                    {isSubmitting ? 'Submitting...' : uploading ? 'Uploading Photo...' : 'Complete Assessment'}
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
