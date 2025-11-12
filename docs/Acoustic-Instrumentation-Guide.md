# Acoustic SDK Instrumentation Guide for Vue3 Capacitor Hybrid Apps

This comprehensive guide covers the complete implementation of Acoustic SDKs (EOCore and Tealeaf) in a Vue3 Capacitor hybrid application, including all lessons learned and troubleshooting steps.

## Table of Contents
- [Prerequisites](#prerequisites)
- [SDK Selection: Why Not Connect SDK](#sdk-selection-why-not-connect-sdk)
- [Android Implementation](#android-implementation)
- [Web Implementation](#web-implementation)
- [Development Setup with ngrok](#development-setup-with-ngrok)
- [Build and Verification](#build-and-verification)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

- Node.js and npm installed
- Vue3 Capacitor project setup
- Android development environment (Android Studio, SDK)
- ngrok account and installation
- Understanding of hybrid app architecture

## SDK Selection: Why Not Connect SDK

### The Problem with Connect SDK
The **Acoustic Connect SDK** (`io.github.go-acoustic:connect`) does **NOT** support hybrid applications because:

1. **Missing Hybrid APIs**: No `JavaScriptInterface` or WebView instrumentation capabilities
2. **No Bridge Communication**: Cannot communicate between WebView (where your Vue app runs) and native SDK
3. **Native App Focus**: Designed primarily for native Android/iOS apps, not hybrid frameworks like Capacitor

### The Solution: EOCore + Tealeaf SDK
Instead, we use:
- **EOCore** (`io.github.go-acoustic:eocore`) - Core functionality
- **Tealeaf** (`io.github.go-acoustic:tealeaf`) - Provides hybrid app support including `JavaScriptInterface`

## Android Implementation

### Step 1: Update build.gradle Dependencies

In `android/app/build.gradle`, add the dependencies:

```gradle
dependencies {
    // ...existing dependencies...
    
    // Connect SDK - COMMENTED OUT because it lacks hybrid app support
    // implementation 'io.github.go-acoustic:connect:10.4.29'
    
    // Use EOCore + Tealeaf for hybrid app support
    implementation "io.github.go-acoustic:eocore:+"
    implementation "io.github.go-acoustic:tealeaf:+"
}
```

**Critical Note**: Line 43 (Connect SDK) must remain commented out. Lines 44-45 (EOCore and Tealeaf) provide the necessary hybrid support.

### Step 2: Update Android SDK Versions

Update `android/variables.gradle` to support API level 34:

```gradle
ext {
    minSdkVersion = 22
    compileSdkVersion = 34
    targetSdkVersion = 34
    androidxActivityVersion = '1.7.0'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.10.0'
    androidxFragmentVersion = '1.5.6'
    coreSplashScreenVersion = '1.0.0'
    androidxWebkitVersion = '1.6.1'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}
```

### Step 3: Configure MainActivity for Hybrid Support

Update `android/app/src/main/java/com/example/vue3app/MainActivity.java`:

```java
package com.example.vue3app;

import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;
import com.tl.uic.Tealeaf;
import com.tl.uic.javascript.JavaScriptInterface;

public class MainActivity extends BridgeActivity {
    private WebView webView;
    private Context context;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Tealeaf SDK (provides hybrid app support)
        new Tealeaf(getApplication());
        Tealeaf.enable();

        // Get Webview via Capacitor bridge
        context = bridge.getContext();
        webView = bridge.getWebView();

        webView.clearCache(true);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);

        // Add Tealeaf JavaScriptInterface for hybrid app instrumentation
        webView.addJavascriptInterface(
            new JavaScriptInterface(getApplication(), webView, Tealeaf.getPropertyName((View)webView).getId()), 
            "tlBridge"
        );

        // WebView client page loaded callback
        bridge.addWebViewListener(new WebViewListener() {
            @Override
            public void onPageLoaded(WebView webView) {
                super.onPageLoaded(webView);

                // Register bridge callbacks for hybrid app instrumentation
                webView.loadUrl("javascript:TLT.registerBridgeCallbacks([ "
                    + "{enabled: true, cbType: 'screenCapture', cbFunction: function (){tlBridge.screenCapture();}},"
                    + "{enabled: true, cbType: 'messageRedirect', cbFunction: function (data){tlBridge.addMessage(data);}}]);");
            }
        });
    }
}
```

### Step 4: Download and Configure Latest Configuration Files

#### Download Configuration Files Matching Your SDK Versions

Since Gradle resolves to the latest SDK versions (currently `EOCore 2.1.21-beta` and `Tealeaf 10.4.18-beta`), you need to download the corresponding configuration files from Maven Central:

##### EOCore Configuration Files
Download from: `https://repo1.maven.org/maven2/io/github/go-acoustic/eocore/2.1.21-beta/`

Required files:
- **EOCoreBasicConfig.properties**
- **EOCoreAdvancedConfig.json**

##### Tealeaf Configuration Files  
Download from: `https://repo1.maven.org/maven2/io/github/go-acoustic/tealeaf/10.4.18-beta/`

Required files:
- **TealeafBasicConfig.properties**
- **TealeafAdvancedConfig.json**
- **TealeafLayoutConfig.json**

#### Manual Download Steps

1. **Check your actual SDK versions** (as shown in [Build and Verification](#build-and-verification) section):
   ```bash
   cd android
   ./gradlew app:dependencies | grep -i acoustic
   ```

2. **Navigate to Maven Central** for each SDK:
   - EOCore: `https://repo1.maven.org/maven2/io/github/go-acoustic/eocore/[VERSION]/`
   - Tealeaf: `https://repo1.maven.org/maven2/io/github/go-acoustic/tealeaf/[VERSION]/`
   
   Replace `[VERSION]` with your actual resolved versions (e.g., `2.1.21-beta`, `10.4.18-beta`)

3. **Download configuration files** and place them in `android/app/src/main/assets/`:
   - Right-click on each `.properties` and `.json` file
   - Save to your local assets directory

4. **Verify configuration versions match SDK versions**:
   - Open `EOCoreAdvancedConfig.json` and check `"LibraryVersion"` matches your EOCore version
   - Configuration files should align with the actual SDK versions resolved by Gradle

#### Important Notes

- **Configuration files are static** and do NOT automatically update when SDK versions change
- **Manual download is required** when SDK versions are updated via Gradle dependency resolution
- **Version mismatch** between SDK and configuration files can cause issues
- Always download configuration files that match your resolved SDK versions

## Web Implementation

### Step 1: Create public Folder and Add connect.js

**🚨 CRITICAL**: The `connect.js` file must be placed in the `public/` folder, not the `src/` folder.

#### Why public/ Folder is Required

**The Problem with src/ Folder:**
- ✅ **Development**: Vite dev server serves `/src/connect.js` directly from filesystem  
- ❌ **Production**: Vite build doesn't include files from `src/` unless imported as modules
- ❌ **Result**: WebView cannot load missing `connect.js`, causing `TLT is not defined` errors

**The Solution with public/ Folder:**
- ✅ **Development**: Vite dev server serves static assets from `public/`
- ✅ **Production**: Vite automatically copies `public/` contents to build output
- ✅ **Result**: `connect.js` available in both environments, `TLT` object properly defined

#### Setup Steps

1. **Create public folder** in project root:
   ```bash
   mkdir -p public
   ```

2. **Place connect.js in public folder**:
   ```
   project-root/
   ├── public/
   │   └── connect.js          # ← Must be here!
   ├── src/
   │   └── (other files)
   └── index.html
   ```

3. **Add your Acoustic Connect JavaScript library** to `public/connect.js`:
   ```javascript
   // Add your Acoustic Connect JavaScript SDK code here
   // This should include the connect.js library provided by Acoustic
   ```

### Step 2: Update index.html Reference

Update your `index.html` file to reference the correct path:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
    />
    <title>Vue3 App</title>
    <script src="/connect.js"></script>  <!-- Note: /connect.js NOT /src/connect.js -->
  </head>

  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**Key Changes:**
- ❌ **Wrong**: `<script src="/src/connect.js"></script>`
- ✅ **Correct**: `<script src="/connect.js"></script>`

### Step 3: Verify Build Output

After building, verify the file is included:

```bash
# Build the project
yarn build

# Verify connect.js is in the build output
ls -la dist/connect.js
# Should show: -rw-r--r--  1 user staff 223948 connect.js

# If missing, check your folder structure and HTML reference
```

## Web Browser Testing

### Test Connect.js Web SDK First

Before deploying to mobile devices, test the web implementation in a browser to validate the Connect.js SDK is working properly.

#### 1. Start Development Server

```bash
# Using yarn (preferred for this project)
yarn dev

# Or using npm
npm run serve -- --host 0.0.0.0 --port 3000
```

Expected output:
```
VITE v4.3.9  ready in 366 ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.1.4:3000/
➜  press h to show help
```

#### 2. Open in Browser

Navigate to `http://localhost:3000/` in your web browser.

#### 3. Validate Connect.js Integration

1. **Open Browser Developer Tools** (F12)
2. **Check Console Tab** for:
   - Connect.js library loading successfully
   - No JavaScript errors related to Acoustic Connect
   - SDK initialization messages

3. **Check Network Tab** for:
   - Requests to Acoustic collector endpoints
   - Successful data transmission (look for POST requests to collector URLs)
   - Response codes (200 = success, 4xx/5xx = issues)

#### 4. Test User Interactions

Perform various actions in your Vue app:
- Navigate between pages
- Click buttons
- Fill out forms
- Trigger any custom events

Monitor the Network tab to see if these interactions generate data that's sent to the Acoustic collector.

#### 5. Expected Network Activity

You should see requests to endpoints like:
- `https://lib-us-2.brilliantcollector.com/collectorPost`
- Other Acoustic collector URLs specified in your configuration

#### 6. Troubleshooting Browser Issues

**Common Issues:**
- **CORS Errors**: If you see CORS errors with localhost, proceed to ngrok setup below
- **404/403 Errors**: Verify your application key and collector endpoints
- **No Network Activity**: Check that connect.js is properly loaded and initialized

## Development Setup with ngrok

### When ngrok is Required

If browser testing shows CORS issues or collector endpoint problems with `localhost`, ngrok provides:

1. **Public HTTPS URL**: Collector servers are more likely to accept requests from public domains
2. **CORS Bypass**: Avoids local development CORS issues
3. **Production-like Environment**: Tests your app in a more realistic network environment

### Setup Steps

#### 1. Install ngrok
```bash
# Using Homebrew on macOS
brew install ngrok

# Or download from https://ngrok.com/download
```

#### 2. Authenticate ngrok
1. Create account at https://ngrok.com
2. Get your authtoken from the dashboard
3. Authenticate:
```bash
ngrok authtoken YOUR_AUTHTOKEN
```

#### 3. Start Development Server
```bash
# Using yarn (preferred for this project)
yarn dev

# Or using npm  
npm run serve -- --host 0.0.0.0 --port 3000
```

#### 4. Test in Browser First
Before setting up ngrok, test locally:
1. Open `http://localhost:3000/` in browser
2. Check browser console and network activity
3. Verify connect.js is loading and working
4. Only proceed to ngrok if CORS issues occur

#### 5. Expose via ngrok (if needed)
In a new terminal:
```bash
ngrok http 3000
```

This provides output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

#### 5. Update Capacitor Configuration

Update `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.vue3app",
  webDir: "dist",
  appName: "vue3-app",
  bundledWebRuntime: false,
  server: {
    url: "https://abc123.ngrok.io", // Replace with your actual ngrok URL
    cleartext: false, // Set to false since ngrok provides HTTPS
  },
  ios: {
    allowsLinkPreview: false,
  },
};

export default config;
```

### Testing Order and Workflow

Follow this testing order for efficient debugging:

1. **Web Browser Testing** (fastest iteration)
   - Start with `yarn dev` and test locally at `http://localhost:3000/`
   - Validate connect.js integration and basic functionality
   - Check console and network activity in browser dev tools
   - Fix any JavaScript or configuration issues

2. **ngrok Testing** (if CORS issues occur)
   - Set up ngrok if collector endpoints reject localhost requests
   - Test with public HTTPS URL to simulate production environment
   - Verify data transmission to Acoustic collectors

3. **Android Device Testing** (final validation)
   - Deploy to Android device/emulator
   - Test native Tealeaf SDK integration
   - Verify WebView instrumentation and data capture

## Build and Verification

### Build Commands

```bash
# Navigate to android directory
cd android

# Clean and build
./gradlew clean
./gradlew build

# Or build specific variant
./gradlew assembleDebug
```

### Verify SDK Versions

Check actual SDK versions being used (not the static config files):

```bash
# Check all Acoustic dependencies
./gradlew app:dependencies | grep -i acoustic

# Get detailed dependency information
./gradlew app:dependencyInsight --configuration debugRuntimeClasspath --dependency io.github.go-acoustic:eocore
./gradlew app:dependencyInsight --configuration debugRuntimeClasspath --dependency io.github.go-acoustic:tealeaf
```

### Current SDK Versions (as of this guide)

Based on latest resolution:
- **EOCore**: `2.1.21-beta`
- **Tealeaf**: `10.4.18-beta`
- **Repository**: Maven Central
- **Version Resolution**: Uses `+` (latest) from your build.gradle

### Configuration Files Status

Current configuration files downloaded from Maven Central:
- **EOCoreAdvancedConfig.json**: Version `2.1.21-beta` (matches SDK)
- **TealeafAdvancedConfig.json**: Version for `10.4.18-beta` (matches SDK)
- **TealeafLayoutConfig.json**: Updated layout configuration
- **EOCoreBasicConfig.properties**: Basic configuration for `2.1.21-beta`
- **TealeafBasicConfig.properties**: Basic configuration for `10.4.18-beta`

**Important**: When SDK versions change via Gradle resolution, configuration files must be manually downloaded from Maven Central to match.

### Deploy and Test

```bash
# Sync Capacitor
npx cap sync android

# Run on device/emulator
npx cap run android
```

### Monitor Logs

```bash
# Monitor for SDK initialization
adb logcat | grep -i acoustic
adb logcat | grep -i tealeaf
adb logcat | grep -i eocore
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Connect SDK Import Errors
**Problem**: `import io.github.goacoustic.connect.Connect` not found
**Solution**: Don't use Connect SDK - it doesn't support hybrid apps. Use Tealeaf SDK instead.

#### 2. CORS/Network Errors in Browser
**Problem**: `net::ERR_BLOCKED_BY_CORS` or `net::ERR_CONNECTION_REFUSED`
**Solution**: Use ngrok to provide a public HTTPS URL instead of localhost.

#### 3. Build Failures with API Level 34
**Problem**: `compileSdkVersion` 34 not supported by current Android Gradle Plugin
**Solutions**:
- Update to Android Gradle Plugin 8.1.0 or higher
- Or add to `gradle.properties`: `android.suppressUnsupportedCompileSdk=34`

#### 4. WebView Instrumentation Not Working
**Problem**: No data being captured from WebView
**Solutions**:
- Ensure you're using Tealeaf SDK (lines 44-45), not Connect SDK (line 43)
- Verify `JavaScriptInterface` is properly added
- Check that bridge callbacks are registered on page load

#### 5. Configuration File Version Mismatch
**Problem**: Configuration files don't match SDK versions
**Solutions**:
- Check actual SDK versions: `./gradlew app:dependencies | grep -i acoustic`
- Download matching configuration files from Maven Central:
  - EOCore: `https://repo1.maven.org/maven2/io/github/go-acoustic/eocore/[VERSION]/`
  - Tealeaf: `https://repo1.maven.org/maven2/io/github/go-acoustic/tealeaf/[VERSION]/`
- Replace files in `android/app/src/main/assets/`
- Verify `"LibraryVersion"` in config files matches SDK versions

#### 6. Dependency Resolution Issues
**Problem**: SDK versions not resolving or conflicts
**Solutions**:
```bash
# Clear Gradle cache
rm -rf ~/.gradle/caches/
./gradlew clean --refresh-dependencies

# Check for conflicts
./gradlew app:dependencies
```

#### 7. 🚨 CRITICAL: "TLT is not defined" JavaScript Errors
**Problem**: SDK initializes but no user interaction data is captured
**Symptoms**:
- ✅ Tealeaf library shows as "enabled" in logs
- ✅ EOCore capturing basic events (orientation, screen size)
- ❌ No click, touch, or navigation events
- ❌ JavaScript errors: `Uncaught ReferenceError: TLT is not defined`

**Root Cause**: `connect.js` file is missing from production build

**Debug Commands**:
```bash
# Check for TLT JavaScript errors
adb logcat | grep -E "(JavaScript|TLT.*not.*defined)"

# Verify connect.js in build output
ls -la dist/connect.js
# Should exist - if missing, that's your problem

# Check development vs production behavior
yarn dev    # Check browser network tab for /connect.js loading
yarn build  # Verify dist/connect.js exists
```

**Solution**:
1. **Move connect.js to public/ folder**:
   ```bash
   mkdir -p public
   mv src/connect.js public/connect.js  # If currently in src/
   ```

2. **Update index.html reference**:
   ```html
   <!-- WRONG: Will work in dev but fail in production -->
   <script src="/src/connect.js"></script>
   
   <!-- CORRECT: Works in both dev and production -->
   <script src="/connect.js"></script>
   ```

3. **Rebuild and verify**:
   ```bash
   yarn build
   ls -la dist/connect.js  # Should exist now
   npx cap sync android
   npx cap run android
   ```

**Why This Happens**:
- **Development**: Vite dev server serves files directly from filesystem
- **Production**: Vite only includes files that are imported or in `public/` folder
- **Result**: WebView can't load missing `connect.js`, so `TLT` object is undefined

**Verification**:
After fix, JavaScript errors should disappear and user interaction events should start being captured.

### Gradle Warnings

You may see warnings like:
```
WARNING: Using flatDir should be avoided because it doesn't support any meta-data formats.
```
These are warnings, not errors, and don't affect functionality.

### Emulator vs Real Device Testing

- **Android Emulator**: Use `10.0.2.2` as host IP in capacitor.config.ts
- **Real Device**: Use your machine's actual IP address (e.g., `192.168.1.x`)
- **ngrok**: Works for both emulator and real devices

## Production Deployment

### Prepare for Production

1. **Remove Development Server URL**:
```typescript
// Remove server.url from capacitor.config.ts
const config: CapacitorConfig = {
  appId: "com.example.vue3app",
  webDir: "dist",
  appName: "vue3-app",
  bundledWebRuntime: false,
  // server: { url: "..." }, // Remove this
  ios: {
    allowsLinkPreview: false,
  },
};
```

2. **Build Web Assets**:
```bash
npm run build
```

3. **Sync and Build Android**:
```bash
npx cap sync android
cd android
./gradlew assembleRelease
```

### Production Considerations

1. **Domain Whitelisting**: Ensure your production domain is whitelisted with Acoustic
2. **SSL Certificates**: Production should use HTTPS
3. **SDK Versions**: Consider using specific versions instead of `+` for production stability
4. **Configuration Files**: Update configuration files with production settings
5. **Collector Endpoints**: Verify production collector endpoints are correct

## Key Takeaways

1. **Never use Connect SDK for hybrid apps** - it lacks necessary APIs
2. **Always use EOCore + Tealeaf** for hybrid Capacitor apps
3. **ngrok is essential** for development due to CORS issues
4. **Configuration files are static** - actual SDK versions come from Gradle resolution
5. **JavaScriptInterface is crucial** for WebView instrumentation
6. **API level 34 is required** for latest Android dependencies

## Verification Checklist

- [ ] Connect SDK dependency is commented out (line 43)
- [ ] EOCore and Tealeaf dependencies are active (lines 44-45)
- [ ] MainActivity uses Tealeaf imports, not Connect imports
- [ ] JavaScriptInterface is properly configured
- [ ] Bridge callbacks are registered on page load
- [ ] ngrok is set up and working for development
- [ ] SDK versions verified via Gradle commands
- [ ] **Configuration files downloaded and match SDK versions**
  - [ ] EOCore config files match resolved EOCore version
  - [ ] Tealeaf config files match resolved Tealeaf version
  - [ ] LibraryVersion in config files matches actual SDK versions
- [ ] App builds and deploys successfully
- [ ] Logs show SDK initialization
- [ ] WebView instrumentation is capturing data

This guide represents the complete learning process and final working implementation for Acoustic SDK instrumentation in a Vue3 Capacitor hybrid application.