
import React from 'react';
import { IMAGES } from '@/constants/images';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginHeaderProps {
  showVerificationMessage: boolean;
}

const LoginHeader = ({ showVerificationMessage }: LoginHeaderProps) => {
  return (
    <>
      <div className="mb-4">
        <div className="w-28 h-28 mx-auto flex items-center justify-center mb-4">
          <img 
            src={IMAGES.LOGO_VARIANT} 
            alt="Yogi Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-black/70">Become the best version of yourself</p>
      </div>
      
      {showVerificationMessage && (
        <Alert className="border-blue-200 bg-blue-50 mb-4">
          <AlertDescription className="text-blue-800">
            Please verify your account by clicking the link sent to your email before logging in.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default LoginHeader;
