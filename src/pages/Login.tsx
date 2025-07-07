
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginForm from '@/components/auth/LoginForm';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import WellnessCarousel from '@/components/auth/WellnessCarousel';
import TestimonialsCarousel from '@/components/auth/TestimonialsCarousel';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const showVerificationMessage = searchParams.get('message') === 'verify';

  // Listen for authentication changes to handle navigation after login
  useEffect(() => {
    let mounted = true;

    // Handle OAuth callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        return;
      }

      if (data.session && mounted) {
        console.log("OAuth callback successful, navigating...");
        navigate('/', { replace: true });
      }
    };

    // Check for OAuth callback parameters
    if (searchParams.get('code') || searchParams.get('access_token')) {
      console.log('OAuth callback detected');
      handleAuthCallback();
    }

    // This listener will fire when the user successfully signs in via native or web.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event);
        if (event === "SIGNED_IN" && session) {
          console.log("User signed in, navigating...");
          navigate('/', { replace: true });
        }
      }
    );

    // Also check for an existing session when the component first loads
    const checkUser = async () => {
      if (!mounted) return;
      
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/', { replace: true });
      }
    };
    
    checkUser();

    // Clean up the listener when the component unmounts
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  const handleLoginSuccess = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Mobile Carousel - shown at top on mobile screens */}
        <div className="lg:hidden mb-6 flex justify-center">
          <div className="w-full max-w-md">
            <WellnessCarousel />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 items-center justify-items-center">
          {/* Left side - Wellness Carousel (Desktop only) */}
          <div className="hidden lg:flex lg:justify-center w-full">
            <div className="w-full max-w-md">
              <WellnessCarousel />
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-md">
              <Card className="animate-fade-in shadow-lg border-gray-300 bg-white">
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

                  {/* Pass both isLoading and setIsLoading to the button */}
                  <GoogleLoginButton isLoading={isLoading} setIsLoading={setIsLoading} />

                  <div className="text-center text-xs text-gray-600 space-y-2">
                    <p>
                      By logging in, you agree to our{' '}
                      <Link to="/privacy-policy" className="text-sage hover:underline">
                        Privacy Policy
                      </Link>
                      {' '}and{' '}
                      <Link to="/terms-and-conditions" className="text-sage hover:underline">
                        Terms and Conditions
                      </Link>
                    </p>
                    <p>
                      Need help? Contact us at{' '}
                      <Link to="/contact" className="text-sage hover:underline">
                        support@yogi.care
                      </Link>
                    </p>
                  </div>

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
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-4xl">
            <TestimonialsCarousel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
