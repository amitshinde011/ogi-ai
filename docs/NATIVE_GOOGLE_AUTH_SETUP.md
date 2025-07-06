
# Native Google Auth Setup Guide (Firebase Authentication)

This guide explains how to configure Google Auth for native Android and iOS apps using Firebase Authentication with Capacitor 7.

## Prerequisites

1. Firebase project with Authentication enabled
2. Google Cloud Console project with OAuth 2.0 credentials
3. Android Studio (for Android development)
4. Xcode (for iOS development - macOS only)
5. Supabase project with Google OAuth provider enabled

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication in your Firebase project
4. Go to Authentication > Sign-in method
5. Enable Google as a sign-in provider

### 2. Add Apps to Firebase Project

**For Android:**
1. Click "Add app" and select Android
2. Package name: `app.lovable.d058b66d4dd6438ca799b62e81c5c371`
3. Download `google-services.json`

**For iOS:**
1. Click "Add app" and select iOS
2. Bundle ID: `app.lovable.d058b66d4dd6438ca799b62e81c5c371`
3. Download `GoogleService-Info.plist`

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Credentials > Credentials
3. Create credentials for **Web application** (required for Supabase)
4. Add your Supabase project URL as authorized JavaScript origin
5. Add your Supabase auth callback URL as authorized redirect URI

## Project Setup

### 1. Install Dependencies

```bash
npm install @capacitor-firebase/authentication
npx cap sync
```

### 2. Android Configuration

1. Place `google-services.json` in `android/app/`
2. Update `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   
   dependencies {
       implementation 'com.google.firebase:firebase-auth'
       implementation 'com.google.android.gms:play-services-auth'
   }
   ```
3. Update `android/build.gradle`:
   ```gradle
   dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
   }
   ```

### 3. iOS Configuration

1. Open `ios/App/App.xcworkspace` in Xcode
2. Add `GoogleService-Info.plist` to the project (drag and drop into Xcode)
3. Update `ios/App/App/Info.plist`:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
       <dict>
           <key>CFBundleURLName</key>
           <string>REVERSED_CLIENT_ID</string>
           <key>CFBundleURLSchemes</key>
           <array>
               <string>YOUR_REVERSED_CLIENT_ID_FROM_PLIST</string>
           </array>
       </dict>
   </array>
   ```

### 4. Capacitor Configuration

Update `capacitor.config.ts`:

```typescript
plugins: {
  FirebaseAuthentication: {
    skipNativeAuth: false,
    providers: ['google.com']
  }
}
```

## Supabase Configuration

### 1. Enable Google OAuth Provider

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Enter your **Web** Client ID and Client Secret from Google Cloud Console
4. Set redirect URL to: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### 2. Configure Site URL and Redirect URLs

1. Go to Authentication > URL Configuration
2. Set Site URL to your app's URL
3. Add redirect URLs:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - Your app's custom URLs if any

## Building and Running

```bash
# Build the web app
npm run build

# Sync with native platforms
npx cap sync

# Run on Android
npx cap run android

# Run on iOS (macOS only)
npx cap run ios
```

## Key Differences from @codetrix-studio/capacitor-google-auth

1. **Firebase Integration**: Uses Firebase Authentication instead of direct Google Auth
2. **Capacitor 7 Support**: Fully compatible with Capacitor 7
3. **Token Management**: Uses Firebase ID tokens for Supabase authentication
4. **Error Handling**: Firebase-specific error codes and messages
5. **Configuration**: Simplified configuration through Firebase

## Troubleshooting

### Error: "Firebase configuration not found"
- Ensure `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is properly added
- Run `npx cap sync` after adding configuration files

### Error: "auth/configuration-not-found"
- Check Firebase project configuration
- Verify Google sign-in is enabled in Firebase Console
- Ensure correct package name/bundle ID

### Error: "Invalid login credentials" in Supabase
- Web client ID not configured in Supabase
- Client secret missing or incorrect
- Google provider not enabled in Supabase

### Error: "auth/network-error"
- Check internet connectivity
- Verify Firebase project is accessible
- Check if Google APIs are accessible

## Benefits of Firebase Authentication

1. **Better Platform Support**: Official Firebase support for Capacitor 7
2. **Unified Authentication**: Single authentication system across platforms
3. **Enhanced Security**: Firebase handles token management and refresh
4. **Better Error Handling**: More specific error codes and messages
5. **Future-Proof**: Regular updates and maintenance from Firebase team

This implementation provides a more robust and maintainable Google authentication solution for Capacitor 7 applications.
