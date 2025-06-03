
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    dietaryGoals: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile data
    const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({
      ...existingUser,
      ...formData,
      needsProfileSetup: false,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
    }));
    navigate('/');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg border-lavender/20">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-stone">Set Up Your Profile</h1>
          <p className="text-stone/70">Tell us about yourself to personalize your experience</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="rounded-xl text-stone border-lavender/30 focus:border-sage"
                required
              />
            </div>
            
            <div>
              <Input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="rounded-xl text-stone border-lavender/30 focus:border-sage"
                required
              />
            </div>

            <div>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className="rounded-xl text-stone border-lavender/30">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Textarea
                placeholder="What are your dietary goals? (e.g., weight loss, muscle gain, healthy eating)"
                value={formData.dietaryGoals}
                onChange={(e) => handleInputChange('dietaryGoals', e.target.value)}
                className="rounded-xl min-h-20 text-stone border-lavender/30 focus:border-sage"
                required
              />
            </div>

            <Button type="submit" className="w-full rounded-xl bg-sage hover:bg-sage/90 text-white shadow-md">
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
