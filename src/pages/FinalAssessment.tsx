
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import Header from '@/components/Header';
import PhotoUpload from '@/components/PhotoUpload';
import ComfortQuestionsSection from '@/components/assessment/ComfortQuestionsSection';
import HealthConditionsSection from '@/components/assessment/HealthConditionsSection';
import { useFinalAssessment } from '@/hooks/useFinalAssessment';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header title="Final Assessment" />
      
      <div className="min-h-screen bg-gradient-peaceful p-4">
        <div className="max-w-md mx-auto">
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
                  <PhotoUpload
                    selectedImage={imagePreview}
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    uploading={uploading}
                    title="Final Photo"
                    description="Show off your amazing progress!"
                  />

                  {/* Comfort Level Questions with Sliders */}
                  <ComfortQuestionsSection control={form.control} />

                  {/* Health Conditions and Comments */}
                  <HealthConditionsSection control={form.control} />

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
  );
};

export default FinalAssessment;
