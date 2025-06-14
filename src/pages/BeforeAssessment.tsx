import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Camera, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';

const BeforeAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    current_health_conditions: '',
    walk_10km_comfort: '',
    run_10km_comfort: '',
    climb_mountain_comfort: '',
    comments: ''
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
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage) {
      toast({
        title: "Photo Required",
        description: "Please upload your full body photo to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.walk_10km_comfort || !formData.run_10km_comfort || !formData.climb_mountain_comfort) {
      toast({
        title: "Missing Information",
        description: "Please answer all the activity comfort questions.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      console.log('Current user:', user.id);

      // Upload image first
      const imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) {
        toast({
          title: "Upload Error",
          description: "Failed to upload photo. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Get user's active subscription
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      console.log('Subscription query result:', subscription, subError);

      if (subError) {
        console.error('Subscription query error:', subError);
        toast({
          title: "Error",
          description: "Failed to find subscription. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!subscription) {
        toast({
          title: "No Active Subscription",
          description: "Please select a subscription plan first.",
          variant: "destructive",
        });
        navigate('/subscriptions');
        return;
      }

      console.log('Inserting assessment data:', {
        user_id: user.id,
        subscription_id: subscription.id,
        assessment_type: 'before',
        ...formData
      });

      const { error } = await supabase
        .from('journey_assessments')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          assessment_type: 'before',
          full_body_photo_url: imageUrl,
          current_health_conditions: formData.current_health_conditions,
          walk_10km_comfort: formData.walk_10km_comfort,
          run_10km_comfort: formData.run_10km_comfort,
          climb_mountain_comfort: formData.climb_mountain_comfort,
          comments: formData.comments
        });

      if (error) {
        console.error('Assessment insert error:', error);
        throw error;
      }

      await updateOnboardingState({ before_assessment_completed: true });
      
      toast({
        title: "Assessment Completed!",
        description: "Your before journey assessment has been saved.",
      });

      navigate('/journey-start');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: `Failed to save assessment: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white text-black">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-primary">
              Before Journey Assessment
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Let's capture your starting point for this transformative journey
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-lg font-semibold text-black">Full Body Photo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
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
                      <div>
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-black mb-4">Upload your full body photo</p>
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
                </div>

                <div>
                  <Label htmlFor="health-conditions" className="text-black">Current Health Conditions</Label>
                  <Textarea
                    id="health-conditions"
                    value={formData.current_health_conditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_health_conditions: e.target.value }))}
                    placeholder="Describe your current health status, any medical conditions, medications..."
                    rows={3}
                    className="bg-white text-black border-gray-300"
                  />
                </div>

                <div>
                  <Label className="text-black">Can you walk 10 km nonstop?</Label>
                  <RadioGroup
                    value={formData.walk_10km_comfort}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, walk_10km_comfort: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easily" id="walk-easily" />
                      <Label htmlFor="walk-easily" className="text-black">Yes, easily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with-effort" id="walk-effort" />
                      <Label htmlFor="walk-effort" className="text-black">Yes, with some effort</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="difficult" id="walk-difficult" />
                      <Label htmlFor="walk-difficult" className="text-black">Very difficult</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cannot" id="walk-cannot" />
                      <Label htmlFor="walk-cannot" className="text-black">No, cannot do it</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-black">Can you run 10 km nonstop?</Label>
                  <RadioGroup
                    value={formData.run_10km_comfort}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, run_10km_comfort: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easily" id="run-easily" />
                      <Label htmlFor="run-easily" className="text-black">Yes, easily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with-effort" id="run-effort" />
                      <Label htmlFor="run-effort" className="text-black">Yes, with some effort</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="difficult" id="run-difficult" />
                      <Label htmlFor="run-difficult" className="text-black">Very difficult</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cannot" id="run-cannot" />
                      <Label htmlFor="run-cannot" className="text-black">No, cannot do it</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-black">Can you climb a mountain?</Label>
                  <RadioGroup
                    value={formData.climb_mountain_comfort}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, climb_mountain_comfort: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easily" id="climb-easily" />
                      <Label htmlFor="climb-easily" className="text-black">Yes, easily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with-effort" id="climb-effort" />
                      <Label htmlFor="climb-effort" className="text-black">Yes, with some effort</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="difficult" id="climb-difficult" />
                      <Label htmlFor="climb-difficult" className="text-black">Very difficult</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cannot" id="climb-cannot" />
                      <Label htmlFor="climb-cannot" className="text-black">No, cannot do it</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="comments" className="text-black">Additional Comments</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Any additional thoughts or concerns about starting your journey..."
                    rows={3}
                    className="bg-white text-black border-gray-300"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-semibold text-center">
                  Begin only when you're mentally prepared—once you start, stay committed through the journey 
                  to achieve great results. Once you are ready for the transformation journey, hit the start button.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading || uploading}>
                {loading ? 'Starting Journey...' : uploading ? 'Uploading Photo...' : 'Start My Transformation Journey'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BeforeAssessment;
