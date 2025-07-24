import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

// Define the interface for our custom plugin
interface MyGoogleAuthPlugin {
  signIn(): Promise<{ idToken: string; email: string; name: string }>;
}

// Register the custom plugin with Capacitor
const MyGoogleAuth = Capacitor.registerPlugin<MyGoogleAuthPlugin>('MyGoogleAuth');

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

/**
 * FIX: Added back an empty initialize function to resolve build errors
 * from other files that may still be importing it. This function
 * is not needed for the custom plugin to work.
 */
export const initializeGoogleAuth = async () => {
  return true;
};

/**
 * Handles the native Google Sign-In flow for iOS using your custom plugin.
 * @returns A promise that resolves with the user object on success or an error string on failure.
 */
export const signInWithGoogleNative = async (): Promise<{ user: GoogleAuthUser | null; error: string | null }> => {
  try {
    console.log('Starting native Google sign in with custom plugin...');

    if (!isNativePlatform()) {
      return { user: null, error: 'This function is only for native mobile devices.' };
    }

    // Call your custom plugin's signIn method
    const result = await MyGoogleAuth.signIn();
    
    console.log('Custom native plugin result:', result);

    if (!result || !result.idToken) {
      return { user: null, error: 'Google sign in was cancelled or failed.' };
    }

    const idToken = result.idToken;

    console.log('ID token received. Signing in to Supabase...');

    // Sign in to Supabase using the ID token from your custom plugin
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return { user: null, error: `Authentication failed: ${error.message}` };
    }

    if (!data.user || !data.user.email || !data.user.id) {
      return { user: null, error: 'Authentication succeeded but no user data was received.' };
    }
    
    const googleUser: GoogleAuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.full_name || data.user.email.split('@')[0],
        imageUrl: data.user.user_metadata.avatar_url || '',
        idToken: idToken,
    };

    console.log('Successfully signed in with Supabase:', data.user);
    return { user: googleUser, error: null };

  } catch (error: any) {
    console.error('Custom native Google sign in error:', error);
    if (error.message?.includes('cancelled')) {
      return { user: null, error: 'Google sign in was cancelled.' };
    }
    return { user: null, error: error.message || 'Failed to sign in with Google.' };
  }
};

/**
 * Handles sign out for both native and web platforms.
 */
export const signOutGoogle = async (): Promise<{ error: string | null }> => {
  try {
    // There's no native sign-out to call for the custom plugin, 
    // as GIDSignIn manages its own state. Signing out of Supabase is sufficient.
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out from Supabase:', error);
      return { error: error.message };
    }
    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: error.message || 'Failed to sign out' };
  }
};
