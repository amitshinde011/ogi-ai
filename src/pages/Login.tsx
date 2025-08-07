import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import ContentContainer from '@/components/ContentContainer';
import LoginHeader from '@/components/auth/LoginHeader';
import LoginForm from '@/components/auth/LoginForm';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import WellnessCarousel from '@/components/auth/WellnessCarousel';
import TestimonialsCarousel from '@/components/auth/TestimonialsCarousel';
import { TrustBadges } from '@/components/conversion/TrustBadges';
import { LiveActivityFeed } from '@/components/conversion/LiveActivityFeed';
import Layout from '@/components/Layout';
import { Shield, Users, Star, Clock, CheckCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const showVerificationMessage = searchParams.get('message') === 'verify';

  // Listen for authentication changes to handle navigation after login
  useEffect(() => {
    // This listener will fire when the user successfully signs in via native or web.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          console.log("User signed in, navigating...");
          navigate('/');
        }
      }
    );

    // Also check for an existing session when the component first loads
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/');
      }
    };
    
    checkUser();

    // Clean up the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <Layout noContainer>
      <LiveActivityFeed />
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          {/* Header with Trust Indicators */}
          <div className="text-center pt-8 pb-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge variant="secondary" className="gap-1">
                <Shield className="w-3 h-3" />
                Secure Login
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                10,000+ Members
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Star className="w-3 h-3" />
                4.8/5 Rating
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-center p-4 min-h-[calc(100vh-200px)]">
            <ContentContainer variant="legal" className="w-full">
              <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                
                {/* Left side - Value Proposition & Social Proof */}
                <div className="hidden lg:block space-y-6">
                  <div className="text-left">
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                      Welcome Back to Your
                      <span className="text-primary block">Wellness Journey</span>
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6">
                      Join thousands transforming their lives with personalized yoga, meditation, and nutrition.
                    </p>
                  </div>
                  
                  {/* Quick Benefits */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm">21-Day Programs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm">Expert Guidance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm">Progress Tracking</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm">Community Support</span>
                    </div>
                  </div>

                  <WellnessCarousel />
                  
                  {/* Trust Badges */}
                  <TrustBadges />
                </div>

                {/* Right side - Login Form */}
                <div className="w-full max-w-md mx-auto lg:mx-0">
                  {/* Mobile header */}
                  <div className="lg:hidden text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back!</h1>
                    <p className="text-muted-foreground">Continue your wellness journey</p>
                  </div>

                  <Card className="animate-fade-in shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <LoginHeader showVerificationMessage={showVerificationMessage} />
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Quick Login Benefits */}
                      <div className="bg-muted/30 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>Access your personalized dashboard in seconds</span>
                        </div>
                      </div>

                      <LoginForm onSuccess={handleLoginSuccess} />
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with</span>
                        </div>
                      </div>

                      <GoogleLoginButton isLoading={isLoading} setIsLoading={setIsLoading} />

                      {/* Security Assurance */}
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                          <Shield className="w-4 h-4" />
                          <span>Your data is protected with enterprise-grade security</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="text-sm text-muted-foreground">
                          New to Yogi?{' '}
                          <Link to="/signup" className="text-primary hover:underline font-semibold">
                            Start your free journey →
                          </Link>
                        </span>
                      </div>

                      <div className="text-center text-xs text-muted-foreground space-y-1">
                        <p>
                          By continuing, you agree to our{' '}
                          <Link to="/privacy-policy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                          {' '}and{' '}
                          <Link to="/terms-and-conditions" className="text-primary hover:underline">
                            Terms
                          </Link>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Mobile Testimonials */}
              <div className="lg:hidden mt-12">
                <TestimonialsCarousel />
              </div>
              
              {/* Desktop Testimonials */}
              <div className="hidden lg:block mt-16">
                <TestimonialsCarousel />
              </div>
            </ContentContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
