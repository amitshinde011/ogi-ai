
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { IMAGES } from '@/constants/images';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
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
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile-setup`
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data.user && !data.user.email_confirmed_at) {
        // New user created successfully
        console.log('Signup success:', data);
        toast({
          title: "Account created successfully!",
          description: "Please check your email and verify your account before logging in."
        });
        // Redirect to login page with verification message
        navigate('/login?message=verify');
      } else {
        // User already exists
        toast({
          title: "User already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Signup catch error:', error);
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
            <div className="w-32 h-32 mx-auto flex items-center justify-center mb-4">
              <img 
                src={IMAGES.LOGO_VARIANT} 
                alt="Yogi Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-black/60">Start your wellness journey today</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="rounded-xl text-black bg-white border-gray-300 focus:border-sage placeholder:text-black"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
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
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="rounded-xl text-black bg-white border-gray-300 focus:border-sage placeholder:text-black"
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-xl shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center text-xs text-gray-600 space-y-2">
            <p>
              By signing up, you agree to our{' '}
              <Link to="/privacy-policy" className="text-black/60 hover:underline">
                Privacy Policy
              </Link>
              ,{' '}
              <Link to="/terms-and-conditions" className="text-black/60 hover:underline">
                Terms and Conditions
              </Link>
              {' '}and{' '}
              <Link to="/cancellations-refunds" className="text-black/60 hover:underline">
                Cancellations and Refunds
              </Link>
            </p>
            <p>
              Need help? Contact us at{' '}
              <a href="mailto:support@yogi.care" className="text-black/60 hover:underline">
                support@yogi.care
              </a>
            </p>
          </div>

          <div className="text-center">
            <span className="text-sm text-black/60">
              Already have an account?{' '}
              <Link to="/login" className="text-black/60 hover:underline font-medium">
                Sign in
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
