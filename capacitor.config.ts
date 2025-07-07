
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d058b66d4dd6438ca799b62e81c5c371',
  appName: 'yogi',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com']
    },
    Health: {
      enableBackgroundDelivery: true
    }
  },
  android: {
    permissions: [
      'android.permission.ACTIVITY_RECOGNITION',
      'android.permission.BODY_SENSORS',
      'com.google.android.gms.permission.ACTIVITY_RECOGNITION'
    ]
  },
  ios: {
    entitlements: {
      'com.apple.developer.healthkit': true,
      'com.apple.developer.motion': true
    }
  }
};

export default config;
