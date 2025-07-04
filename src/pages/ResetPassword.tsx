import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Check if we have the required tokens from the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast({
        title: "Invalid reset link",
        description: "Please request a new password reset link.",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        console.error('Password reset error:', error);
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Password updated successfully!",
          description: "You can now sign in with your new password."
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Password reset catch error:', error);
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg border-gray-200 bg-white">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="w-28 h-28 mx-auto flex items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/6cf2c839-5326-4219-9033-549deb1fb03c.png" 
                alt="Yogi Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold text-black mb-2">Reset Your Password</h2>
            <p className="text-black/70">Enter your new password below</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="New Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="rounded-xl text-black bg-white border-gray-300 focus:border-sage placeholder:text-black"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="rounded-xl text-black bg-white border-gray-300 focus:border-sage placeholder:text-black"
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-xl bg-sage hover:bg-sage/90 text-white shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;