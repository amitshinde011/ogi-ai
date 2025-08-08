import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

interface AppleLoginButtonProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const AppleLoginButton = ({ isLoading, setIsLoading }: AppleLoginButtonProps) => {
  const { toast } = useToast();

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        // Dynamically import and run the native-only function
        const { signInWithNativeApple } = await import('./appleNativeAuth');
        await signInWithNativeApple();
      } else {
        // Run the web-only function
        await signInWithWebApple();
      }
    } catch (error) {
      console.error('Apple login failed:', error);
      toast({
        title: "Login failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
    // Don't set isLoading to false on web success due to redirect
    if (Capacitor.isNativePlatform()) {
      setIsLoading(false);
    }
  };

  const signInWithWebApple = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      throw error;
    }
  };

  return (
    <Button
      onClick={handleAppleLogin}
      variant="outline"
      className="w-full rounded-xl border-gray-300 hover:bg-gray-50 text-black bg-white"
      disabled={isLoading}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
      Continue with Apple
    </Button>
  );
};

export default AppleLoginButton;