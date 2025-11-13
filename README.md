# Vue3 App
A hybrid app template, base on `Vue3`, `Vite`, `Vuetify`, `TypeScript` and `Capacitor`.

## Requirements

This project has been tested with the following versions:

### Development Environment
- **Node.js**: v18.20.4
- **npm**: 10.7.0
- **Yarn**: 1.22.22
- **Java**: OpenJDK 17.0.13 (for Android development)

### iOS Development
- **Xcode**: 16.0.1 (Build 17A400)
- **CocoaPods**: 1.16.2
- **macOS**: Required for iOS development

### Android Development
- **Android Studio**: Latest stable version recommended
- **Gradle**: Managed by project wrapper
- **Android SDK**: API Level 36 (compile and target) - Android 16
- **Minimum SDK**: API Level 22 (Android 5.1)
- **Required SDK Components**:
  - Android SDK Platform 36
  - Android SDK Build-Tools 36.0.0 or higher
  - Android Emulator (optional, for testing)

> **Important**: Make sure to install Android SDK Platform 36 via Android Studio's SDK Manager (Tools → SDK Manager → SDK Platforms). This project targets API Level 36 (Android 16) for maximum compatibility.

### Framework Versions
- **Vue**: ^3.3.4
- **Vite**: ^4.3.9
- **Capacitor**: ^5.0.5
- **Vuetify**: ^3.3.3
- **TypeScript**: ^5.1.3

> **Note**: You can check your environment by running `npx cap doctor` after installing dependencies.

## Build Setup

### 1. Set Up Android SDK (Required for Android builds)

**IMPORTANT: Complete this step BEFORE installing dependencies or building the project.**

Ensure your Android SDK is properly configured by choosing one of these options:

**Option A: Set ANDROID_HOME environment variable (Recommended)**

Add to your `~/.zshrc` or `~/.bash_profile`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

Then reload your shell:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

Verify it's set correctly:
```bash
echo $ANDROID_HOME  # Should output: /Users/YOUR_USERNAME/Library/Android/sdk
```

**Option B: Create local.properties file**

If `ANDROID_HOME` is not set, create `android/local.properties`:
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```
Replace `YOUR_USERNAME` with your actual username.

> **Note**: You only need one of these options. If `ANDROID_HOME` is set, `local.properties` is not required.

### 2. Set Up iOS (Required for iOS builds)

**macOS only** - Ensure you have:
- Xcode 16.0.1 or later installed
- Xcode Command Line Tools: `xcode-select --install`
- CocoaPods: `sudo gem install cocoapods`

### 3. Install Dependencies
``` bash
# install JavaScript dependencies
yarn

# install iOS dependencies (macOS only)
cd ios/App && pod install && cd ../..
```

### 4. Build and Run

``` bash
# serve with hot reload at localhost:8080
yarn dev

# build for production with minification
yarn build

# sync web assets to native projects
npx cap sync

# to run the project on a device or simulator
npx cap run ios
npx cap run android
```

## Acoustic Tealeaf Configuration

This app integrates with Acoustic Tealeaf for analytics and session replay. You'll need to configure the post message URL and app key for both platforms.

### Android Configuration

Edit the file `android/app/src/main/assets/TealeafBasicConfig.properties`:

1. **Post Message URL**: Update the `PostMessageUrl` property:
   ```properties
   PostMessageUrl=https://your-collector-url.com/TealeafTarget.php
   ```

2. **App Key**: Update the `AppKey` property:
   ```properties
   AppKey=your-app-key-here
   ```

### iOS Configuration

Edit the file `ios/App/App/AppDelegate.swift`:

1. **App Key**: Update the `appKey` constant in the `didFinishLaunchingWithOptions` method:
   ```swift
   let appKey: String = "your-app-key-here"
   ```

2. **Post Message URL**: Update the `postMessageURL` constant:
   ```swift
   let postMessageURL: String = "https://your-collector-url.com/TealeafTarget.php"
   ```

3. **Enable Framework**: If you want to use the programmatic configuration, uncomment the line:
   ```swift
   connectApplicationHelperObj.enableFramework(appKey, withPostMessageUrl: postMessageURL)
   ```
   And comment out:
   ```swift
   // connectApplicationHelperObj.enableFramework()
   ```

> **Note**: After making these changes, rebuild the app for the changes to take effect.

### Viewing Your Sessions

This app is currently configured to send data to the Tealeaf On-Premise (TLOP) sandbox environment. To view your captured sessions:

1. Navigate to the TLOP Portal: [https://tealeaf-op-portal.sandbox.acoustic-demo.com/Portal/Default.aspx](https://tealeaf-op-portal.sandbox.acoustic-demo.com/Portal/Default.aspx)
2. Log in with your credentials
3. Your sessions will be available for replay and analysis in the portal

## Troubleshooting

### Android Build Issues

**Error: "Failed to find target with hash string 'android-36'" or API Level errors**

This means you don't have the required Android SDK Platform installed. To fix:

1. Open Android Studio
2. Go to **Tools → SDK Manager**
3. In the **SDK Platforms** tab, check and install:
   - Android 16.0 (API Level 36) - **Required**
4. In the **SDK Tools** tab, ensure you have:
   - Android SDK Build-Tools 36.0.0 or higher
   - Android Emulator (for testing)
5. Click **Apply** and let it install
6. Rebuild the project

**Gradle sync issues**

If you encounter Gradle sync problems:
```bash
cd android
./gradlew clean
./gradlew build
```

### iOS Build Issues

**CocoaPods issues**

If you encounter pod-related errors:
```bash
cd ios/App
pod deintegrate
pod install
```

**Xcode build errors**

Make sure you have the latest Xcode Command Line Tools:
```bash
xcode-select --install
```

## Screen Shots
<p align="center">
<img src="https://github.com/CHENGTIANG/vue3-app/raw/267539a3685b59a760865229d83b99646a641205/screenshots/light_theme.png"
width='45%'>
<img src="https://github.com/CHENGTIANG/vue3-app/raw/267539a3685b59a760865229d83b99646a641205/screenshots/dark_theme.png" width='45%'>
</p>
<p align="center">
<img src="https://github.com/CHENGTIANG/vue3-app/raw/267539a3685b59a760865229d83b99646a641205/screenshots/horizontal.png" width='90%'>
</p>

## License

[MIT License](./LICENSE)
