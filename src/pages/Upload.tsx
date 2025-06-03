
import React, { useState } from 'react';
import { Camera, Upload as UploadIcon, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { useLocation, useNavigate } from 'react-router-dom';

const Upload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMeal, setSelectedMeal] = useState(location.state?.mealType || '');
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', icon: '🌅', time: '6:00 - 11:00 AM' },
    { id: 'lunch', name: 'Lunch', icon: '☀️', time: '11:00 AM - 3:00 PM' },
    { id: 'dinner', name: 'Dinner', icon: '🌙', time: '3:00 PM - 10:00 PM' }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMeal || !image) return;

    setUploading(true);
    
    // Mock upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save to mock community posts
    const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const newPost = {
      id: Date.now().toString(),
      user: {
        name: user.name,
        avatar: user.avatar
      },
      mealType: selectedMeal,
      image,
      description,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    
    posts.unshift(newPost);
    localStorage.setItem('communityPosts', JSON.stringify(posts));
    
    setUploading(false);
    navigate('/community', { state: { uploaded: true } });
  };

  return (
    <Layout>
      <Header title="Log Your Meal" showBack />
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Meal Type Selection */}
        <Card className="shadow-lg border-lavender/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-stone mb-4">Select Meal Type</h3>
            <div className="space-y-3">
              {mealTypes.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => setSelectedMeal(meal.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedMeal === meal.id
                      ? 'border-sage bg-sage/10 shadow-md'
                      : 'border-lavender/30 hover:border-sage hover:bg-lavender/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{meal.icon}</span>
                      <div>
                        <h4 className="font-medium text-stone">{meal.name}</h4>
                        <p className="text-sm text-stone/60">{meal.time}</p>
                      </div>
                    </div>
                    {selectedMeal === meal.id && (
                      <Check className="text-sage" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="shadow-lg border-lavender/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-stone mb-4">Upload Photo</h3>
            {!image ? (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-sage rounded-xl cursor-pointer hover:bg-sage/5 transition-colors">
                <Camera className="text-sage mb-2" size={32} />
                <span className="text-sage font-medium">Tap to take photo</span>
                <span className="text-sm text-stone/60 mt-1">or select from gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  capture="environment"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={image}
                  alt="Meal"
                  className="w-full h-48 object-cover rounded-xl shadow-md"
                />
                <Button
                  onClick={() => setImage(null)}
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 bg-white/90 border-lavender/30"
                >
                  Change
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="shadow-lg border-lavender/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-stone mb-4">Add Description (Optional)</h3>
            <Textarea
              placeholder="Tell us about your meal... What did you eat? How did it taste?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl min-h-20 text-stone border-lavender/30 focus:border-sage"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMeal || !image || uploading}
          className="w-full rounded-xl bg-sage hover:bg-sage/90 text-white py-6 font-medium shadow-lg"
        >
          {uploading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </div>
          ) : (
            <div className="flex items-center">
              <UploadIcon size={20} className="mr-2" />
              Share with Community
            </div>
          )}
        </Button>
      </div>
    </Layout>
  );
};

export default Upload;
