
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d058b66d4dd6438ca799b62e81c5c371',
  appName: 'yogi-ai',
  webDir: 'dist',
  server: {
    url: 'https://d058b66d-4dd6-438c-a799-b62e81c5c371.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '', // This will be configured from environment
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
