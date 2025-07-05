
import { GoogleAuth } from '@capacitor/google-auth';
import { Capacitor } from '@capacitor/core';

export const initializeCapacitorPlugins = async () => {
  if (Capacitor.isNativePlatform()) {
    await GoogleAuth.initialize({
      clientId: '735765936537-7qtbvhvn62vn9j1vqmjk3hm6s1kv2bks.apps.googleusercontent.com', // Your Google OAuth client ID
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
  }
};
