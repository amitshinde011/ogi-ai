
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
    Motion: {
      interval: 100
    }
  },
  android: {
    permissions: [
      'android.permission.ACTIVITY_RECOGNITION',
      'android.permission.BODY_SENSORS',
      'android.permission.HIGH_SAMPLING_RATE_SENSORS'
    ]
  },
  ios: {
    entitlements: {
      'com.apple.developer.motion': true
    },
    infoPlist: {
      'NSMotionUsageDescription': 'This app uses motion sensors to track your steps and physical activity.'
    }
  }
};

export default config;
