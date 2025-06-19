
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginForm from '@/components/auth/LoginForm';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Check for verification message from signup
  const showVerificationMessage = searchParams.get('message') === 'verify';

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

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg border-lavender/20 bg-white">
        <CardHeader className="text-center">
          <LoginHeader showVerificationMessage={showVerificationMessage} />
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm onSuccess={handleLoginSuccess} />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-black/60">Or continue with</span>
            </div>
          </div>

          <GoogleLoginButton isLoading={isLoading} />

          <div className="text-center">
            <span className="text-sm text-black/60">
              Don't have an account?{' '}
              <Link to="/signup" className="text-sage hover:underline font-medium">
                Sign up
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
