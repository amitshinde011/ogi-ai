import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { supabase } from '@/integrations/supabase/client';

// --- IMPORTANT: Add your Web Client ID here ---
// You can find this in your google-services.json file where "client_type": 3
const GOOGLE_WEB_CLIENT_ID = '894086114400-913a15dv4hu0vsjntpt6u00ci7leno5t.apps.googleusercontent.com';


/**
 * Checks if the app is running on a native mobile platform.
 * @returns {boolean}
 */
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Handles the native Google Sign-In flow using the Firebase plugin.
 * It gets the ID token from the native SDK and passes it to Supabase.
 * @returns {Promise<object>} The Supabase session data.
 */
export const signInWithNativeGoogle = async () => {
  // --- UPDATED: Pass the serverClientId to the plugin ---
  const result = await FirebaseAuthentication.signInWithGoogle({
    serverClientId: GOOGLE_WEB_CLIENT_ID,
  });
  
  const idToken = result.credential?.idToken;

  if (!idToken) {
    throw new Error('Native Google sign-in failed: No ID token returned.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) {
    throw error;
  }
  return data;
};

/**
 * Handles the web-based Google Sign-In flow using Supabase's standard OAuth method.
 * @returns {Promise<object>} The Supabase OAuth data.
 */
export const signInWithWebGoogle = async () => {
  const redirectTo = `${window.location.origin}/api/auth/callback`;
  console.log('[Google OAuth] Redirect URI:', redirectTo);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin, // Redirects back to the web app's home page
    },
  });

  if (error) {
    throw error;
  }
  return data;
};
