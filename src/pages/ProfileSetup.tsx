
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import ProfileSetupHeader from '@/components/profile-setup/ProfileSetupHeader';
import BasicInfoFields from '@/components/profile-setup/BasicInfoFields';
import PhysicalActivitySection from '@/components/profile-setup/PhysicalActivitySection';
import HealthIssuesField from '@/components/profile-setup/HealthIssuesField';
import { useProfileSetup } from '@/hooks/useProfileSetup';
import Layout from '@/components/Layout';

const ProfileSetup = () => {
  const {
    formData,
    setFormData,
    selectedImage,
    imagePreview,
    loading,
    uploading,
    handleImageSelect,
    handleImageRemove,
    handleSubmit
  } = useProfileSetup();

  const [fieldMessages, setFieldMessages] = useState<Record<string, string>>({});
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const showFieldMessage = (fieldKey: string, message: string) => {
    setFieldMessages(prev => ({ ...prev, [fieldKey]: message }));
  };

  const handleFormDataChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Show encouraging messages for key milestones
    if (field === 'name' && value && !completedSections.has('name')) {
      setCompletedSections(prev => new Set(prev).add('name'));
      showFieldMessage('name', "Great to meet you! Let's continue building your personalized wellness plan.");
    } else if ((field === 'weight' || field === 'height') && value && formData.weight && formData.height && !completedSections.has('physical')) {
      setCompletedSections(prev => new Set(prev).add('physical'));
      showFieldMessage('physical', "Thank you! Every detail helps us create the perfect plan for you.");
    } else if (field === 'gender' && value && !completedSections.has('gender')) {
      setCompletedSections(prev => new Set(prev).add('gender'));
      showFieldMessage('gender', "Perfect! We're getting to know you better with each step.");
    }
  };

  const handlePhysicalActivityChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Show encouraging message when they complete physical activity section
    const isLastActivity = field === 'physical_activity_intense';
    if (isLastActivity && !completedSections.has('activity')) {
      setCompletedSections(prev => new Set(prev).add('activity'));
      showFieldMessage('activity', "Excellent! Understanding your activity levels helps us tailor your journey perfectly.");
    }
  };

  const handleImageUpload = (file: File) => {
    handleImageSelect(file);
    if (!completedSections.has('photo')) {
      setCompletedSections(prev => new Set(prev).add('photo'));
      showFieldMessage('photo', "Beautiful! Having a photo helps track your amazing transformation journey.");
    }
  };

  return (
    <Layout containerVariant="wide" noContainer>
      <div className="min-h-screen bg-gradient-peaceful py-4">
        <div className="max-w-2xl mx-auto px-4">
        <Card className="bg-white border border-gray-200 shadow-xl">
          <ProfileSetupHeader />
          <CardContent className="space-y-8">
            <div>
              <ProfileImageUpload
                selectedImage={imagePreview}
                onImageSelect={handleImageUpload}
                onImageRemove={handleImageRemove}
                uploading={uploading}
              />
              {fieldMessages.photo && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-700 font-medium">{fieldMessages.photo}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <BasicInfoFields
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                />
                {fieldMessages.name && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700 font-medium">{fieldMessages.name}</p>
                  </div>
                )}
                {fieldMessages.physical && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700 font-medium">{fieldMessages.physical}</p>
                  </div>
                )}
                {fieldMessages.gender && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700 font-medium">{fieldMessages.gender}</p>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <PhysicalActivitySection
                    formData={formData}
                    onFormDataChange={handlePhysicalActivityChange}
                  />
                  {fieldMessages.activity && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700 font-medium">{fieldMessages.activity}</p>
                    </div>
                  )}
                </div>

                <HealthIssuesField
                  value={formData.health_issues}
                  onChange={(value) => handleFormDataChange('health_issues', value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-sage hover:bg-sage/90 text-white py-3 text-lg font-medium" 
                disabled={loading || uploading}
              >
                {loading ? 'Saving...' : uploading ? 'Uploading Photo...' : 'Continue to Subscriptions'}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileSetup;
