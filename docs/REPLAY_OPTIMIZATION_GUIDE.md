# Connect/Tealeaf Replay Optimization Guide

This guide documents the comprehensive improvements made to enhance Connect/Tealeaf replay functionality for Vue3 hybrid mobile applications.

## 🎯 Overview

The replay optimization focused on three critical areas:
1. **Element Identification** - Meaningful IDs instead of XPath selectors
2. **Font Delivery** - Proper icon rendering in replay environments  
3. **DOM Capture Configuration** - Optimal event handling for mobile interactions

## 📊 Element Identification Strategy

### Problem
- Connect captured complex XPath selectors: `[["nearby-like-btn-favorite-road-trips"],["span",2],["i",0]]`
- Array-based IDs changed when data reordered
- Event bubbling caused parent container captures when users tapped imprecisely

### Solution: Hierarchical Content-Based IDs

#### Primary Element IDs
```vue
<!-- Content-based IDs derived from actual data -->
<v-card :id="`favorites-card-${titleToId(item.title)}`">
  <v-img :id="`favorites-image-${titleToId(item.title)}`" />
  <v-btn :id="`favorites-like-btn-${titleToId(item.title)}`" />
</v-card>
```

#### Hierarchical Parent IDs (Event Bubbling Prevention)
```vue
<!-- Multi-level ID hierarchy for imprecise taps -->
<v-col :id="`col-favorites-${titleToId(item.title)}`">
  <v-card-actions :id="`actions-favorites-${titleToId(item.title)}`">
    <h3 :id="`favorites-title-${titleToId(item.title)}`">
      <!-- Interactive elements here -->
    </h3>
  </v-card-actions>
</v-col>
```

#### Title-to-ID Conversion Utility
```javascript
function titleToId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
}

// Examples:
// "Pre-fab homes" → "pre-fab-homes"
// "Favorite road trips" → "favorite-road-trips"  
// "Best airlines" → "best-airlines"
```

### Results
- ✅ **Meaningful Analytics**: `favorites-like-btn-pre-fab-homes` instead of XPath
- ✅ **Consistent Tracking**: IDs persist across data changes
- ✅ **Imprecise Tap Handling**: Parent IDs capture when users miss exact targets

## 🎨 CSS & Font Optimization

### Build Configuration

#### Single CSS File Generation
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    cssCodeSplit: false,      // Consolidate all CSS
    minify: false,            // Keep CSS readable for URL editing
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/app-styles.css';  // Fixed filename
          }
          return 'assets/[name].[hash].[ext]';
        },
      },
    },
  },
});
```

#### Benefits
- **Predictable CSS file**: Always `app-styles.css` (no hash variations)
- **Replay server compatibility**: Consistent file references across builds
- **Editable CSS**: Unminified for manual font URL updates

### Font Delivery Solution

#### Problem
Material Design Icons appeared as squares in replay due to relative font paths:
```css
/* Problematic relative paths */
src: url("./materialdesignicons-webfont.67d24abe.eot?v=7.2.96");
```

#### Solution: Acoustic Content Manager URLs
```css
/* Absolute URLs from content manager */
src: url("https://content-us-1.content-cms.com/8c9c656f-5273-48cd-8c92-c5e1f2470200/dxdam/5f/5fec6581-5a04-4ae4-ab27-8e24d6fe3483/materialdesignicons-webfont.67d24abe.eot?v=7.2.96");
```

#### Font Asset Mapping
| Font File | Content Manager UUID | Purpose |
|-----------|---------------------|---------|
| `materialdesignicons-webfont.eot` | `5fec6581-5a04-4ae4-ab27-8e24d6fe3483` | IE compatibility |
| `materialdesignicons-webfont.woff2` | `4defe81f-787e-45d9-874b-ca74cd4fd8e7` | Modern browsers |
| `materialdesignicons-webfont.woff` | `195041bf-b303-47da-a85a-32f227d59a4f` | Older browsers |
| `materialdesignicons-webfont.ttf` | `35af61b5-f26a-4e20-999e-7cc676a8b14b` | Fallback |

#### Implementation Process
1. **Upload fonts** to Acoustic Content Manager
2. **Generate absolute URLs** from content manager
3. **Disable CSS minification** in Vite config
4. **Update @font-face declarations** in built CSS file
5. **Test replay** to verify icon rendering

### Results
- ✅ **Icons render correctly** in replay (no more squares)
- ✅ **Cross-environment compatibility** - fonts accessible from any replay server
- ✅ **Reduced infrastructure requirements** - no need to host fonts locally

## 🔧 DOM Capture Configuration

### Event Handling Analysis

#### Current Configuration
```javascript
// DOM Capture Triggers
triggers: [
  {
    event: 'click'  // Required for replay overlays
  },
  {
    event: 'tap'    // Doesn't trigger DOM capture (under investigation)
  },
  {
    event: 'change'
  },
  {
    event: 'load'
  }
]
```

#### Event Behavior Comparison

| Event Type | DOM Capture | ID Quality | Replay Overlays | Mobile Optimized |
|------------|-------------|------------|-----------------|------------------|
| **Click** | ✅ Triggers | ✅ Meaningful IDs | ✅ Works | ❌ Desktop-focused |
| **Tap** | ❌ No trigger | ❌ Often XPath | ❌ No overlays | ✅ Mobile-native |
| **Gestures** | N/A | ❌ XPath common | N/A | ✅ Touch-optimized |

#### Key Findings
- **Click events**: Capture meaningful element IDs correctly
- **Tap events**: Don't trigger DOM capture (engineering investigation needed)
- **Gesture events**: Often return XPath expressions instead of element IDs
- **Workaround**: Enable both `click` and `tap` for complete coverage

### Recommendations

#### Short Term
1. **Keep both events enabled** until engineering clarifies tap behavior
2. **Monitor analytics quality** between click vs gesture event captures
3. **Test replay functionality** with current dual-event configuration

#### Long Term (Pending Engineering Input)
1. **Clarify tap event behavior** - Should tap events trigger DOM capture?
2. **Optimize for mobile-first** - Prefer tap over click if functionality equivalent
3. **Improve gesture event IDs** - Why do gestures return XPath instead of element IDs?

## 🚀 Testing & Validation

### Testing Setup
- **ngrok tunnel**: `https://a9964bf52a33.ngrok.app` for public replay access
- **Build command**: `npm run build` generates optimized replay-ready assets
- **Preview command**: `npm run preview` serves built application locally

### Validation Checklist

#### ✅ Element Identification
- [ ] Meaningful IDs captured in Connect analytics
- [ ] IDs persist across data reordering
- [ ] Hierarchical IDs handle imprecise taps
- [ ] No complex XPath selectors in primary interactions

#### ✅ Font & CSS Delivery  
- [ ] Icons display correctly (no squares)
- [ ] CSS file generated as `app-styles.css`
- [ ] Font URLs point to content manager
- [ ] All four font formats accessible

#### ⚠️ DOM Capture Events
- [ ] Click events trigger DOM capture ✅
- [ ] Tap events trigger DOM capture ❌ (under investigation)
- [ ] Replay overlays display correctly ✅ (with click enabled)
- [ ] No duplicate events per interaction ✅

## 📈 Performance Impact

### Build Output Comparison

#### Before Optimization
```
dist/assets/index-544225a4.css     (multiple files)
dist/assets/index-abc123.css       (hash-based names)
dist/assets/vendor-def456.css      (split CSS files)
```

#### After Optimization  
```
dist/assets/app-styles.css         (single consolidated file - 859.54 kB)
```

### Analytics Data Quality

#### Before: XPath Selectors
```json
{
  "target": {
    "id": "[[\"nearby-like-btn-favorite-road-trips\"],[\"span\",2],[\"i\",0]]",
    "type": "xpath"
  }
}
```

#### After: Meaningful IDs
```json
{
  "target": {
    "id": "favorites-like-btn-pre-fab-homes", 
    "type": "element"
  }
}
```

## 🔮 Future Enhancements

### Engineering Questions
1. **Tap Event DOM Capture**: Why don't tap events trigger DOM capture?
2. **Gesture Event IDs**: Can gesture events capture element IDs instead of XPath?
3. **Mobile Optimization**: Best practices for hybrid app event configuration?

### Potential Improvements
1. **Automated Font Pipeline**: Script to sync fonts from build output to content manager
2. **CSS Source Maps**: Enable for replay debugging if needed
3. **Performance Monitoring**: Track impact of dual click/tap configuration
4. **Advanced Analytics**: Add data attributes for richer context

### Migration Considerations
- **No breaking changes**: All existing functionality preserved
- **Additive enhancements**: Element IDs and CSS optimization are improvements
- **Backward compatible**: Original XPath fallbacks still work
- **Capacitor integration**: No changes needed for mobile build process

---

## 📞 Support & Contact

For questions about this optimization guide or Connect/Tealeaf configuration:
- **Engineering Questions**: Submit tap event DOM capture behavior inquiry
- **Content Manager**: Font asset management and URL generation
- **Analytics Team**: Element ID strategy validation and performance monitoring

This guide represents current best practices as of October 2025 and should be updated as engineering clarifies tap event behavior and additional optimizations are discovered.