
import React from 'react';
import ComfortSlider from '@/components/ComfortSlider';

interface PhysicalActivitySectionProps {
  formData: {
    physical_activity_basic: number;
    physical_activity_medium: number;
    physical_activity_intense: number;
  };
  onFormDataChange: (field: string, value: number) => void;
}

const PhysicalActivitySection: React.FC<PhysicalActivitySectionProps> = ({ formData, onFormDataChange }) => {
  return (
    <div className="space-y-8">
      <ComfortSlider
        label="How does your body feel after basic physical activity? (walking, light exercise)"
        value={formData.physical_activity_basic}
        onChange={(value) => onFormDataChange('physical_activity_basic', value)}
      />

      <ComfortSlider
        label="How does your body feel after medium physical activity? (jogging, cycling)"
        value={formData.physical_activity_medium}
        onChange={(value) => onFormDataChange('physical_activity_medium', value)}
      />

      <ComfortSlider
        label="How does your body feel after intense physical activity? (running, sports)"
        value={formData.physical_activity_intense}
        onChange={(value) => onFormDataChange('physical_activity_intense', value)}
      />
    </div>
  );
};

export default PhysicalActivitySection;
