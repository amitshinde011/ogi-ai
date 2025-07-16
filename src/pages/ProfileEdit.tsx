import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { Camera, User, Upload } from 'lucide-react';
import Layout from '@/components/Layout';
import { PageContainer } from '@/components/Layout/PageContainer';
import Header from '@/components/Header';
import ProfileForm from '@/components/ProfileForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  
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
  }, [form, user]);

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
    <Layout noContainer>
      <div className="py-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <PageContainer>
          <Header title="Edit Profile" showBack />
            <Card className="bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-28 h-28 rounded-3xl shadow-xl object-cover border-4 border-white"
                  />
                  <div className="absolute -bottom-2 -right-2 flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-camera"
                    />
                    <label htmlFor="profile-camera" className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-3 cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                      <Camera size={16} className="text-white" />
                    </label>
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-gallery"
                    />
                    <label htmlFor="profile-gallery" className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-3 cursor-pointer hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                      <Upload size={16} className="text-white" />
                    </label>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
                  <User className="w-6 h-6 inline mr-2" />
                  Update Profile
                </CardTitle>
                <p className="text-slate-600 font-medium">
                  Keep your information current for the best experience
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <ProfileForm
                  form={form}
                  onSubmit={onSubmit}
                  onCancel={() => navigate('/settings')}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
        </PageContainer>
      </div>
    </Layout>
  );
};

export default ProfileEdit;
