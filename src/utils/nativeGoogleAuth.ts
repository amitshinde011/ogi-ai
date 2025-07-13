import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { supabase } from '@/integrations/supabase/client';

// Import Firebase for web platform fallback
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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
      console.log('Firebase Authentication ready for native platform');
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase Authentication:', error);
      return false;
    }
  } else {
    try {
      if (getApps().length === 0) {
        console.log('Web platform - using Supabase OAuth instead of Firebase');
      }
      return true;
    } catch (error) {
      console.error('Firebase web initialization error:', error);
      return true;
    }
  }
};

export const signInWithGoogleNative = async (): Promise<{ user: GoogleAuthUser | null; error: string | null }> => {
  try {
    console.log('Starting native Google sign in with Firebase...');

    if (!isNativePlatform()) {
      return { user: null, error: 'Native Firebase Auth is only available on mobile devices' };
    }

    // The plugin should automatically use the Web Client ID from your google-services.json.
    // By not passing `serverClientId`, we rely on this automatic configuration.
    // If you get a "bad id token" error, it points to an issue in your native project's
    // configuration, and you may need to hardcode the `serverClientId` again as a workaround.
    const result = await FirebaseAuthentication.signInWithGoogle();
    console.log('Native Firebase Google sign in result:', result);

    if (!result || !result.user) {
      return { user: null, error: 'Google sign in was cancelled or failed' };
    }

    // --- IMPROVEMENT: Get the ID token directly from the sign-in result ---
    // This is more efficient than calling getIdToken() separately.
    const idToken = result.credential?.idToken;
    console.log('Firebase ID token retrieved from sign-in result.');

    if (!idToken) {
      console.error('No ID token returned from Firebase sign-in result');
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
      imageUrl: result.user.photoUrl || '',
      idToken: idToken, // Use the token from the sign-in result
    };

    // Sign in to Supabase using the Firebase ID token
    console.log('Signing in to Supabase with Firebase ID token...');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      
      if (error.message.includes('Invalid login credentials') || error.message.includes('bad id token')) {
        return { user: null, error: 'Authentication failed. Please check your Supabase Google Auth configuration.' };
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
    
    if (error.code === 'auth/user-cancelled') {
      return { user: null, error: 'Google sign in was cancelled by user' };
    } else if (error.code === 'auth/network-error') {
      return { user: null, error: 'Network error. Please check your connection and try again.' };
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
      await FirebaseAuthentication.getCurrentUser();
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
    return {
      isValid: true,
      message: 'Web Google OAuth will be validated during sign-in attempt'
    };
  }
};
