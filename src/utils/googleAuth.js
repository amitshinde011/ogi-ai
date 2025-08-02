// src/utils/googleAuth.js
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';

/** Used by your button to detect native vs web */
export const isNativePlatform = () => Capacitor.isNativePlatform();

/** Helper: parse fragment (#) or query (?) params from a URL string */
function getCallbackParams(urlString) {
  // Some providers return params in the fragment, some in the query
  const hashIdx = urlString.indexOf('#');
  const qIdx = urlString.indexOf('?');
  const raw =
    hashIdx >= 0 ? urlString.slice(hashIdx + 1) :
    qIdx >= 0 ? urlString.slice(qIdx + 1) : '';
  return new URLSearchParams(raw);
}

/** Native Google Sign-In (Android) */
export async function signInWithNativeGoogle() {
  if (!isNativePlatform()) {
    throw new Error('signInWithNativeGoogle called on non-native platform');
  }

  // Ask Supabase for the OAuth URL without auto-redirecting
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'care.yogi.app://auth/callback',
      skipBrowserRedirect: true, // critical for in-app flow
    },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('No URL returned from Supabase OAuth');

  await Browser.open({ url: data.url });

  return new Promise((resolve, reject) => {
    const sub = App.addListener('appUrlOpen', async ({ url }) => {
      try {
        // Ensure this is our OAuth callback
        if (!url || !url.startsWith('care.yogi.app://auth/callback')) return;

        // Close the Custom Tab first
        await Browser.close();
        sub.remove();

        const params = getCallbackParams(url);

        // Provider / OAuth error surfaced in callback
        if (params.get('error') || params.get('error_description')) {
          const message = params.get('error_description') || params.get('error') || 'OAuth error';
          return reject(new Error(message));
        }

        // Case 1: implicit flow (tokens directly in callback)
        if (params.has('access_token')) {
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          const { data: sess, error: sErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sErr) return reject(sErr);
          return resolve(sess);
        }

        // Case 2: PKCE code flow (exchange code for session)
        if (params.has('code')) {
          const code = params.get('code');
          const { data: sess, error: xErr } =
            await supabase.auth.exchangeCodeForSession({ authCode: code });
          if (xErr) return reject(xErr);
          return resolve(sess);
        }

        return reject(new Error('No access_token or code found in callback URL'));
      } catch (e) {
        try { sub.remove(); } catch {}
        reject(e);
      }
    });
  });
}

/** Web / PWA Google Sign-In (unchanged) */
export async function signInWithWebGoogle() {
  const redirectTo = window.location.origin; // must exist in Supabase Redirect URLs
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
  return data;
}
