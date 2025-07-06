
# Native Google Auth Setup Guide

This guide explains how to configure Google Auth for native Android and iOS apps using the `@codetrix-studio/capacitor-google-auth` plugin.

## Prerequisites

1. Google Cloud Console project with OAuth 2.0 credentials
2. Android Studio (for Android development)
3. Xcode (for iOS development - macOS only)

## Google Cloud Console Setup

### 1. Create OAuth 2.0 Credentials for Mobile Apps

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Credentials > Credentials
3. Click "Create Credentials" > "OAuth 2.0 Client IDs"

### 2. Android Configuration

1. Choose "Android" as application type
2. Package name: `app.lovable.d058b66d4dd6438ca799b62e81c5c371`
3. Get SHA-1 certificate fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
4. Add the SHA-1 fingerprint to Google Console
5. Download `google-services.json`

### 3. iOS Configuration

1. Choose "iOS" as application type
2. Bundle ID: `app.lovable.d058b66d4dd6438ca799b62e81c5c371`
3. Download `GoogleService-Info.plist`

## Project Setup

### 1. Initialize Capacitor

```bash
# Export project to GitHub first
# Clone your project locally
npm install
npx cap init
npx cap add android
npx cap add ios
```

### 2. Install Google Auth Plugin

```bash
npm install @codetrix-studio/capacitor-google-auth
npx cap sync
```

### 3. Android Setup

1. Place `google-services.json` in `android/app/`
2. Update `android/app/build.gradle`:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```
3. Update `android/build.gradle`:
   ```gradle
   dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
   }
   ```

### 4. iOS Setup

1. Place `GoogleService-Info.plist` in the iOS app folder via Xcode
2. Update `ios/App/App/Info.plist`:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
       <dict>
           <key>CFBundleURLName</key>
           <string>REVERSED_CLIENT_ID</string>
           <key>CFBundleURLSchemes</key>
           <array>
               <string>YOUR_REVERSED_CLIENT_ID</string>
           </array>
       </dict>
   </array>
   ```

### 5. Update Capacitor Configuration

Update `capacitor.config.ts` with your server client ID:

```typescript
plugins: {
  GoogleAuth: {
    scopes: ['profile', 'email'],
    serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    forceCodeForRefreshToken: true
  }
}
```

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

## Supabase Configuration

Ensure your Supabase project has:

1. Google OAuth provider enabled
2. Web client ID and secret configured
3. Proper redirect URLs set

## Testing

1. Test web login first to ensure Supabase OAuth works
2. Test native apps on real devices (simulators may have limitations)
3. Check console logs for debugging information

## Troubleshooting

### Android Issues
- Ensure SHA-1 fingerprint matches your keystore
- Check `google-services.json` is in correct location
- Verify package name matches everywhere

### iOS Issues
- Ensure bundle ID matches Google Console
- Check `GoogleService-Info.plist` is added to Xcode project
- Verify URL schemes in Info.plist

### Supabase Issues
- Check if web OAuth works first
- Verify client IDs match between Google Console and Supabase
- Ensure redirect URLs are configured properly

## Package Information

This implementation uses:
- `@codetrix-studio/capacitor-google-auth` - The official Capacitor Google Auth plugin
- `@capacitor/core` - Capacitor core functionality
- Supabase auth integration for session management
