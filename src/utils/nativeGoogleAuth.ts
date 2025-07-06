
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
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
    }
  }
};

export const signInWithGoogleNative = async (): Promise<{ user: GoogleAuthUser | null; error: string | null }> => {
  try {
    console.log('Starting native Google sign in...');
    
    const result = await GoogleAuth.signIn();
    console.log('Native Google sign in result:', result);

    if (!result) {
      return { user: null, error: 'Google sign in was cancelled' };
    }

    const googleUser: GoogleAuthUser = {
      id: result.id,
      email: result.email,
      name: result.name,
      imageUrl: result.imageUrl,
      idToken: result.idToken
    };

    // Sign in to Supabase using the Google ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: result.idToken,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return { user: null, error: error.message };
    }

    console.log('Successfully signed in with Supabase:', data);
    return { user: googleUser, error: null };

  } catch (error: any) {
    console.error('Native Google sign in error:', error);
    return { user: null, error: error.message || 'Failed to sign in with Google' };
  }
};

export const signOutGoogleNative = async (): Promise<{ error: string | null }> => {
  try {
    if (isNativePlatform()) {
      await GoogleAuth.signOut();
    }
    return { error: null };
  } catch (error: any) {
    console.error('Native Google sign out error:', error);
    return { error: error.message || 'Failed to sign out' };
  }
};
