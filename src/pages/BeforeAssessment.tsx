
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
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [formData, setFormData] = useState({
    current_health_conditions: '',
    walk_10km_comfort: '',
    run_10km_comfort: '',
    climb_mountain_comfort: '',
    comments: ''
  });

  const handlePhotoUpload = () => {
    // Simulate photo upload
    setPhotoUploaded(true);
    toast({
      title: "Photo Uploaded!",
      description: "Your full body photo has been saved.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!photoUploaded) {
      toast({
        title: "Photo Required",
        description: "Please upload your full body photo to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Get user's active subscription
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!subscription) throw new Error('No active subscription found');

      const { error } = await supabase
        .from('journey_assessments')
        .insert({
          user_id: user.id,
          subscription_id: subscription.id,
          assessment_type: 'before',
          full_body_photo_url: 'placeholder-photo-url',
          current_health_conditions: formData.current_health_conditions,
          walk_10km_comfort: formData.walk_10km_comfort,
          run_10km_comfort: formData.run_10km_comfort,
          climb_mountain_comfort: formData.climb_mountain_comfort,
          comments: formData.comments
        });

      if (error) throw error;

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
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
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
                  <Label className="text-lg font-semibold">Full Body Photo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {!photoUploaded ? (
                      <div>
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Upload your full body photo</p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handlePhotoUpload}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="text-green-600">
                        <Camera className="w-12 h-12 mx-auto mb-2" />
                        <p>Photo uploaded successfully!</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="health-conditions">Current Health Conditions</Label>
                  <Textarea
                    id="health-conditions"
                    value={formData.current_health_conditions}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_health_conditions: e.target.value }))}
                    placeholder="Describe your current health status, any medical conditions, medications..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Can you walk 10 km nonstop?</Label>
                  <RadioGroup
                    value={formData.walk_10km_comfort}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, walk_10km_comfort: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easily" id="walk-easily" />
                      <Label htmlFor="walk-easily">Yes, easily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with-effort" id="walk-effort" />
                      <Label htmlFor="walk-effort">Yes, with some effort</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="difficult" id="walk-difficult" />
                      <Label htmlFor="walk-difficult">Very difficult</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cannot" id="walk-cannot" />
                      <Label htmlFor="walk-cannot">No, cannot do it</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Can you run 10 km nonstop?</Label>
                  <RadioGroup
                    value={formData.run_10km_comfort}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, run_10km_comfort: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easily" id="run-easily" />
                      <Label htmlFor="run-easily">Yes, easily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with-effort" id="run-effort" />
                      <Label htmlFor="run-effort">Yes, with some effort</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="difficult" id="run-difficult" />
                      <Label htmlFor="run-difficult">Very difficult</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cannot" id="run-cannot" />
                      <Label htmlFor="run-cannot">No, cannot do it</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Can you climb a mountain?</Label>
                  <RadioGroup
                    value={formData.climb_mountain_comfort}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, climb_mountain_comfort: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easily" id="climb-easily" />
                      <Label htmlFor="climb-easily">Yes, easily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="with-effort" id="climb-effort" />
                      <Label htmlFor="climb-effort">Yes, with some effort</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="difficult" id="climb-difficult" />
                      <Label htmlFor="climb-difficult">Very difficult</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cannot" id="climb-cannot" />
                      <Label htmlFor="climb-cannot">No, cannot do it</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="comments">Additional Comments</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Any additional thoughts or concerns about starting your journey..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-semibold text-center">
                  Begin only when you're mentally prepared—once you start, stay committed through the journey 
                  to achieve great results. Once you are ready for the transformation journey, hit the start button.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Starting Journey...' : 'Start My Transformation Journey'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BeforeAssessment;
