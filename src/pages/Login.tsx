
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in real app would integrate with Firebase Auth
    localStorage.setItem('user', JSON.stringify({ email, isAuthenticated: true }));
    navigate('/');
  };

  const handleGoogleLogin = () => {
    // Mock Google login
    localStorage.setItem('user', JSON.stringify({ email: 'user@gmail.com', isAuthenticated: true }));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg border-lavender/20">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-sage rounded-full mx-auto flex items-center justify-center mb-4 shadow-md">
              <span className="text-2xl text-white">🧘</span>
            </div>
            <h1 className="text-2xl font-bold text-stone">Welcome to Yogi-ai</h1>
            <p className="text-stone/70">Track Your Meals. Share the Journey.</p>
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
                className="rounded-xl text-stone border-lavender/30 focus:border-sage"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl text-stone border-lavender/30 focus:border-sage"
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-xl bg-sage hover:bg-sage/90 text-white shadow-md">
              Sign In
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-lavender/30"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone/60">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full rounded-xl border-lavender/30 hover:bg-lavender/10 text-stone"
          >
            <span className="mr-2">🔍</span>
            Continue with Google
          </Button>

          <div className="text-center">
            <span className="text-sm text-stone/60">
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
