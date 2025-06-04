import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';

interface ProfileFormData {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  health_issues: string;
}

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  
  const form = useForm<ProfileFormData>({
    defaultValues: {
      name: '',
      age: '',
      gender: '',
      weight: '',
      height: '',
      health_issues: '',
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (profile) {
            const profileData = {
              name: profile.name || '',
              age: profile.age?.toString() || '',
              gender: profile.gender || '',
              weight: profile.weight?.toString() || '',
              height: profile.height?.toString() || '',
              health_issues: profile.health_issues || '',
            };
            
            form.reset(profileData);
            setUserProfile(profile);
            setProfileImage(profile.profile_photo_url || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const profileData = {
        user_id: user.id,
        name: data.name,
        age: parseInt(data.age),
        gender: data.gender,
        weight: parseFloat(data.weight),
        height: parseFloat(data.height),
        health_issues: data.health_issues,
        profile_photo_url: profileImage,
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      navigate('/settings');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Header title="Edit Profile" showBack />
      
      <div className="p-4 max-w-md mx-auto bg-light-gray min-h-screen">
        <Card className="bg-card-gray border border-gray-200">
          <CardHeader>
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full shadow-md object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-sage rounded-full p-1 cursor-pointer hover:bg-sage/90 transition-colors">
                  <Camera size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-dark-text">
                Update your profile information
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark-text">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark-text">Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter your age"
                          className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark-text">Gender</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-gray-300 text-dark-text">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="male" className="text-dark-text">Male</SelectItem>
                          <SelectItem value="female" className="text-dark-text">Female</SelectItem>
                          <SelectItem value="other" className="text-dark-text">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say" className="text-dark-text">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-dark-text">Weight (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Weight"
                            className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-dark-text">Height (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Height"
                            className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="health_issues"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-dark-text">Health Issues</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any health conditions or concerns..."
                          className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/settings')}
                    className="flex-1 rounded-xl border-gray-300 text-dark-text hover:bg-gray-100 bg-white"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl bg-sage hover:bg-sage/90 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileEdit;
