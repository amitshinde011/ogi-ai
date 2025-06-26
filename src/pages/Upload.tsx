
import React, { useState, useEffect } from 'react';
import { Camera, Upload as UploadIcon, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useR2Upload } from '@/hooks/useR2Upload';

const Upload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedMeal, setSelectedMeal] = useState(location.state?.mealType || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { uploadToR2, uploading } = useR2Upload();

  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', icon: '🌅', time: '6:00 - 11:00 AM' },
    { id: 'lunch', name: 'Lunch', icon: '☀️', time: '11:00 AM - 3:00 PM' },
    { id: 'dinner', name: 'Dinner', icon: '🌙', time: '3:00 PM - 10:00 PM' }
  ];

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user profile information for name and profile picture
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('name, profile_photo_url')
          .eq('user_id', user.id)
          .maybeSingle();

        const displayName = profile?.name || user.email?.split('@')[0] || 'User';
        const displayAvatar = profile?.profile_photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

        setCurrentUser({
          id: user.id,
          email: user.email,
          name: displayName,
          profilePictureUrl: displayAvatar
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMeal || !imageFile || !currentUser) return;

    try {
      // Upload image to R2
      const uploadResult = await uploadToR2(imageFile, 'meal');
      if (!uploadResult) return;

      const mealName = selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1);
      const postContent = description || `Just had my ${selectedMeal}! 🍽️`;

      // Create the post in community_posts table (triggers will populate user info)
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: currentUser.id,
          content: `${mealName} ${postContent}`,
          image_url: uploadResult.imageUrl
        });

      if (error) throw error;

      // Also save to meal_tracking for progress tracking
      await supabase
        .from('meal_tracking')
        .insert({
          user_id: currentUser.id,
          meal_type: selectedMeal,
          food_item: description || 'Meal logged',
          date: new Date().toISOString().split('T')[0]
        });

      toast({ title: "Meal posted successfully!" });
      navigate('/community');
    } catch (error) {
      console.error('Error uploading meal:', error);
      toast({ title: "Failed to post meal", variant: "destructive" });
    }
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
                      <Check className="text-sage w-5 h-5" />
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
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-sage rounded-xl cursor-pointer hover:bg-sage/5 transition-colors">
                <Camera className="text-sage mb-2 w-8 h-8" />
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
                  src={imagePreview}
                  alt="Meal"
                  className="w-full h-48 object-cover rounded-xl shadow-md"
                />
                <Button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
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
          disabled={!selectedMeal || !imageFile || uploading || !currentUser}
          className="w-full rounded-xl bg-sage hover:bg-sage/90 text-white py-6 font-medium shadow-lg"
        >
          {uploading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </div>
          ) : (
            <div className="flex items-center">
              <UploadIcon className="w-5 h-5 mr-2" />
              Share with Community
            </div>
          )}
        </Button>
      </div>
    </Layout>
  );
};

export default Upload;
