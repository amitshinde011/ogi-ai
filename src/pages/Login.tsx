
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
      } else if (data.session) {
        toast({
          title: "Login successful",
          description: "Welcome back!"
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Login catch error:', error);
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Google login error:', error);
        toast({
          title: "Google login failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Google login catch error:', error);
      toast({
        title: "An error occurred",
        description: "Google login failed. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg border-lavender/20 bg-white">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-sage rounded-full mx-auto flex items-center justify-center mb-4 shadow-md">
              <span className="text-2xl text-white">🧘</span>
            </div>
            <h1 className="text-2xl font-bold text-black">Welcome to Yogi-ai</h1>
            <p className="text-black/70">Track Your Meals. Share the Journey.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl text-black bg-white border-gray-300 focus:border-sage"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl text-black bg-white border-gray-300 focus:border-sage"
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-xl bg-sage hover:bg-sage/90 text-white shadow-md"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-black/60">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full rounded-xl border-gray-300 hover:bg-gray-50 text-black"
            disabled={isLoading}
          >
            <span className="mr-2">🔍</span>
            Continue with Google
          </Button>

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
