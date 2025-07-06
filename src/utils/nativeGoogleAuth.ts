
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { supabase } from '@/integrations/supabase/client';

export interface GoogleAuthUser {
  id: string;
  email: string;
  name: string;
  imageUrl: string;
  idToken: string;
}

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const initializeGoogleAuth = async () => {
  if (isNativePlatform()) {
    try {
      await GoogleAuth.initialize();
      console.log('Google Auth initialized for native platform');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      return false;
    }
  }
  return true; // Web doesn't need initialization
};

export const signInWithGoogleNative = async (): Promise<{ user: GoogleAuthUser | null; error: string | null }> => {
  try {
    console.log('Starting native Google sign in...');
    
    // Check if Google Auth is available
    if (!isNativePlatform()) {
      return { user: null, error: 'Native Google Auth is only available on mobile devices' };
    }

    const result = await GoogleAuth.signIn();
    console.log('Native Google sign in result:', result);

    if (!result) {
      return { user: null, error: 'Google sign in was cancelled' };
    }

    // Validate required fields
    if (!result.authentication?.idToken) {
      console.error('No ID token received from Google Auth');
      return { user: null, error: 'Failed to get authentication token from Google' };
    }

    if (!result.email || !result.id) {
      console.error('Missing required user information from Google Auth');
      return { user: null, error: 'Incomplete user information received from Google' };
    }

    const googleUser: GoogleAuthUser = {
      id: result.id,
      email: result.email,
      name: result.name || result.email.split('@')[0],
      imageUrl: result.imageUrl || '',
      idToken: result.authentication.idToken
    };

    // Sign in to Supabase using the Google ID token
    console.log('Signing in to Supabase with Google ID token...');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: result.authentication.idToken,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Invalid login credentials')) {
        return { user: null, error: 'Google account not recognized. Please ensure Google OAuth is configured in Supabase.' };
      } else if (error.message.includes('Invalid token')) {
        return { user: null, error: 'Authentication token expired or invalid. Please try again.' };
      }
      
      return { user: null, error: `Authentication failed: ${error.message}` };
    }

    if (!data.user) {
      return { user: null, error: 'Authentication succeeded but no user data received' };
    }

    console.log('Successfully signed in with Supabase:', data);
    return { user: googleUser, error: null };

  } catch (error: any) {
    console.error('Native Google sign in error:', error);
    
    // Handle specific error types
    if (error.message?.includes('12501')) {
      return { user: null, error: 'Google sign in was cancelled by user' };
    } else if (error.message?.includes('12502')) {
      return { user: null, error: 'Google sign in failed. Please check your network connection and try again.' };
    } else if (error.message?.includes('10')) {
      return { user: null, error: 'Google Play Services not available or outdated. Please update Google Play Services.' };
    }
    
    return { user: null, error: error.message || 'Failed to sign in with Google' };
  }
};

export const signOutGoogleNative = async (): Promise<{ error: string | null }> => {
  try {
    if (isNativePlatform()) {
      await GoogleAuth.signOut();
      console.log('Successfully signed out from Google (native)');
    }
    
    // Also sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out from Supabase:', error);
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error: any) {
    console.error('Native Google sign out error:', error);
    return { error: error.message || 'Failed to sign out' };
  }
};

// Utility function to check if Google Auth is properly configured
export const validateGoogleAuthConfiguration = async (): Promise<{ isValid: boolean; message: string }> => {
  if (isNativePlatform()) {
    try {
      // Try to initialize to check configuration
      const initialized = await initializeGoogleAuth();
      if (!initialized) {
        return {
          isValid: false,
          message: 'Google Auth initialization failed. Please check your configuration.'
        };
      }
      return {
        isValid: true,
        message: 'Native Google Auth is properly configured'
      };
    } catch (error) {
      return {
        isValid: false,
        message: `Google Auth configuration error: ${error}`
      };
    }
  } else {
    // For web, we can't easily validate without attempting auth
    return {
      isValid: true,
      message: 'Web Google OAuth will be validated during sign-in attempt'
    };
  }
};
