
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoFieldsProps {
  formData: {
    name: string;
    age: string;
    gender: string;
    weight: string;
    height: string;
  };
  onFormDataChange: (field: string, value: string) => void;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ formData, onFormDataChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="name" className="text-dark-text font-medium">Full Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFormDataChange('name', e.target.value)}
          required
          placeholder="Enter your full name"
          className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 mt-2"
        />
      </div>
      <div>
        <Label htmlFor="age" className="text-dark-text font-medium">Age *</Label>
        <Input
          id="age"
          type="number"
          min="1"
          max="150"
          value={formData.age}
          onChange={(e) => onFormDataChange('age', e.target.value)}
          required
          placeholder="Enter your age"
          className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 mt-2"
        />
      </div>
      <div>
        <Label htmlFor="gender" className="text-dark-text font-medium">Gender *</Label>
        <Select value={formData.gender} onValueChange={(value) => onFormDataChange('gender', value)}>
          <SelectTrigger className="bg-white border-gray-300 text-dark-text mt-2">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200">
            <SelectItem value="male" className="text-dark-text">Male</SelectItem>
            <SelectItem value="female" className="text-dark-text">Female</SelectItem>
            <SelectItem value="other" className="text-dark-text">Other</SelectItem>
            <SelectItem value="prefer-not-to-say" className="text-dark-text">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="weight" className="text-dark-text font-medium">Weight (kg) *</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          min="1"
          max="500"
          value={formData.weight}
          onChange={(e) => onFormDataChange('weight', e.target.value)}
          required
          placeholder="Enter your weight"
          className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 mt-2"
        />
      </div>
      <div className="md:col-span-1">
        <Label htmlFor="height" className="text-dark-text font-medium">Height (cm) *</Label>
        <Input
          id="height"
          type="number"
          min="1"
          max="300"
          value={formData.height}
          onChange={(e) => onFormDataChange('height', e.target.value)}
          required
          placeholder="Enter your height"
          className="bg-white border-gray-300 text-dark-text placeholder:text-gray-500 mt-2"
        />
      </div>
    </div>
  );
};

export default BasicInfoFields;
