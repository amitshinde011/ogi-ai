import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if the app is running on a native mobile platform.
 * @returns {boolean}
 */
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Handles the native Google Sign-In flow using an in-app browser.
 * This is a workaround to avoid native SDK configuration issues.
 * @returns {Promise<object>} The Supabase session data.
 */
export const signInWithNativeGoogle = async () => {
  // 1. Get the Google sign-in URL from Supabase
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // This must match the scheme in your AndroidManifest.xml
      redirectTo: 'care.yogi.app://auth/callback',
    },
  });

  if (error) {
    console.error("Error getting OAuth URL from Supabase:", error);
    throw error;
  }
  if (!data.url) {
    throw new Error("No URL returned from Supabase OAuth");
  }

  // 2. Open the URL in the in-app browser
  await Browser.open({ url: data.url });

  // 3. Listen for the app being reopened by the custom URL scheme
  return new Promise((resolve, reject) => {
    App.addListener('appUrlOpen', async (event) => {
      try {
        // Close the browser window now that we are back in the app
        await Browser.close();

        // Supabase's library should automatically handle the session from the URL hash.
        // We just need to wait a moment for it to process.
        // The onAuthStateChange listener in your app will then fire.
        // If you need to manually handle the session, you can parse the URL here.
        
        // For simplicity, we can resolve here and let the auth listener handle the user state.
        // If you need the session data immediately, you would parse event.url
        // and call supabase.auth.setSession().
        
        // Let's check the session to confirm login
        setTimeout(async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                return reject(sessionError);
            }
            if (!session) {
                return reject(new Error("Login failed: Supabase session not found after redirect."));
            }
            resolve({ session });
        }, 500); // Small delay to allow Supabase to process the URL

      } catch (err) {
        reject(err);
      }
    });
  });
};

/**
 * Handles the web-based Google Sign-In flow using Supabase's standard OAuth method.
 * @returns {Promise<object>} The Supabase OAuth data.
 */
export const signInWithWebGoogle = async () => {
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
