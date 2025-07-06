
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
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
      // Firebase Authentication doesn't require explicit initialization
      console.log('Firebase Authentication ready for native platform');
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase Authentication:', error);
      return false;
    }
  }
  return true; // Web doesn't need initialization
};

export const signInWithGoogleNative = async (): Promise<{ user: GoogleAuthUser | null; error: string | null }> => {
  try {
    console.log('Starting native Google sign in with Firebase...');
    
    // Check if Firebase Auth is available
    if (!isNativePlatform()) {
      return { user: null, error: 'Native Firebase Auth is only available on mobile devices' };
    }

    const result = await FirebaseAuthentication.signInWithGoogle();
    console.log('Native Firebase Google sign in result:', result);

    if (!result || !result.user) {
      return { user: null, error: 'Google sign in was cancelled or failed' };
    }

    // Get the ID token from Firebase
    const { token } = await FirebaseAuthentication.getIdToken();
    console.log('Firebase ID token retrieved');

    if (!token) {
      console.error('No ID token received from Firebase');
      return { user: null, error: 'Failed to get authentication token from Firebase' };
    }

    if (!result.user.email || !result.user.uid) {
      console.error('Missing required user information from Firebase Auth');
      return { user: null, error: 'Incomplete user information received from Firebase' };
    }

    const googleUser: GoogleAuthUser = {
      id: result.user.uid,
      email: result.user.email,
      name: result.user.displayName || result.user.email.split('@')[0],
      imageUrl: result.user.photoURL || '',
      idToken: token
    };

    // Sign in to Supabase using the Firebase ID token
    console.log('Signing in to Supabase with Firebase ID token...');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: token,
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
    console.error('Native Firebase Google sign in error:', error);
    
    // Handle specific Firebase error codes
    if (error.code === 'auth/user-cancelled') {
      return { user: null, error: 'Google sign in was cancelled by user' };
    } else if (error.code === 'auth/network-error') {
      return { user: null, error: 'Network error. Please check your connection and try again.' };
    } else if (error.code === 'auth/configuration-not-found') {
      return { user: null, error: 'Firebase configuration not found. Please check your setup.' };
    }
    
    return { user: null, error: error.message || 'Failed to sign in with Google' };
  }
};

export const signOutGoogleNative = async (): Promise<{ error: string | null }> => {
  try {
    if (isNativePlatform()) {
      await FirebaseAuthentication.signOut();
      console.log('Successfully signed out from Firebase (native)');
    }
    
    // Also sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out from Supabase:', error);
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error: any) {
    console.error('Native Firebase sign out error:', error);
    return { error: error.message || 'Failed to sign out' };
  }
};

// Utility function to check if Firebase Auth is properly configured
export const validateGoogleAuthConfiguration = async (): Promise<{ isValid: boolean; message: string }> => {
  if (isNativePlatform()) {
    try {
      // Try to get current user to check configuration
      const result = await FirebaseAuthentication.getCurrentUser();
      return {
        isValid: true,
        message: 'Native Firebase Auth is properly configured'
      };
    } catch (error) {
      return {
        isValid: false,
        message: `Firebase Auth configuration error: ${error}`
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
