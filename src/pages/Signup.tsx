
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ContentContainer from '@/components/ContentContainer';
import { IMAGES } from '@/constants/images';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import AppleLoginButton from '@/components/auth/AppleLoginButton';
import { TrustBadges } from '@/components/conversion/TrustBadges';
import { LiveActivityFeed } from '@/components/conversion/LiveActivityFeed';
import Layout from '@/components/Layout';
import { Shield, Users, Star, Gift, CheckCircle, Zap, Heart, Target } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
const [isLoading, setIsLoading] = useState(false);
const [googleLoading, setGoogleLoading] = useState(false);
const [appleLoading, setAppleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [currentStep, setCurrentStep] = useState(1);

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
                <Gift className="w-3 h-3" />
                Free to Start
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                10,000+ Success Stories
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
                
                {/* Left side - Value Proposition */}
                <div className="hidden lg:block space-y-6">
                  <div className="text-left">
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                      Transform Your Life in
                      <span className="text-primary block">Just 21 Days</span>
                    </h1>
                    <p className="text-lg text-muted-foreground mb-6">
                      Join thousands who've already transformed their health with our personalized wellness programs.
                    </p>
                  </div>
                  
                  {/* Value Props Grid */}
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                      <Zap className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm">Instant Access</h3>
                        <p className="text-xs text-muted-foreground">Start your transformation today</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                      <Heart className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm">Personalized Plans</h3>
                        <p className="text-xs text-muted-foreground">Tailored to your goals & lifestyle</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                      <Target className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm">Proven Results</h3>
                        <p className="text-xs text-muted-foreground">94% see results in first week</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Proof Numbers */}
                  <div className="grid grid-cols-3 gap-4 text-center py-6 border-t border-b border-border/50">
                    <div>
                      <div className="text-2xl font-bold text-primary">10K+</div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">94%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">4.9★</div>
                      <div className="text-xs text-muted-foreground">User Rating</div>
                    </div>
                  </div>
                  
                  {/* Trust Badges */}
                  <TrustBadges />
                </div>

                {/* Right side - Signup Form */}
                <div className="w-full max-w-md mx-auto lg:mx-0">
                  {/* Mobile header */}
                  <div className="lg:hidden text-center mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Start Your Transformation</h1>
                    <p className="text-muted-foreground">Join thousands transforming their lives</p>
                  </div>

                  <Card className="animate-fade-in shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <div className="mb-4">
                        <div className="w-20 h-20 mx-auto flex items-center justify-center mb-4">
                          <img 
                            src={IMAGES.LOGO_VARIANT} 
                            alt="Yogi Logo" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Create Your Account</h2>
                        <p className="text-sm text-muted-foreground">Get started in less than 30 seconds</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Quick Signup Benefits */}
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                          <Gift className="w-4 h-4" />
                          <span>Start free • No credit card required</span>
                        </div>
                      </div>

{/* Social Signup */}
<div className="space-y-3">
  <GoogleLoginButton 
    isLoading={googleLoading} 
    setIsLoading={setGoogleLoading} 
  />
  <AppleLoginButton 
    isLoading={appleLoading} 
    setIsLoading={setAppleLoading} 
  />
  
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-border"></div>
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-card px-3 text-muted-foreground font-medium">Or create with email</span>
    </div>
  </div>
</div>

                      <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="h-12"
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Input
                            type="password"
                            placeholder="Create password (min. 6 characters)"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="h-12"
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Input
                            type="password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="h-12"
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-base font-semibold"
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating Your Account..." : "Start My Transformation →"}
                        </Button>
                      </form>

                      {/* Quick Benefits Reminder */}
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-primary" />
                          <span>Free to start</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-primary" />
                          <span>Cancel anytime</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-primary" />
                          <span>Instant access</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-primary" />
                          <span>Expert support</span>
                        </div>
                      </div>

                      {/* Security Assurance */}
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="w-4 h-4" />
                          <span>Your information is secure and encrypted</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="text-sm text-muted-foreground">
                          Already have an account?{' '}
                          <Link to="/login" className="text-primary hover:underline font-semibold">
                            Sign in here
                          </Link>
                        </span>
                      </div>

                      <div className="text-center text-xs text-muted-foreground space-y-1">
                        <p>
                          By signing up, you agree to our{' '}
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
            </ContentContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
