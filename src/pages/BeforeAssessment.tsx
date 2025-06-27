
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Header from '@/components/Header';
import PhotoUpload from '@/components/PhotoUpload';
import ComfortQuestionsSection from '@/components/assessment/ComfortQuestionsSection';
import HealthConditionsSection from '@/components/assessment/HealthConditionsSection';
import EncouragingMessage from '@/components/EncouragingMessage';
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

  const [encouragingMessage, setEncouragingMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const handleImageUpload = (file: File) => {
    handleImageSelect(file);
    if (!completedSections.has('photo')) {
      setCompletedSections(prev => new Set(prev).add('photo'));
      setEncouragingMessage("Perfect! Your starting photo will help you see your incredible transformation.");
      setShowMessage(true);
    }
  };

  const handleSliderChange = (field: string, value: number) => {
    form.setValue(field as any, value);
    
    // Show encouraging message when they complete comfort level questions
    const formValues = form.getValues();
    const comfortFields = ['walk_10km_comfort', 'run_10km_comfort', 'climb_mountain_comfort'];
    const allComfortFieldsSet = comfortFields.every(field => formValues[field as keyof typeof formValues] !== undefined);
    
    if (allComfortFieldsSet && !completedSections.has('comfort')) {
      setCompletedSections(prev => new Set(prev).add('comfort'));
      setEncouragingMessage("Thank you for being honest about your comfort levels. This helps us create the perfect starting point for you.");
      setShowMessage(true);
    }
  };

  const handleMessageComplete = () => {
    setShowMessage(false);
  };

  const handleFormSubmit = async (data: any) => {
    // Show final encouraging message before submission
    setEncouragingMessage("Your journey begins now. Thank you for sharing your starting point. The first step is often the hardest, and you've just taken it!");
    setShowMessage(true);
    
    // Wait for message to show, then submit
    setTimeout(() => {
      setShowMessage(false);
      onSubmit(data);
    }, 3000); // Longer duration for this important message
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
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                  {/* Photo Upload */}
                  <PhotoUpload
                    selectedImage={imagePreview}
                    onImageSelect={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    uploading={uploading}
                    title="Starting Photo"
                    description="Capture your fitness journey beginning"
                  />

                  {/* Comfort Level Questions with Sliders */}
                  <ComfortQuestionsSection 
                    control={form.control} 
                    onSliderChange={handleSliderChange}
                  />

                  {/* Health Conditions and Comments */}
                  <HealthConditionsSection control={form.control} />

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

      <EncouragingMessage
        message={encouragingMessage}
        show={showMessage}
        onComplete={handleMessageComplete}
      />
    </div>
  );
};

export default BeforeAssessment;
