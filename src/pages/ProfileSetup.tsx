
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProfileImageUpload from '@/components/ProfileImageUpload';
import ProfileSetupHeader from '@/components/profile-setup/ProfileSetupHeader';
import BasicInfoFields from '@/components/profile-setup/BasicInfoFields';
import PhysicalActivitySection from '@/components/profile-setup/PhysicalActivitySection';
import HealthIssuesField from '@/components/profile-setup/HealthIssuesField';
import EncouragingMessage from '@/components/EncouragingMessage';
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

  const [encouragingMessage, setEncouragingMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());

  const handleFormDataChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Show encouraging messages for key milestones
    if (field === 'name' && value && !completedSections.has('name')) {
      setCompletedSections(prev => new Set(prev).add('name'));
      setEncouragingMessage("Great to meet you! Let's continue building your personalized wellness plan.");
      setShowMessage(true);
    } else if ((field === 'weight' || field === 'height') && value && formData.weight && formData.height && !completedSections.has('physical')) {
      setCompletedSections(prev => new Set(prev).add('physical'));
      setEncouragingMessage("Thank you! Every detail helps us create the perfect plan for you.");
      setShowMessage(true);
    } else if (field === 'gender' && value && !completedSections.has('gender')) {
      setCompletedSections(prev => new Set(prev).add('gender'));
      setEncouragingMessage("Perfect! We're getting to know you better with each step.");
      setShowMessage(true);
    }
  };

  const handlePhysicalActivityChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Show encouraging message when they complete physical activity section
    const isLastActivity = field === 'physical_activity_intense';
    if (isLastActivity && !completedSections.has('activity')) {
      setCompletedSections(prev => new Set(prev).add('activity'));
      setEncouragingMessage("Excellent! Understanding your activity levels helps us tailor your journey perfectly.");
      setShowMessage(true);
    }
  };

  const handleImageUpload = (file: File) => {
    handleImageSelect(file);
    if (!completedSections.has('photo')) {
      setCompletedSections(prev => new Set(prev).add('photo'));
      setEncouragingMessage("Beautiful! Having a photo helps track your amazing transformation journey.");
      setShowMessage(true);
    }
  };

  const handleMessageComplete = () => {
    setShowMessage(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    // Show final encouraging message before submission
    setEncouragingMessage("Your wellness journey begins now! We're excited to support you every step of the way.");
    setShowMessage(true);
    
    // Wait for message to show, then submit
    setTimeout(() => {
      setShowMessage(false);
      handleSubmit(e);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white border border-gray-200 shadow-xl">
          <ProfileSetupHeader />
          <CardContent className="space-y-8">
            <ProfileImageUpload
              selectedImage={imagePreview}
              onImageSelect={handleImageUpload}
              onImageRemove={handleImageRemove}
              uploading={uploading}
            />

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <BasicInfoFields
                formData={formData}
                onFormDataChange={handleFormDataChange}
              />

              <div className="space-y-8">
                <PhysicalActivitySection
                  formData={formData}
                  onFormDataChange={handlePhysicalActivityChange}
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

      <EncouragingMessage
        message={encouragingMessage}
        show={showMessage}
        onComplete={handleMessageComplete}
      />
    </div>
  );
};

export default ProfileSetup;
