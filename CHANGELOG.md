# Changelog

All notable changes to this Vue3 hybrid app project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-10-08

### Added - Connect/Tealeaf Analytics Enhancements

#### 🎯 **Unique Element IDs for Better Tracking**
- Added comprehensive unique IDs to all interactive elements across the application
- Implemented content-based identifiers instead of array index-based IDs for consistency
- Enhanced Connect data collection to capture meaningful element identifiers instead of XPath selectors
- **Added hierarchical parent IDs** to prevent event bubbling issues when users don't tap precisely

**Components Updated:**
- **FavoritesPage**: Added content-based IDs for cards, images, and action buttons
  - Cards: `favorites-card-{title-kebab-case}`
  - Images: `favorites-image-{title-kebab-case}`
  - Action buttons: `favorites-like-btn-{title-kebab-case}`, `favorites-bookmark-btn-{title-kebab-case}`, `favorites-share-btn-{title-kebab-case}`
  - **Hierarchical IDs**: `col-favorites-{title}`, `actions-favorites-{title}`, `favorites-title-{title}`
  
- **HomePage**: Added IDs for carousel and gallery elements
  - Container: `home-container`
  - Carousel: `home-carousel`
  - Carousel items: `home-carousel-item-{index}`
  - Gallery images: `home-gallery-image-{index}`
  - **Hierarchical IDs**: `col-home-gallery-{index}`
  
- **HomeLayout**: Added navigation-specific IDs
  - App bar: `main-app-bar`
  - Navigation toggle: `nav-drawer-toggle`
  - App title: `app-title`
  - Navigation drawer: `nav-drawer`
  - Drawer items: `nav-drawer-home`, `nav-drawer-favorites`, `nav-drawer-nearby`, `nav-drawer-me`
  - Bottom navigation: `bottom-nav`
  - Bottom nav buttons: `bottom-nav-home`, `bottom-nav-favorites`, `bottom-nav-nearby`, `bottom-nav-me`
  
- **NearbyPage**: Added content-based IDs similar to FavoritesPage
  - Cards: `nearby-card-{title-kebab-case}`
  - Images: `nearby-image-{title-kebab-case}`
  - Action buttons: `nearby-like-btn-{title-kebab-case}`, `nearby-bookmark-btn-{title-kebab-case}`, `nearby-share-btn-{title-kebab-case}`
  - **Hierarchical IDs**: `col-nearby-{title}`, `actions-nearby-{title}`, `nearby-title-{title}`
  
- **MePage**: Added profile and settings IDs
  - Container: `me-container`
  - Profile list: `me-profile-list`
  - Profile items: `me-profile-header`, `me-moments-item`, `me-settings-item`, `me-about-item`
  - Sign out button: `me-sign-out-btn`
  - **Hierarchical IDs**: `me-profile-header-title`, `me-moments-title`, `me-settings-title`, `me-about-title`
  
- **SigninPage**: Added form-specific IDs
  - Container: `signin-container`
  - Title: `signin-title`
  - Form fields: `signin-username-field`, `signin-password-field`
  - Buttons: `signin-submit-btn`, `signin-github-btn`
  - **Hierarchical IDs**: `signin-layout`, `signin-form-area`

#### 🔧 **Title-to-ID Conversion Utility**
- Added `titleToId()` function to convert card titles to consistent kebab-case IDs
- Ensures persistent element identification regardless of array reordering
- Removes special characters and normalizes spacing for HTML-valid IDs

**Example transformations:**
- `"Pre-fab homes"` → `"pre-fab-homes"`
- `"Favorite road trips"` → `"favorite-road-trips"`
- `"Best airlines"` → `"best-airlines"`

#### 🎯 **Event Bubbling Prevention**
- **Problem**: When users don't tap precisely on interactive elements, events bubble up to parent containers, resulting in generic XPath captures like `[[\"nearby-like-btn-favorite-road-trips\"],[\"span\",2],[\"i\",0]]`
- **Solution**: Added hierarchical IDs to parent containers at multiple DOM levels
- **Result**: Even imprecise taps now capture meaningful identifiers like `actions-nearby-favorite-road-trips` or `col-nearby-favorite-road-trips`

**Hierarchical ID Structure:**
- **Column level**: `col-{page}-{content-id}` (e.g., `col-nearby-favorite-road-trips`)
- **Actions container**: `actions-{page}-{content-id}` (e.g., `actions-favorites-pre-fab-homes`)
- **Title elements**: `{page}-title-{content-id}` (e.g., `nearby-title-best-airlines`)
- **Form areas**: `{page}-form-area`, `{page}-layout` for structural containers

#### 🎨 **CSS Build Optimization for Replay**
- Configured Vite to generate a single consolidated CSS file instead of multiple split files
- Implemented predictable CSS file naming for easier replay server integration
- Enhanced build configuration for optimal Connect replay functionality

**Build Configuration Changes:**
- Added `cssCodeSplit: false` to force all CSS into one file
- Implemented custom `assetFileNames` function for consistent CSS naming
- CSS file now outputs as `app-styles.css` (fixed name, no hash)
- All Vuetify styles, custom styles, and component styles consolidated into single file

**Before:**
```
dist/assets/index-544225a4.css (multiple files in development)
```

**After:**
```
dist/assets/app-styles.css (single, predictably named file)
```

### Benefits

#### 📊 **Analytics Improvements**
- **Better Element Identification**: Connect now captures meaningful IDs like `favorites-like-btn-pre-fab-homes` instead of complex XPath selectors
- **Consistent Tracking**: Element IDs remain stable even when array data changes or components are reordered
- **Enhanced Business Insights**: Analytics data now shows specific product/category interactions rather than array positions

#### 🔄 **Replay Functionality**
- **Single CSS File**: Simplified CSS delivery with one consolidated stylesheet
- **Predictable Naming**: Fixed filename (`app-styles.css`) enables reliable replay server automation
- **Reduced Network Requests**: Fewer HTTP requests for styles in production builds
- **Easier Integration**: Replay servers can consistently reference the same CSS filename

#### 🚀 **Development Experience**
- **Maintainable IDs**: Content-based identifiers are self-documenting and meaningful
- **Build Consistency**: Deterministic CSS file naming across builds
- **Better Debugging**: Easier to identify specific UI elements in analytics reports

### Technical Details

#### Dependencies Updated
- Vite configuration enhanced with custom build options
- No new dependencies added - leveraged existing Vite and Vue capabilities

#### File Structure
```
src/
├── pages/
│   ├── home/
│   │   ├── FavoritesPage.vue (enhanced with unique IDs)
│   │   ├── HomePage.vue (enhanced with unique IDs)
│   │   ├── HomeLayout.vue (enhanced with unique IDs)
│   │   ├── NearbyPage.vue (enhanced with unique IDs)
│   │   └── MePage.vue (enhanced with unique IDs)
│   └── SigninPage.vue (enhanced with unique IDs)
├── vite.config.ts (updated with CSS build optimizations)
└── CHANGELOG.md (this file)
```

#### Build Output
```
dist/
├── assets/
│   ├── app-styles.css (consolidated CSS - 652.91 kB)
│   ├── index-415f11a8.js (main JavaScript bundle)
│   └── [other assets...]
└── index.html (references single CSS file)
```

### Migration Notes
- No breaking changes - all existing functionality preserved
- Element IDs are additive - no existing behavior modified
- CSS consolidation is production build only - development mode unchanged
- Capacitor integration remains the same - uses optimized build output

#### 🔄 **DOM Capture Event Optimization**
- **Resolved duplicate event issue**: Modified Connect configuration to eliminate duplicate click/tap events on every interaction
- **Renamed click events**: Changed `click` to `disabled-click` in replay events to prevent clicks from being captured
- **Replaced DOM capture triggers**: Updated DOM capture triggers to use `tap` instead of `click` events

**Problem Addressed:**
- Previously seeing both `click` and `tap` events for every user interaction
- Click event would trigger DOM capture, then tap event (type 11) would overlay on the next screen
- Created duplicate event data and replay overlay issues

**Solution Implemented:**
1. **Replay Events Configuration**: Renamed `click` to `disabled-click` to prevent click event capture
2. **DOM Capture Triggers**: Replaced `click` with `tap` as the DOM capture trigger
3. **Single Event Handler**: Tap events (type 11) now handle both DOM capture and replay functionality

**Benefits:**
- **Eliminated duplicate events**: Single tap event per interaction instead of click + tap
- **Improved replay quality**: Tap events properly capture mobile interactions without overlay issues
- **Reduced data overhead**: Less redundant event data in Connect captures
- **Better mobile UX**: Native tap events align with touch interface expectations

**Technical Details:**
- Tap events are already configured in gestures module and remain active
- DOM capture now exclusively triggered by tap events
- Uncertain if tap needs to be added to replay events or if existing gestures configuration is sufficient

#### 🎯 **Replay Infrastructure Improvements**

##### **Font Delivery Optimization**
- **Problem Resolved**: Material Design Icons appeared as squares in replay due to missing font files
- **Solution**: Updated font URLs in consolidated CSS to use Acoustic Content Manager
- **Implementation**: Configured CSS minification to be disabled (`minify: false` in Vite config)

**Font URL Mappings Updated:**
```css
/* Before: Relative paths causing 404s in replay */
src: url("./materialdesignicons-webfont.67d24abe.eot?v=7.2.96");

/* After: Absolute URLs from Acoustic Content Manager */
src: url("https://content-us-1.content-cms.com/8c9c656f-5273-48cd-8c92-c5e1f2470200/dxdam/5f/5fec6581-5a04-4ae4-ab27-8e24d6fe3483/materialdesignicons-webfont.67d24abe.eot?v=7.2.96");
```

**Font Files Migrated to Content Manager:**
- `materialdesignicons-webfont.a58ecb54.ttf` → Content Manager with UUID `35af61b5-f26a-4e20-999e-7cc676a8b14b`
- `materialdesignicons-webfont.67d24abe.eot` → Content Manager with UUID `5fec6581-5a04-4ae4-ab27-8e24d6fe3483`  
- `materialdesignicons-webfont.c1c004a9.woff2` → Content Manager with UUID `4defe81f-787e-45d9-874b-ca74cd4fd8e7`
- `materialdesignicons-webfont.80bb28b3.woff` → Content Manager with UUID `195041bf-b303-47da-a85a-32f227d59a4f`

**Results:**
- ✅ **Icons display correctly** in replay instead of squares
- ✅ **Consistent font delivery** across all replay environments
- ✅ **Reduced replay server requirements** - no need to host font files locally

##### **DOM Capture Trigger Analysis**
- **Discovery**: `tap` events don't trigger DOM capture for replay overlays
- **Current Workaround**: Required enabling `click` events in DOM capture triggers alongside `tap`
- **Event Behavior Differences**:
  - **Click events**: Correctly capture meaningful element IDs (e.g., `favorites-like-btn-pre-fab-homes`)
  - **Gesture events**: Often return XPath expressions instead of element IDs
- **Engineering Question**: Why don't `tap` events trigger DOM capture when configured in triggers?

**Current DOM Capture Configuration:**
```javascript
triggers: [
  {
    event: 'click'  // Required for replay overlays to work
  },
  {
    event: 'tap'    // Doesn't trigger DOM capture (investigation needed)
  },
  {
    event: 'change'
  },
  // ... other triggers
]
```

**Impact on Analytics Quality:**
- **Click events** → Meaningful IDs captured for replay
- **Gesture events** → XPath expressions more common, less meaningful for analytics
- **Recommendation**: Keep both `click` and `tap` enabled until engineering clarifies expected behavior

##### **Testing Infrastructure**
- **ngrok tunnel configured** for public replay server access
- **Preview server exposed** at `https://a9964bf52a33.ngrok.app` for testing
- **Build pipeline optimized** for replay functionality testing

### Future Enhancements
- **Engineering Investigation**: Clarify why `tap` events don't trigger DOM capture
- **Analytics Optimization**: Explore ways to get meaningful IDs from gesture events instead of XPath
- **Performance Monitoring**: Track impact of dual click/tap event configuration
- **Content Manager Integration**: Consider automated font deployment pipeline
- **CSS Source Maps**: Explore if needed for debugging replay issues