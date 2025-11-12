# Acoustic SDK Troubleshooting Guide: The TLT Mystery

## 🎯 Problem Statement

**Symptom**: Acoustic Tealeaf SDK appears to initialize correctly on Android, but no user interaction data is being captured despite proper configuration.

**Initial Evidence**:
- ✅ Tealeaf SDK logs show "enabled: 10.4.18-beta"
- ✅ EOCore capturing basic events (orientation, screen size)
- ❌ No click, touch, or navigation events being recorded
- ❌ No data appearing in Acoustic tenant

## 🔍 Detective Work Steps

### Step 1: Validate Basic SDK Status
**Command**:
```bash
adb -s [DEVICE_ID] logcat -d | grep -i "tealeaf\|eocore" | tail -10
```

**Finding**: 
- Tealeaf library enabled and configuration loaded
- EOCore capturing device-level events
- **Missing**: User interaction events

### Step 2: Check Configuration Settings
**Investigation**: Examined `TealeafAdvancedConfig.json`

**Discovery**:
```json
"ClickEventEnabled": false,
"TouchEventEnabled": false,
"NavigationControllerEnabled": false
```

**Action**: Enabled these features (set to `true`)
**Result**: Still no user interaction data

### Step 3: The Critical Breakthrough - JavaScript Bridge Analysis
**Command**:
```bash
adb -s [DEVICE_ID] logcat -d | grep -E "(JavaScript|Bridge|tlBridge|screenCapture|addMessage)" | tail -10
```

**🚨 Smoking Gun Found**:
```
E Capacitor: JavaScript Error: {"type":"js.error","error":{"message":"Uncaught ReferenceError: TLT is not defined","url":"http://localhost/#/nearby","line":1,"col":1,"errorObject":"{}"}}
```

### Step 4: Root Cause Analysis
**The Pattern**:
- Multiple `TLT is not defined` errors across different pages
- MainActivity.java trying to call `TLT.registerBridgeCallbacks()`
- WebView cannot find the `TLT` JavaScript object

**Hypothesis**: Tealeaf JavaScript library not loading in WebView

### Step 5: Verify Script Loading
**Checked**: `index.html` contains `<script src="/src/connect.js"></script>`

**Tested**: 
```bash
find dist/ -name "*connect*"
```
**Result**: No connect.js file in build output

**Confirmed**: Development server (`yarn dev`) works, production build fails

## 🎯 Root Cause Identified

### The Problem
1. **Development**: Vite dev server serves `/src/connect.js` directly from filesystem ✅
2. **Production**: Vite build doesn't include files from `src/` unless imported as modules ❌
3. **WebView**: Cannot load missing `connect.js`, so `TLT` object is undefined
4. **Bridge**: Native code fails when trying to call `TLT.registerBridgeCallbacks()`

### The Fix
1. **Create** `public/` folder in project root
2. **Move** `connect.js` from `src/` to `public/`
3. **Update** `index.html` reference from `/src/connect.js` to `/connect.js`
4. **Rebuild** application

### Why This Works
- Vite automatically copies `public/` contents to build output as static assets
- Ensures `connect.js` availability in both development and production
- WebView can properly load Tealeaf JavaScript library
- `TLT` object becomes available for bridge communication

## 🧪 Verification Steps

### Before Fix
```bash
# Check for JavaScript errors
adb logcat | grep "TLT is not defined"
# Result: Multiple errors

# Check build output
ls dist/connect.js
# Result: File not found
```

### After Fix
```bash
# Check for JavaScript errors
adb logcat | grep "TLT is not defined"
# Result: No errors

# Check build output
ls dist/connect.js
# Result: File exists

# Test user interactions
# Result: Click, touch, navigation events captured
```

## 🔧 Key Debugging Commands

### Essential Logcat Filters
```bash
# Basic SDK status
adb logcat -s "Tealeaf" "EOCore"

# JavaScript/Bridge issues
adb logcat | grep -E "(JavaScript|Bridge|tlBridge|TLT)"

# Capacitor WebView errors
adb logcat | grep "Capacitor.*Error"

# Real-time monitoring
adb logcat -c && adb logcat | grep -i "tealeaf\|javascript"
```

### Build Verification
```bash
# Check if assets are included
find dist/ -name "*connect*"

# Verify public folder copying
ls -la dist/ | grep -E "(js|css|html)"

# Compare dev vs prod
yarn dev    # Check network tab for /src/connect.js
yarn build  # Check dist/connect.js exists
```

## 💡 Lessons Learned

### Critical Insights
1. **Development vs Production**: What works in dev doesn't always work in production builds
2. **JavaScript Bridge Dependencies**: Hybrid apps require the JavaScript library to be properly loaded
3. **Vite Build Behavior**: Only known/imported files get included in builds
4. **Logcat Filtering**: Specific filters reveal different types of issues

### Warning Signs to Watch For
- ✅ Native SDK initialized but no interaction data
- 🚨 `TLT is not defined` JavaScript errors
- 🚨 WebView bridge callback failures
- 🚨 Missing JavaScript files in build output

### Best Practices
1. **Always verify production builds** match development behavior
2. **Use specific logcat filters** to find different error types
3. **Place third-party scripts in `public/`** folder for static asset inclusion
4. **Test WebView JavaScript** separately from native SDK functionality

## 📋 Additional Configuration Notes

### TealeafAdvancedConfig.json
**Unusual Requirement**: Had to manually enable basic capture features:
```json
{
  "ClickEventEnabled": true,
  "TouchEventEnabled": true,
  "NavigationControllerEnabled": true
}
```

**Note**: This is atypical - default configurations should usually work out-of-the-box. May indicate:
- Beta SDK configuration differences
- Hybrid app vs native app config mismatch
- Need for Acoustic support consultation

### Platform Differences
- **Android**: Requires manual WebView bridge setup in MainActivity.java
- **iOS**: Uses unified AcousticConnectDebug framework with built-in WebView integration
- **Web**: Direct JavaScript library usage

---

**Created**: September 21, 2025  
**Versions**: EOCore 2.1.21-beta, Tealeaf 10.4.18-beta  
**Platform**: Vue3 + Capacitor hybrid app