
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
import Layout from '@/components/Layout';
import Header from '@/components/Header';

interface ProfileFormData {
  name: string;
  age: string;
  gender: string;
  dietaryGoals: string;
}

const ProfileEdit = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get current user data
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const form = useForm<ProfileFormData>({
    defaultValues: {
      name: user.name || '',
      age: user.age || '',
      gender: user.gender || '',
      dietaryGoals: user.dietaryGoals || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Update user data in localStorage
      const updatedUser = {
        ...user,
        ...data,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      navigate('/settings');
    } catch (error) {
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
      
      <div className="p-4 max-w-md mx-auto">
        <Card className="shadow-lg border-lavender/20">
          <CardHeader>
            <div className="text-center">
              <img
                src={user.avatar}
                alt="Profile"
                className="w-20 h-20 rounded-full mx-auto mb-4 shadow-md"
              />
              <p className="text-sm text-stone/70">
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
                      <FormLabel className="text-stone">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          className="rounded-xl text-stone border-lavender/30 focus:border-sage"
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
                      <FormLabel className="text-stone">Age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter your age"
                          className="rounded-xl text-stone border-lavender/30 focus:border-sage"
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
                      <FormLabel className="text-stone">Gender</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl text-stone border-lavender/30">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietaryGoals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-stone">Dietary Goals</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What are your dietary goals? (e.g., weight loss, muscle gain, healthy eating)"
                          className="rounded-xl min-h-20 text-stone border-lavender/30 focus:border-sage"
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
                    className="flex-1 rounded-xl border-lavender/30 text-stone hover:bg-lavender/10"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl bg-sage hover:bg-sage/90 text-white shadow-md"
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
