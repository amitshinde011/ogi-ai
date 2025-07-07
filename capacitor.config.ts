
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
      'android.permission.health.READ_STEPS',
      'android.permission.health.READ_ACTIVE_CALORIES_BURNED',
      'android.permission.health.READ_DISTANCE',
      'android.permission.health.READ_EXERCISE',
      'android.permission.health.READ_HEART_RATE'
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
