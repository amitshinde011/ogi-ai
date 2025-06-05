
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import ProfileForm from '@/components/ProfileForm';
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
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  
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
            setHasExistingProfile(true);
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
          } else {
            setHasExistingProfile(false);
            setProfileImage(user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setHasExistingProfile(false);
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

      let error;
      
      if (hasExistingProfile) {
        const result = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('user_id', user.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('user_profiles')
          .insert(profileData);
        error = result.error;
      }

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
            <ProfileForm
              form={form}
              onSubmit={onSubmit}
              onCancel={() => navigate('/settings')}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileEdit;
