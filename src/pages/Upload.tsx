import React, { useState } from 'react';
import { Camera, Upload as UploadIcon, Check, Sun, Salad, Moon, Apple, Image } from 'lucide-react';
import Loader from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useR2Upload } from '@/hooks/useR2Upload';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgram } from '@/hooks/useUserProgram';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { getLocalDateString } from '@/utils/dateUtils';

const Upload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: userProgram } = useUserProgram();
  const { isCompleted } = useProgramCompletion();
  const [selectedMeal, setSelectedMeal] = useState(location.state?.mealType || '');
  const [specialTracking, setSpecialTracking] = useState(location.state?.specialTracking || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const { uploadToR2, uploading } = useR2Upload();

  const mealTypes = [
    { id: 'breakfast', name: 'Breakfast', icon: Salad, time: '6:00 - 11:00 AM' },
    { id: 'lunch', name: 'Lunch', icon: Sun, time: '11:00 AM - 3:00 PM' },
    { id: 'dinner', name: 'Dinner', icon: Moon, time: '3:00 PM - 10:00 PM' },
    { id: 'snack', name: 'Snack', icon: Apple, time: 'Anytime' }
  ];

  // Set default food item based on special tracking
  React.useEffect(() => {
    if (specialTracking) {
      if (specialTracking === 'salad_bowl') {
        setDescription('Daily Breakfast Salad Bowl');
        setSelectedMeal('breakfast');
      } else if (specialTracking === 'kanji') {
        setDescription('Daily Kanji (Finger Millet Porridge)');
        setSelectedMeal('breakfast');
      }
    }
  }, [specialTracking]);

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
    if (!selectedMeal || !imageFile || !isAuthenticated || !user) {
      console.log('⚠️ Missing data for upload:', { selectedMeal, imageFile: !!imageFile, user: !!user });
      if (!isAuthenticated || !user) {
        toast({ title: "Authentication required. Please try logging in again.", variant: "destructive" });
      }
      return;
    }

    // Check if user has active subscription
    if (!userProgram || isCompleted) {
      toast({ 
        title: "Subscription Required", 
        description: "You need an active subscription to post meals.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      console.log('📤 Starting upload process...');
      
      // Upload image to R2
      const uploadResult = await uploadToR2(imageFile, 'meal');
      if (!uploadResult) return;

      console.log('✅ Image uploaded successfully:', uploadResult.imageUrl);

      const postCaption = description || `Just had my ${selectedMeal}! 🍽️`;

      console.log('📝 Creating post with auth user_id:', user.id);

      // Create the post in posts table using the new schema
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: user.id, // Use user.id from cached auth
          image_url: uploadResult.imageUrl,
          caption: postCaption,
          category: selectedMeal // Use category instead of meal_type
        });

      if (postError) {
        console.error('❌ Post creation error:', postError);
        throw postError;
      }

      console.log('✅ Post created successfully');

      // Also save to meal_tracking for progress tracking
      await supabase
        .from('meal_tracking')
        .insert({
          user_id: user.id, // Use cached user.id
          meal_type: selectedMeal,
          food_item: description || 'Meal logged',
          date: getLocalDateString()
        });

      console.log('✅ Meal tracking saved');

      toast({ title: "Meal posted successfully!" });
      navigate('/community');
    } catch (error) {
      console.error('Error uploading meal:', error);
      toast({ title: "Failed to post meal", variant: "destructive" });
    }
  };

  return (
    <Layout containerVariant="full" noContainer>
      <Header title="Log Your Meal" showBack />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-6 py-4">
        {/* Meal Type Selection */}
        <Card className="shadow-lg border-lavender/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-stone mb-4">Select Meal Type</h3>
            <div className="space-y-3">
              {mealTypes.map((meal) => {
                const IconComponent = meal.icon;
                return (
                  <div
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedMeal === meal.id
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <IconComponent size={24} className="text-primary mr-3" />
                        <div>
                          <h4 className="font-medium text-stone">{meal.name}</h4>
                          <p className="text-sm text-stone/60">{meal.time}</p>
                        </div>
                      </div>
                      {selectedMeal === meal.id && (
                        <Check size={20} strokeWidth={1.5} className="text-primary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="shadow-lg border-lavender/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-stone mb-4">Upload Photo</h3>
            {!imagePreview ? (
              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-primary rounded-xl">
                <Camera size={32} strokeWidth={1.5} className="text-primary mb-2" />
                <span className="text-primary font-medium mb-4">Select photo</span>
                
                <div className="flex gap-3">
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                      <span>
                        <Camera size={16} className="mr-2" />
                        Take Photo
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                      <span>
                        <Image size={16} className="mr-2" />
                        Gallery
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
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
              className="rounded-xl min-h-20 text-stone border-lavender/30 focus:border-primary"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!selectedMeal || !imageFile || uploading || !isAuthenticated || !user || !userProgram || isCompleted}
          className="w-full rounded-xl py-6 font-medium shadow-lg"
        >
          {uploading ? (
            <div className="flex items-center">
              <Loader size="sm" className="mr-2" />
              Uploading...
            </div>
          ) : (
            <div className="flex items-center">
              <UploadIcon size={20} strokeWidth={1.5} className="mr-2" />
              Share with Community
            </div>
          )}
        </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
