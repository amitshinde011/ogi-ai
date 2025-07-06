
# Native Google Auth Setup Guide

This guide explains how to configure Google Auth for native Android and iOS apps using the `@codetrix-studio/capacitor-google-auth` plugin.

## Prerequisites

1. Google Cloud Console project with OAuth 2.0 credentials
2. Android Studio (for Android development)
3. Xcode (for iOS development - macOS only)
4. Supabase project with Google OAuth provider enabled

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
   # For debug keystore
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # For release keystore (when publishing)
   keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
   ```
4. Add the SHA-1 fingerprint to Google Console
5. Download `google-services.json`

### 3. iOS Configuration

1. Choose "iOS" as application type
2. Bundle ID: `app.lovable.d058b66d4dd6438ca799b62e81c5c371`
3. Download `GoogleService-Info.plist`

### 4. Web Application (Required for Supabase Integration)

1. Choose "Web application" as application type
2. Add your Supabase project URL as authorized JavaScript origin
3. Add your Supabase auth callback URL as authorized redirect URI
4. **IMPORTANT**: Copy the Web Client ID - you'll need this for the native apps

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

### 5. Update Capacitor Configuration

Update `capacitor.config.ts` with your **WEB** client ID (not Android/iOS client ID):

```typescript
plugins: {
  GoogleAuth: {
    scopes: ['profile', 'email'],
    serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    forceCodeForRefreshToken: true
  }
}
```

**CRITICAL**: Use the Web Client ID here, not the Android or iOS client ID.

## Supabase Configuration

### 1. Enable Google OAuth Provider

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google provider
3. Enter your **Web** Client ID and Client Secret
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

## Validation and Testing

### 1. Test Web Login First
- Ensure web Google OAuth works in browser
- Check Supabase dashboard for successful authentications

### 2. Test Native Apps
- Test on real devices (simulators may have limitations)
- Check console logs for detailed error information
- Use `adb logcat` for Android debugging
- Use Xcode console for iOS debugging

### 3. Common Validation Points

**Android:**
- SHA-1 fingerprint matches your keystore
- `google-services.json` in correct location (`android/app/`)
- Package name matches everywhere
- Google Play Services available on device

**iOS:**
- Bundle ID matches Google Console
- `GoogleService-Info.plist` added to Xcode project
- URL schemes correctly configured in Info.plist
- iOS version supports Google Sign-In

**Supabase:**
- Web client ID and secret configured
- Redirect URLs match exactly
- Google provider enabled

## Troubleshooting

### Error: "12501 - User cancelled the dialog"
- User cancelled the sign-in process
- This is normal behavior, not an error

### Error: "12502 - Network error"
- Check internet connectivity
- Verify Google Play Services availability
- Check if Google APIs are accessible

### Error: "10 - Developer error"
- SHA-1 fingerprint mismatch
- Wrong package name
- Google Services configuration issue

### Error: "Invalid login credentials" in Supabase
- Web client ID not configured in Supabase
- Client secret missing or incorrect
- Google provider not enabled in Supabase

### Error: "OAuth client ID is invalid"
- Wrong client ID in capacitor.config.ts
- Using Android/iOS client ID instead of Web client ID
- Client ID not created or enabled in Google Console

## Key Points for Success

1. **Use Web Client ID** in capacitor.config.ts (not Android/iOS client ID)
2. **Test web OAuth first** to ensure Supabase integration works
3. **Use real devices** for testing native auth
4. **Check console logs** for detailed error information
5. **Verify all URLs and IDs** match exactly between services

## Package Information

This implementation uses:
- `@codetrix-studio/capacitor-google-auth` - The community Capacitor Google Auth plugin
- `@capacitor/core` - Capacitor core functionality
- Supabase auth integration for session management
