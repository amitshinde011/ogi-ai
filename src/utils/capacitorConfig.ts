
import { Capacitor } from '@capacitor/core';

export const initializeCapacitorPlugins = async () => {
  // For now, we'll use web-based Google OAuth for all platforms
  // This can be extended later when native plugins are properly configured
  console.log('Capacitor platform:', Capacitor.getPlatform());
};
