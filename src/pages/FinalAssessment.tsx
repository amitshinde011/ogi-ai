
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Header from '@/components/Header';
import PhotoUpload from '@/components/PhotoUpload';
import ComfortQuestionsSection from '@/components/assessment/ComfortQuestionsSection';
import HealthConditionsSection from '@/components/assessment/HealthConditionsSection';
import { useFinalAssessment } from '@/hooks/useFinalAssessment';
import Layout from '@/components/Layout';

const FinalAssessment = () => {
  const {
    form,
    selectedImage,
    imagePreview,
    uploading,
    isSubmitting,
    handleImageSelect,
    handleImageRemove,
    onSubmit
  } = useFinalAssessment();

  const [fieldMessages, setFieldMessages] = useState<{[key: string]: string}>({});

  const handleImageUpload = (file: File) => {
    handleImageSelect(file);
    if (!fieldMessages.photo) {
      setFieldMessages(prev => ({
        ...prev,
        photo: "Amazing! This final photo will showcase your incredible transformation journey."
      }));
    }
  };

  const handleSliderChange = (field: string, value: number) => {
    form.setValue(field as any, value);
    
    if (!fieldMessages[field]) {
      const messages = {
        walk_10km_comfort: "Fantastic! Look how your confidence has grown since you started.",
        run_10km_comfort: "Incredible! Your progress in endurance is truly remarkable.",
        climb_mountain_comfort: "Outstanding! You've come so far from where you began."
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
        current_health_conditions: "Thank you for the update. Your health journey progress is inspiring!",
        comments: "Your reflection on this journey is valuable. You should be proud of your achievements!"
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
    <Layout noContainer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <Header title="Final Assessment" />
          <div className="min-h-screen bg-gradient-peaceful py-4">
            <div className="max-w-md mx-auto px-4">
              <Card className="bg-white shadow-xl border-0">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-primary mb-2">How do you feel now?</CardTitle>
                  <p className="text-gray-600">
                    Let's capture your amazing transformation!
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
                          title="Final Photo"
                          description="Show off your amazing progress!"
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
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={isSubmitting || uploading}
                      >
                        {isSubmitting ? 'Completing Assessment...' : uploading ? 'Uploading Photo...' : 'Complete My Journey'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FinalAssessment;
