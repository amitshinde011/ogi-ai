import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';

// This function contains all the native-specific logic and imports
export const signInWithNativeApple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: 'care.yogi.app://auth/callback',
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No URL returned from Supabase OAuth');

  await Browser.open({ url: data.url });

  return new Promise((resolve, reject) => {
    App.addListener('appUrlOpen', async ({ url }) => {
      try {
        if (url.startsWith('care.yogi.app://auth/callback')) {
          await Browser.close();
          const hash = url.split('#')[1];
          if (hash) {
            const params = new URLSearchParams(hash);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');

            if (access_token && refresh_token) {
              const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
              if (error) return reject(error);
              return resolve(data);
            }
          }
          reject(new Error('No tokens found in callback URL'));
        }
      } catch (e) {
        reject(e);
      }
    });
  });
};