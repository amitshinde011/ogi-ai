
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d058b66d4dd6438ca799b62e81c5c371',
  appName: 'yogi',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlay: false, // Ensure overlay is false if you want content to be pushed below
      style: 'DARK',  // or 'LIGHT'
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com']
    },
    Motion: {
      interval: 100
    },
    StatusBar: {
      overlay: false,
      style: 'light', // You can also use 'light' or 'default'
    },
  },
  // --- ADD THIS SERVER CONFIGURATION ---
  server: {
    hostname: 'yogi.capacitor.app', // A unique hostname for both Android and iOS
    androidScheme: 'https', // Use a standard scheme like https
    iosScheme: 'https'
  }
};

export default config;
