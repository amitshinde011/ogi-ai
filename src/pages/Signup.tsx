
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Mock signup - in real app would integrate with Firebase Auth
    localStorage.setItem('user', JSON.stringify({ 
      email: formData.email, 
      isAuthenticated: true,
      needsProfileSetup: true 
    }));
    navigate('/profile-setup');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg border-lavender/20">
        <CardHeader className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gradient-sage rounded-full mx-auto flex items-center justify-center mb-4 shadow-md">
              <span className="text-2xl text-white">🧘</span>
            </div>
            <h1 className="text-2xl font-bold text-stone">Join Yogi-ai</h1>
            <p className="text-stone/70">Start your wellness journey today</p>
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
                className="rounded-xl text-stone border-lavender/30 focus:border-sage"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="rounded-xl text-stone border-lavender/30 focus:border-sage"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="rounded-xl text-stone border-lavender/30 focus:border-sage"
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-xl bg-sage hover:bg-sage/90 text-white shadow-md">
              Create Account
            </Button>
          </form>

          <div className="text-center">
            <span className="text-sm text-stone/60">
              Already have an account?{' '}
              <Link to="/login" className="text-sage hover:underline font-medium">
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
