# Replay Session Structure Issues - Hybrid Mobile Apps

**Date**: October 13, 2025  
**Project**: Vue3 Hybrid Mobile App (Capacitor)  
**Tealeaf Versions**:
- Web: Connect 6.4.157
- Android: EOCore 2.1.22-beta, Tealeaf 10.4.19-beta
- iOS: EOCore 2.3.323, Tealeaf 10.6.326

---

## Executive Summary

Replay sessions for hybrid mobile apps (Capacitor/Cordova) show significant differences in session structure between web, Android, and iOS platforms. The replay server correctly handles SPA (Single Page Application) screen navigation for web sessions, but fails to properly nest web view screens within native container screens for mobile platforms.

---

## Issue Overview

### Problem Statement
The Acoustic Tealeaf replay server does not properly represent the session structure for hybrid mobile applications. Native container screens (MainActivity on Android, ViewController on iOS) are treated as discrete session steps, while the actual SPA screen navigation within the web view is not properly nested or displayed as child screens.

### Impact
- **Session comprehension**: Analysts cannot understand the user's navigation flow within the app
- **Event context**: User interactions appear disconnected from the screens where they occurred
- **Replay accuracy**: The replay doesn't accurately represent the actual user experience
- **Cross-platform analysis**: Inconsistent session structures make it difficult to compare behavior across platforms

---

## Detailed Findings

### 1. Web Session (Expected Behavior)

**Platform**: Desktop/Mobile Web Browser  
**Session Duration**: 00:01:19  
**OS**: Mac OS 10.15.7  
**SDK Version**: 6.4.157

#### Session Structure
```
Session Timeline:
├── 1. #/              (Root)
├── 2. #/              (Root again)
├── 3. #/home          (Home screen)
│   ├── Click - Carousel slide 1 of 4
│   ├── Click - Carousel slide 2 of 4
│   ├── Click - Carousel slide 3 of 4
│   ├── Click - Carousel slide 4 of 4
│   └── Click - Favorites
├── 4. #/favorites     (Favorites screen)
├── 5. #/nearby        (Nearby screen)
├── 6. #/me            (Me/Profile screen)
└── 7. #/signin        (Sign-in screen)
```

#### Observations
✅ **Correct Behavior**:
- Each SPA route change creates a new session step
- Screen hierarchy is clear and logical
- User navigation flow is easily understood
- Click events are properly associated with their parent screens
- Accessibility IDs captured correctly (e.g., `carousel-item-8`)
- HTML ID attributes properly recorded

#### Screen Metadata
- **Screen identification**: Hash-based routing (`#/home`, `#/favorites`, etc.)
- **Step count**: 7 discrete steps (screens)
- **Event nesting**: All events properly nested under their respective screen steps
- **DOM capture**: Full DOM structure captured for each screen

---

### 2. Android Session (Issue: Flat Structure)

**Platform**: Android (Google Pixel 5)  
**Session Duration**: 00:00:42  
**OS Version**: Android 14  
**SDK Version**: Tealeaf 10.4.19-beta  
**App**: vue3app v1.0

#### Session Structure (Actual)
```
Session Timeline:
└── 1. MainActivity (12:35:41 PM)
    ├── Orientation change
    ├── Unload
    ├── Click - com.example.vue3app:id/...
    ├── Tap - span-[["bottom-nav-favorites"]]
    ├── Unload
    ├── Click - com.example.vue3app:id/...
    ├── Tap - i-[["favorites-like-btn-favorite-road-trips"]]
    ├── Tap - i-[["favorites-bookmark-mark-..."]]
    ├── Click - com.example.vue3app:id/...
    ├── Tap - span-[["bottom-nav-nearby"]]
    ├── ...
    └── (All subsequent interactions flattened under MainActivity)
```

#### Session Structure (Expected)
```
Session Timeline:
└── 1. MainActivity
    ├── 1.1 WebView: Home (#/home)
    │   ├── Click - Carousel slide interactions
    │   └── Click - Favorites button
    ├── 1.2 WebView: Favorites (#/favorites)
    │   ├── Tap - favorites-like-btn-favorite-road-trips
    │   └── Tap - favorites-bookmark-btn-...
    ├── 1.3 WebView: Nearby (#/nearby)
    │   └── Tap - nearby-like-btn-...
    ├── 1.4 WebView: Me (#/me)
    └── 1.5 WebView: Sign-in (#/signin)
```

#### Observations
❌ **Issues**:
- **Single MainActivity step**: All app activity collapsed into one native screen
- **No web view screen nesting**: SPA route changes not recognized as distinct screens
- **Flat event structure**: All gestures/clicks appear as siblings under MainActivity
- **Loss of context**: Cannot determine which screen a user was on when they tapped
- **Orientation changes intermixed**: Native events mixed with web view events

✅ **Working Elements**:
- Element IDs captured correctly (e.g., `favorites-like-btn-favorite-road-trips`)
- Gesture events (tap, click, double-click) recorded
- Unload events detected
- Hierarchical IDs working (preventing XPath fallback)

#### Technical Details
- **Native container**: `MainActivity` (com.example.vue3app)
- **Web view**: Capacitor WebView embedded in MainActivity
- **Event types**: Click, Tap, Double-click, Unload, Orientation change
- **ID format**: Element IDs wrapped in arrays: `i-[["favorites-like-btn-..."]]`

---

### 3. iOS Session (Issue: Two-Step Structure)

**Platform**: iOS (iPhone/iPad)  
**Session Duration**: 00:00:26  
**OS Version**: iOS 18.6  
**SDK Version**: Tealeaf 10.6.325  
**App**: App v1

#### Session Structure (Actual)
```
Session Timeline:
├── 1. CAPBridgeViewController (9:51:47 AM)
│   └── (Initial view controller load)
└── 2. UITrackingElementWindowController (9:51:51 AM)
    ├── Click - [web,0]-Favorites
    ├── Tap - i-[["bottom-nav-favorites"]]
    ├── Unload
    ├── Click - [web,0]-favorites-like-btn-...
    ├── Tap - button-favorites-like-btn-...
    ├── Click - [web,0]-favorites-share-btn-...
    ├── Tap - span-[["bottom-nav-nearby"]]
    ├── Unload
    ├── Click - [web,0]-Nearby
    ├── Tap - span-[["bottom-nav-nearby"]]
    └── (All subsequent interactions under UITrackingElementWindowController)
```

#### Session Structure (Expected)
```
Session Timeline:
├── 1. CAPBridgeViewController
│   └── (Capacitor bridge initialization)
└── 2. WebView Container
    ├── 2.1 Home (#/home)
    │   ├── Click - Carousel interactions
    │   └── Click - Favorites button
    ├── 2.2 Favorites (#/favorites)
    │   ├── Tap - favorites-like-btn-...
    │   ├── Tap - favorites-bookmark-btn-...
    │   └── Tap - favorites-share-btn-...
    ├── 2.3 Nearby (#/nearby)
    │   └── Tap - nearby-like-btn-...
    ├── 2.4 Me (#/me)
    └── 2.5 Sign-in (#/signin)
```

#### Observations
❌ **Issues**:
- **Two native steps**: CAPBridgeViewController + UITrackingElementWindowController
- **No web view screen nesting**: SPA navigation not recognized as child screens
- **Flat event structure**: All web interactions under UITrackingElementWindowController
- **Loss of navigation context**: Cannot see user's screen-to-screen flow
- **Unload events present but ignored**: Unload suggests screen transitions not captured

✅ **Working Elements**:
- Element IDs captured with `[web,0]` prefix
- Tap and Click events recorded
- Hierarchical IDs working (e.g., `button-favorites-like-btn-...`)
- Unload events firing (indicating SPA transitions happening)

#### Technical Details
- **Native containers**: 
  - `CAPBridgeViewController` (Capacitor bridge initialization)
  - `UITrackingElementWindowController` (UI tracking window)
- **Web view**: WKWebView embedded in Capacitor
- **Event types**: Click, Tap, Unload
- **ID format**: `[web,0]-{elementId}` or `i-[["{elementId}"]]`

---

## Reproduction Steps for Engineering

To reproduce this issue, engineering should test all three platforms using the same app and user flow:

### Prerequisites
```bash
# Clone/access the test application
cd vue3-app-master-tealeaf.10.4.18-beta-20250921

# Install dependencies
yarn install

# Install Capacitor CLI (if not already installed)
npm install -g @capacitor/cli
```

### 1. Testing Web Platform (Expected Behavior)

This demonstrates the **correct** replay session structure that should be replicated on mobile platforms.

**Steps**:
1. **Start the development server**:
   ```bash
   yarn serve
   # Server will run on http://localhost:4173
   ```

2. **Set up ngrok tunnel** (required - collector may reject localhost SDK posts):
   ```bash
   # In a separate terminal
   ngrok http 127.0.0.1:4173
   # Note the public URL (e.g., https://xxxx.ngrok.app)
   ```

3. **Access the application**:
   - Open browser to the ngrok URL: `https://xxxx.ngrok.app`
   - Open browser DevTools to verify SDK initialization

4. **Perform test flow**:
   - **Step 1**: Load root page (`#/`)
   - **Step 2**: Navigate to Home (`#/home`)
     - Click through carousel slides (1 → 2 → 3 → 4)
     - Click "Favorites" button
   - **Step 3**: Navigate to Favorites (`#/favorites`)
     - Click like button on an item
     - Click bookmark button
     - Click share button
   - **Step 4**: Navigate to Nearby (`#/nearby`)
     - Click like button on an item
   - **Step 5**: Navigate to Me (`#/me`)
   - **Step 6**: Click Sign-in
   - **Step 7**: Navigate to Sign-in page (`#/signin`)

5. **End session**:
   - Close browser tab or wait for session timeout

6. **Verify in Replay UI**:
   - ✅ Should see **7 distinct session steps** (one per route)
   - ✅ Each step should show the correct route: `#/`, `#/home`, `#/favorites`, etc.
   - ✅ User interactions nested under correct parent screen
   - ✅ Navigation flow is clear and logical

**Expected Result**: Session shows proper screen hierarchy with 7 steps representing SPA navigation.

---

### 2. Testing Android Platform (Demonstrates Issue)

**Prerequisites**:
- Android Studio installed
- Android device or emulator (Android 14+ recommended)
- USB debugging enabled (physical device) or emulator running

**Steps**:
1. **Sync Gradle dependencies**:
   ```bash
   cd android
   ./gradlew clean :app:assembleDebug
   cd ..
   ```

2. **Update Capacitor configuration** (if needed):
   ```bash
   npx cap sync android
   ```

3. **Connect Android device**:
   ```bash
   # Verify device is connected
   adb devices
   # Should show your device listed
   ```

4. **Deploy and run the app**:
   ```bash
   npx cap run android
   # This will:
   # - Build the Android app
   # - Install on connected device
   # - Launch the app
   ```

5. **Perform the same test flow**:
   - Launch app (MainActivity loads)
   - Navigate through the same screens as web test:
     - Home → Carousel interactions → Favorites button
     - Favorites → Like/Bookmark/Share interactions
     - Nearby → Like button
     - Me → Sign-in
     - Sign-in page
   - Close app or background it

6. **Verify in Replay UI**:
   - ❌ Will see **1 session step**: "MainActivity"
   - ❌ All user interactions flattened under MainActivity
   - ❌ No screen hierarchy or navigation context
   - ❌ Cannot determine user's actual navigation flow

**SDK Versions**:
- EOCore: `2.1.22-beta`
- Tealeaf: `10.4.19-beta`

**Configuration**: Check `android/app/build.gradle` for:
```gradle
dependencies {
    implementation 'io.github.go-acoustic:eocore:2.1.22-beta'
    implementation 'io.github.go-acoustic:tealeaf:10.4.19-beta'
}
```

---

### 3. Testing iOS Platform (Demonstrates Issue)

**Prerequisites**:
- macOS with Xcode installed (Xcode 15+ recommended)
- iOS device or simulator (iOS 18+ recommended)
- iOS device connected via USB (physical device) or simulator running

**Steps**:
1. **Install CocoaPods dependencies**:
   ```bash
   cd ios/App
   pod install
   cd ../..
   ```

2. **Update Capacitor configuration** (if needed):
   ```bash
   npx cap sync ios
   ```

3. **Open Xcode project**:
   ```bash
   npx cap open ios
   # This opens the Xcode workspace
   ```

4. **Configure signing** (if needed):
   - In Xcode, select the App target
   - Go to "Signing & Capabilities"
   - Select your development team
   - Ensure signing is configured properly

5. **Deploy and run the app**:
   - **Option A** - From command line:
     ```bash
     npx cap run ios
     ```
   
   - **Option B** - From Xcode:
     - Select target device/simulator
     - Click Run (⌘+R)

6. **Perform the same test flow**:
   - Launch app (CAPBridgeViewController loads)
   - Navigate through the same screens as web test:
     - Home → Carousel interactions → Favorites button
     - Favorites → Like/Bookmark/Share interactions
     - Nearby → Like button
     - Me → Sign-in
     - Sign-in page
   - Close app or background it

7. **Verify in Replay UI**:
   - ❌ Will see **2 session steps**: 
     - "CAPBridgeViewController" (initialization)
     - "UITrackingElementWindowController" (all interactions)
   - ❌ All web interactions flattened under UITrackingElementWindowController
   - ❌ No screen hierarchy for SPA navigation
   - ❌ Cannot determine user's actual navigation flow

**SDK Versions**:
- EOCore: `2.3.323` (via AcousticConnectDebug wrapper)
- Tealeaf: `10.6.326` (via AcousticConnectDebug wrapper)

**Configuration**: Check `ios/App/Podfile` for:
```ruby
pod 'AcousticConnectDebug'
# This wrapper pulls in EOCoreDebug and TealeafDebug
```

---

### Comparison Summary

After completing all three tests with the **identical user flow**, engineering should observe:

| Platform | Session Steps | Screen Hierarchy | Navigation Context | Element IDs |
|----------|--------------|------------------|-------------------|-------------|
| **Web** | 7 steps (✅) | Proper nesting (✅) | Clear flow (✅) | Standard format (✅) |
| **Android** | 1 step (❌) | Flat structure (❌) | Lost context (❌) | `[web,0]` prefix (✅) |
| **iOS** | 2 steps (❌) | Flat structure (❌) | Lost context (❌) | `[web,0]` prefix (✅) |

**Key Finding**: The web view element IDs are properly captured on mobile platforms (indicating JavaScript SDK is working), but the native SDKs fail to translate web view navigation events into proper session structure.

---

## Root Cause Analysis

### Web Session Behavior
The web implementation uses hash-based routing (`#/home`, `#/nearby`, etc.) which triggers screenview events properly recognized by the Tealeaf JavaScript SDK. Each route change:
1. Fires a `hashchange` or `popstate` event
2. Triggers Tealeaf's screenview capture
3. Creates a new session step in the replay timeline

### Hybrid App Behavior
In hybrid apps (Capacitor/Cordova), the native SDK wraps the web view:

**Android**:
1. Native `MainActivity` is the single activity container
2. JavaScript code runs inside a WebView
3. Hash routing changes occur within the WebView
4. Native SDK sees only MainActivity (no window/document navigation events)
5. Result: All events flattened under MainActivity

**iOS**:
1. Native `CAPBridgeViewController` initializes Capacitor
2. `UITrackingElementWindowController` manages UI tracking
3. JavaScript code runs inside WKWebView
4. Hash routing changes occur within the WKWebView
5. Native SDK sees only the view controllers (no navigation events propagated)
6. Result: All events flattened under UITrackingElementWindowController

### Missing Integration
The native SDKs (Android & iOS) are **not** detecting or forwarding SPA navigation events from the embedded web view to create proper session structure in the replay server.

---

## Proposed Solutions

### Option 1: Ignore Native Containers When Web View Detected (Recommended)

**Approach**: When the replay server detects a hybrid app session with web view activity, automatically collapse/ignore the native container screens and promote web view screens to top-level steps.

**Implementation**:
```
Detection criteria:
- Session has exactly 1 MainActivity (Android) or 2 native screens (iOS)
- All user interactions have web-originated element IDs
- Hash-based route changes detected via JavaScript events
- DOM capture data present

Action:
- Hide native container step(s) from timeline
- Extract web view screen transitions from JavaScript events
- Create top-level steps for each SPA route
- Nest gestures/clicks under their respective web screens
```

**Benefits**:
- No SDK changes required
- Replay server logic only
- Maintains backward compatibility
- Works for all hybrid frameworks (Capacitor, Cordova, Ionic)

**Drawbacks**:
- Heuristic-based detection may have edge cases
- Requires replay server update/configuration

---

### Option 2: Enhanced Native SDK → Web View Bridge

**Approach**: Extend the native SDKs to listen for JavaScript events from the web view and forward them as native screenview events.

**Implementation**:

**Android (MainActivity.java or Kotlin)**:
```java
// Listen for JavaScript bridge messages from web view
webView.addJavascriptInterface(new Object() {
    @JavascriptInterface
    public void notifyScreenChange(String screenName, String url) {
        // Forward to Tealeaf native SDK
        TLFApplicationHelper.logScreenViewContext(screenName, url);
    }
}, "TealeafBridge");
```

**iOS (ViewController.swift)**:
```swift
// Add WKWebView message handler
webView.configuration.userContentController.add(self, name: "tealeafScreenChange")

func userContentController(_ userContentController: WKUserContentController, 
                          didReceive message: WKScriptMessage) {
    if message.name == "tealeafScreenChange",
       let body = message.body as? [String: String],
       let screenName = body["screenName"],
       let url = body["url"] {
        // Forward to Tealeaf native SDK
        TLFCustomEvent.logScreenViewContext(screenName, referrer: url)
    }
}
```

**JavaScript (Connect config)**:
```javascript
// Send screen change events to native bridge
window.addEventListener('hashchange', function() {
    const screenName = window.location.hash.substring(1) || 'home';
    const url = window.location.href;
    
    // Android
    if (window.TealeafBridge) {
        window.TealeafBridge.notifyScreenChange(screenName, url);
    }
    
    // iOS
    if (window.webkit?.messageHandlers?.tealeafScreenChange) {
        window.webkit.messageHandlers.tealeafScreenChange.postMessage({
            screenName: screenName,
            url: url
        });
    }
});
```

**Benefits**:
- Proper native screen tracking
- Works with any SPA routing mechanism
- Maintains full native + web context
- Future-proof for other hybrid scenarios

**Drawbacks**:
- Requires SDK updates (Android + iOS)
- Requires app code changes (bridge setup)
- More complex implementation
- Requires coordination between native and web SDKs

---

### Option 3: Web-Only Mode for Hybrid Apps

**Approach**: Configure hybrid apps to use **only** the JavaScript SDK for tracking, disabling native SDK event capture entirely.

**Implementation**:

**Configuration flag** (Capacitor config or native SDK init):
```json
{
  "tealeaf": {
    "hybridMode": "webOnly",
    "disableNativeCapture": true
  }
}
```

**Benefits**:
- Simplest solution
- Consistent session structure across all platforms
- No replay server changes needed
- Works immediately with existing JavaScript SDK

**Drawbacks**:
- Loses native-specific context (orientation, app lifecycle, native gestures)
- May miss some events that only native SDK captures
- Still requires MainActivity/ViewController container in session
- Not ideal for apps with native UI components

---

### Option 4: Post-Processing Session Data

**Approach**: Create a post-processing script or tool that restructures session data after collection but before replay.

**Implementation**:
```
Session analyzer:
1. Identify hybrid app sessions (detection heuristics)
2. Parse all Click/Tap events for element IDs
3. Correlate Unload events with screen transitions
4. Extract hash routing changes from URLs
5. Reconstruct proper screen hierarchy
6. Generate corrected session JSON
7. Replace original session with corrected version
```

**Benefits**:
- No SDK changes required
- Works retroactively on existing sessions
- Can be customized per customer
- Allows manual intervention if needed

**Drawbacks**:
- Complex parsing logic required
- Not real-time (replay may be delayed)
- Error-prone for edge cases
- Maintenance burden

---

## Recommended Approach

**Primary Recommendation**: **Option 1 (Ignore Native Containers)** combined with **Option 2 (Enhanced Bridge)** for long-term solution.

### Phase 1 (Immediate - Replay Server)
Implement Option 1 on the replay server:
- Detect hybrid app sessions automatically
- Collapse native container screens when web activity detected
- Promote web view screens to top-level steps
- Parse hash routing from element IDs and URLs

### Phase 2 (Long-term - SDK Enhancement)
Implement Option 2 in native SDKs:
- Add JavaScript bridge for screen change events
- Forward SPA navigation to native SDK
- Create proper native screenview events for each route
- Document hybrid app integration pattern

### Phase 3 (Validation)
- Test with Capacitor, Cordova, Ionic apps
- Validate session structure matches web behavior
- Ensure all gestures properly nested
- Verify backward compatibility

---

## Testing Recommendations

### Test Scenarios

**1. Single-Page Navigation**
- Navigate through all screens: Home → Favorites → Nearby → Me → Sign-in
- Verify: Each screen appears as a distinct step

**2. Deep Interaction**
- Interact with multiple elements on one screen (like, bookmark, share)
- Verify: All events nested under correct screen step

**3. Back Navigation**
- Navigate forward, then use back button/gesture
- Verify: Proper screen transition tracking

**4. Mixed Content**
- Apps with both native and web screens
- Verify: Both types properly tracked and nested

**5. Orientation Changes**
- Rotate device during session
- Verify: Orientation events don't disrupt screen hierarchy

### Success Criteria

✅ Session structure matches web session format  
✅ Each SPA route = one session step  
✅ All gestures nested under correct parent screen  
✅ Navigation flow is clear and logical  
✅ No loss of native context (when needed)  
✅ Backward compatible with non-hybrid apps  

---

## References

### Session Data
- **Web Session**: Mac OS 10.15.7, Tealeaf 6.4.157, 7 screens, 1 minute 19 seconds
- **Android Session**: Android 14, Tealeaf 10.4.19-beta, 1 screen (MainActivity), 42 seconds
- **iOS Session**: iOS 18.6, Tealeaf 10.6.325, 2 screens (view controllers), 26 seconds

### Related Documentation
- [Acoustic Instrumentation Guide](../Acoustic-Instrumentation-Guide.md)
- [Replay Optimization Guide](./REPLAY_OPTIMIZATION_GUIDE.md)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Tealeaf Hybrid App Support](https://developer.goacoustic.com/acoustic-exp-analytics/docs)

---

## Next Steps

### Immediate Actions
1. **File bug report** with Acoustic Engineering documenting the issue
2. **Request timeline** for Option 1 (replay server fix) vs Option 2 (SDK enhancement)
3. **Test workarounds** using web-only mode or custom bridge implementation
4. **Document findings** with actual session exports for engineering

### Questions for Engineering
1. Is the replay server capable of detecting hybrid apps automatically?
2. Can the native SDKs be enhanced to forward web view navigation events?
3. What is the recommended pattern for hybrid app instrumentation?
4. Are there existing customers using hybrid apps successfully? How?
5. Will the next major release address hybrid app session structure?

---

**Document Version**: 1.0  
**Last Updated**: October 13, 2025  
**Author**: Development Team  
**Status**: Active Issue - Awaiting Engineering Response
