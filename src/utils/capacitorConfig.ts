
import { Capacitor } from '@capacitor/core';
import { initializeGoogleAuth } from './nativeGoogleAuth';

export const initializeCapacitorPlugins = async () => {
  console.log('Capacitor platform:', Capacitor.getPlatform());
  
  // Initialize Firebase Auth for native platforms
  if (Capacitor.isNativePlatform()) {
    console.log('Initializing native Firebase Auth...');
    await initializeGoogleAuth();
  } else {
    console.log('Running on web platform - using Supabase OAuth');
  }
};
