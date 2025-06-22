
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import ProfileSetupHeader from '@/components/profile-setup/ProfileSetupHeader';
import BasicInfoFields from '@/components/profile-setup/BasicInfoFields';
import PhysicalActivitySection from '@/components/profile-setup/PhysicalActivitySection';
import HealthIssuesField from '@/components/profile-setup/HealthIssuesField';
import { useProfileSetup } from '@/hooks/useProfileSetup';

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

  const handleFormDataChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white border border-gray-200 shadow-xl">
          <ProfileSetupHeader />
          <CardContent className="space-y-8">
            <ProfileImageUpload
              selectedImage={imagePreview}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              uploading={uploading}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
              <BasicInfoFields
                formData={formData}
                onFormDataChange={handleFormDataChange}
              />

              <div className="space-y-8">
                <PhysicalActivitySection
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                />

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
  );
};

export default ProfileSetup;
