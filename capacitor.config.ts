
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d058b66d4dd6438ca799b62e81c5c371',
  appName: 'yogi',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com']
    }
  },
  android: {
    permissions: [
      'android.permission.ACTIVITY_RECOGNITION',
      'android.permission.BODY_SENSORS'
    ]
  }
};

export default config;
