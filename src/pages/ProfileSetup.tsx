
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOnboarding } from '@/hooks/useOnboarding';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import ComfortSlider from '@/components/ComfortSlider';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateOnboardingState } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting profile save process...');
      console.log('Form data:', formData);

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

      navigate('/subscriptions');
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white border border-gray-200 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-dark-text mb-2">
              Tell Us About Yourself
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Help us create a personalized wellness journey for you
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <ProfileImageUpload
              selectedImage={imagePreview}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              uploading={uploading}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="text-dark-text font-medium">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter your full name"
                    className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="age" className="text-dark-text font-medium">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="150"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    required
                    placeholder="Enter your age"
                    className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-dark-text font-medium">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger className="bg-white border-gray-300 text-dark-text mt-2">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="male" className="text-dark-text">Male</SelectItem>
                      <SelectItem value="female" className="text-dark-text">Female</SelectItem>
                      <SelectItem value="other" className="text-dark-text">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say" className="text-dark-text">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight" className="text-dark-text font-medium">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="1"
                    max="500"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    required
                    placeholder="Enter your weight"
                    className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 mt-2"
                  />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor="height" className="text-dark-text font-medium">Height (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    max="300"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    required
                    placeholder="Enter your height"
                    className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 mt-2"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <ComfortSlider
                  label="How does your body feel after basic physical activity? (walking, light exercise)"
                  value={formData.physical_activity_basic}
                  onChange={(value) => setFormData(prev => ({ ...prev, physical_activity_basic: value }))}
                />

                <ComfortSlider
                  label="How does your body feel after medium physical activity? (jogging, cycling)"
                  value={formData.physical_activity_medium}
                  onChange={(value) => setFormData(prev => ({ ...prev, physical_activity_medium: value }))}
                />

                <ComfortSlider
                  label="How does your body feel after intense physical activity? (running, sports)"
                  value={formData.physical_activity_intense}
                  onChange={(value) => setFormData(prev => ({ ...prev, physical_activity_intense: value }))}
                />

                <div>
                  <Label htmlFor="health-issues" className="text-dark-text">Existing Health Issues (if any)</Label>
                  <Textarea
                    id="health-issues"
                    value={formData.health_issues}
                    onChange={(e) => setFormData(prev => ({ ...prev, health_issues: e.target.value }))}
                    placeholder="Please describe any health conditions, medications, or concerns..."
                    rows={3}
                    className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 mt-2"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-sage hover:bg-sage/90 text-white py-3 text-lg font-medium" 
                disabled={loading || uploading}
              >
                {loading ? 'Saving...' : uploading ? 'Uploading Photo...' : 'Continue to Subscriptions'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;
