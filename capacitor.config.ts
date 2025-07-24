
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'care.yogi.app',
  appName: 'yogi',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com']
    },
    Motion: {
      interval: 100
    }
  },
  // --- ADD THIS SERVER CONFIGURATION ---
  server: {
    hostname: 'yogi.capacitor.app', // A unique hostname for both Android and iOS
    androidScheme: 'https', // Use a standard scheme like https
    iosScheme: 'https'
  }
};

export default config;
