import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'care.yogi.app',
  appName: 'yogi',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlay: false,
      style: 'DARK',
    },
    // --- UPDATE THIS SECTION ---
    FirebaseAuthentication: {
      skipNativeAuth: false,
      // Add 'apple.com' to this list
      providers: ['google.com', 'apple.com'] 
    },
    Motion: {
      interval: 100
    }
  },
  server: {
    hostname: 'yogi.capacitor.app',
    androidScheme: 'https',
    iosScheme: 'https'
  }
};

export default config;