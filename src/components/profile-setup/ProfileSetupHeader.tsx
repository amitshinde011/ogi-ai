
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';

const ProfileSetupHeader = () => {
  return (
    <CardHeader className="text-center pb-6">
      <CardTitle className="text-3xl font-bold text-dark-text mb-2">
        Tell Us About Yourself
      </CardTitle>
      <p className="text-gray-600 text-lg">
        Help us create a personalized wellness journey for you
      </p>
    </CardHeader>
  );
};

export default ProfileSetupHeader;
