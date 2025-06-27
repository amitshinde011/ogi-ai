
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Header from '@/components/Header';
import PhotoUpload from '@/components/PhotoUpload';
import ComfortQuestionsSection from '@/components/assessment/ComfortQuestionsSection';
import HealthConditionsSection from '@/components/assessment/HealthConditionsSection';
import { useBeforeAssessment } from '@/hooks/useBeforeAssessment';

const BeforeAssessment = () => {
  const {
    form,
    selectedImage,
    imagePreview,
    uploading,
    isSubmitting,
    handleImageSelect,
    handleImageRemove,
    onSubmit
  } = useBeforeAssessment();

  const [fieldMessages, setFieldMessages] = useState<{[key: string]: string}>({});

  const handleImageUpload = (file: File) => {
    handleImageSelect(file);
    if (!fieldMessages.photo) {
      setFieldMessages(prev => ({
        ...prev,
        photo: "Perfect! Your starting photo will help you see your incredible transformation."
      }));
    }
  };

  const handleSliderChange = (field: string, value: number) => {
    form.setValue(field as any, value);
    
    if (!fieldMessages[field]) {
      const messages = {
        walk_10km_comfort: "Great! Being honest about your current comfort level helps us personalize your journey.",
        run_10km_comfort: "Excellent! Your honesty helps us create the perfect program for you.",
        climb_mountain_comfort: "Wonderful! This baseline will help us track your amazing progress."
      };
      
      if (messages[field as keyof typeof messages]) {
        setFieldMessages(prev => ({
          ...prev,
          [field]: messages[field as keyof typeof messages]
        }));
      }
    }
  };

  const handleHealthConditionsChange = (field: string, value: string) => {
    if (value.trim() && !fieldMessages[field]) {
      const messages = {
        current_health_conditions: "Thank you for sharing this important information. It helps us ensure your safety.",
        comments: "Your thoughts and concerns are valuable to us. We'll consider them in your program."
      };
      
      if (messages[field as keyof typeof messages]) {
        setFieldMessages(prev => ({
          ...prev,
          [field]: messages[field as keyof typeof messages]
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title="Before We Start" />
      
      <div className="min-h-screen bg-gradient-peaceful p-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-primary mb-2">How do you feel right now?</CardTitle>
              <p className="text-gray-600">
                Let's capture your starting point for this wellness journey
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Photo Upload */}
                  <div>
                    <PhotoUpload
                      selectedImage={imagePreview}
                      onImageSelect={handleImageUpload}
                      onImageRemove={handleImageRemove}
                      uploading={uploading}
                      title="Starting Photo"
                      description="Capture your fitness journey beginning"
                    />
                    {fieldMessages.photo && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 flex items-center">
                          <span className="mr-2">✓</span>
                          {fieldMessages.photo}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Comfort Level Questions with Sliders */}
                  <ComfortQuestionsSection 
                    control={form.control} 
                    onSliderChange={handleSliderChange}
                    fieldMessages={fieldMessages}
                  />

                  {/* Health Conditions and Comments */}
                  <HealthConditionsSection 
                    control={form.control} 
                    onFieldChange={handleHealthConditionsChange}
                    fieldMessages={fieldMessages}
                  />

                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isSubmitting || uploading}
                  >
                    {isSubmitting ? 'Saving Assessment...' : uploading ? 'Uploading Photo...' : 'Start My Journey'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BeforeAssessment;
