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

### Framework Versions
- **Vue**: ^3.3.4
- **Vite**: ^4.3.9
- **Capacitor**: ^5.0.5
- **Vuetify**: ^3.3.3
- **TypeScript**: ^5.1.3

> **Note**: You can check your environment by running `npx cap doctor` after installing dependencies.

## Build Setup
``` bash
# install dependencies
yarn

# serve with hot reload at localhost:8080
yarn dev

# build for production with minification
yarn build

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
