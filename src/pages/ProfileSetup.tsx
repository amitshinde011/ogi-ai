
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    physical_activity_basic: '',
    physical_activity_medium: '',
    physical_activity_intense: '',
    health_issues: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          name: formData.name,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          physical_activity_basic: formData.physical_activity_basic,
          physical_activity_medium: formData.physical_activity_medium,
          physical_activity_intense: formData.physical_activity_intense,
          health_issues: formData.health_issues
        });

      if (error) throw error;

      await updateOnboardingState({ profile_completed: true });
      
      toast({
        title: "Profile Created!",
        description: "Your profile has been successfully saved.",
      });

      navigate('/subscriptions');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
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
              Tell Us About Yourself
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Help us create a personalized wellness journey for you
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>How does your body feel after basic physical activity? (walking, light exercise)</Label>
                  <RadioGroup
                    value={formData.physical_activity_basic}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, physical_activity_basic: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="energized" id="basic-energized" />
                      <Label htmlFor="basic-energized">Energized and refreshed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slightly-tired" id="basic-tired" />
                      <Label htmlFor="basic-tired">Slightly tired but good</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exhausted" id="basic-exhausted" />
                      <Label htmlFor="basic-exhausted">Exhausted and breathless</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>How does your body feel after medium physical activity? (jogging, cycling)</Label>
                  <RadioGroup
                    value={formData.physical_activity_medium}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, physical_activity_medium: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="energized" id="medium-energized" />
                      <Label htmlFor="medium-energized">Energized and refreshed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slightly-tired" id="medium-tired" />
                      <Label htmlFor="medium-tired">Slightly tired but good</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exhausted" id="medium-exhausted" />
                      <Label htmlFor="medium-exhausted">Exhausted and breathless</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>How does your body feel after intense physical activity? (running, sports)</Label>
                  <RadioGroup
                    value={formData.physical_activity_intense}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, physical_activity_intense: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="energized" id="intense-energized" />
                      <Label htmlFor="intense-energized">Energized and refreshed</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slightly-tired" id="intense-tired" />
                      <Label htmlFor="intense-tired">Slightly tired but good</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="exhausted" id="intense-exhausted" />
                      <Label htmlFor="intense-exhausted">Exhausted and breathless</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="health-issues">Existing Health Issues (if any)</Label>
                  <Textarea
                    id="health-issues"
                    value={formData.health_issues}
                    onChange={(e) => setFormData(prev => ({ ...prev, health_issues: e.target.value }))}
                    placeholder="Please describe any health conditions, medications, or concerns..."
                    rows={3}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Continue to Subscriptions'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
