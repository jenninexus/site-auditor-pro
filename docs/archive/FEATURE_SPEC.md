# Live Preview & CSS Variable Editor - Feature Specification

## 🎯 Feature Overview

Add a live website preview with interactive CSS variable editing:
1. Show the analyzed website in an iframe
2. Extract and display CSS variables as color swatches
3. Allow users to edit colors with a color picker
4. Update the preview in real-time
5. Export modified CSS

## 📋 User Flow

```
1. User enters website URL → Audit runs
2. Results page shows:
   - Audit results (existing)
   - NEW: "Preview & Customize" tab
3. Preview tab shows:
   - Left: Website preview (iframe)
   - Right: CSS Variables panel
4. CSS Variables panel displays:
   - Variable name (e.g., --color-primary)
   - Current color swatch
   - Click swatch → Opens color picker
5. User changes color:
   - Color picker updates
   - Preview updates in real-time
   - Modified variables highlighted
6. Export options:
   - Download modified CSS
   - Copy to clipboard
   - Generate CSS snippet
```

## 🏗️ Architecture

### Data Flow

```
AuditResult
  ↓
extractCSSVariables(html)
  ↓
CSSVariable[] { name, value, selector }
  ↓
PreviewComponent
  ├─ IframePreview (left)
  └─ VariableEditor (right)
       ↓
  ColorPicker
       ↓
  updatePreviewCSS()
       ↓
  IframePreview (updates)
```

### Components to Create

1. **`lib/css-variable-extractor.ts`**
   - Extract CSS variables from HTML/CSS
   - Parse `:root` and other selectors
   - Return structured data

2. **`components/website-preview.tsx`**
   - Iframe container
   - Inject modified CSS
   - Handle security (sandbox)

3. **`components/css-variable-editor.tsx`**
   - Display variables as swatches
   - Color picker integration
   - Real-time updates

4. **`app/preview.tsx`** (new route)
   - Main preview page
   - Layout: split view
   - State management

## 🔧 Technical Details

### CSS Variable Extraction

```typescript
interface CSSVariable {
  name: string;           // e.g., "--color-primary"
  value: string;          // e.g., "#0a7ea4"
  selector: string;       // e.g., ":root"
  type: "color" | "size" | "other";
}

function extractCSSVariables(html: string): CSSVariable[] {
  // 1. Extract all <style> tags and linked CSS
  // 2. Parse CSS for var() declarations
  // 3. Match color values (hex, rgb, hsl)
  // 4. Return structured data
}
```

### Preview Component

```typescript
interface PreviewProps {
  html: string;
  originalVariables: CSSVariable[];
  modifiedVariables: Map<string, string>;
  onVariableChange: (name: string, value: string) => void;
}

// Inject CSS into iframe:
function injectCSS(iframe: HTMLIFrameElement, variables: Map<string, string>) {
  const style = document.createElement('style');
  style.textContent = `:root { ${Array.from(variables).map(([k, v]) => `${k}: ${v};`).join(' ')} }`;
  iframe.contentDocument?.head.appendChild(style);
}
```

### Color Picker Integration

Use React Native color picker (already in dependencies):
```typescript
import { ColorPicker } from 'react-native';

<ColorPicker
  color={currentColor}
  onColorChange={(color) => handleColorChange(varName, color)}
/>
```

## 📱 UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Site Auditor Pro                                       │
├─────────────────────────────────────────────────────────┤
│  [Results] [Accessibility] [Preview & Customize] ←NEW   │
├──────────────────────────┬──────────────────────────────┤
│                          │  CSS Variables               │
│                          │  ┌────────────────────────┐  │
│   Website Preview        │  │ --color-primary        │  │
│   (iframe)               │  │ [■ #0a7ea4] [picker]   │  │
│                          │  └────────────────────────┘  │
│   [Your website here]    │  ┌────────────────────────┐  │
│                          │  │ --color-background     │  │
│                          │  │ [■ #ffffff] [picker]   │  │
│                          │  └────────────────────────┘  │
│                          │  ┌────────────────────────┐  │
│                          │  │ --color-accent         │  │
│                          │  │ [■ #10B981] [picker]   │  │
│                          │  └────────────────────────┘  │
│                          │                              │
│                          │  [Download CSS]              │
│                          │  [Copy to Clipboard]         │
└──────────────────────────┴──────────────────────────────┘
```

## 🎨 Visual Design

### Color Swatch Display
- Large clickable swatch (40x40px)
- Variable name above
- Hex value below
- Hover: show "Click to edit"
- Active: show color picker overlay

### Color Picker
- Modal overlay
- Hue/Saturation selector
- Hex input field
- RGB sliders
- "Apply" and "Cancel" buttons
- Live preview while dragging

## 🔐 Security Considerations

### Iframe Sandbox
```html
<iframe 
  sandbox="allow-same-origin allow-scripts"
  srcDoc={html}
/>
```

### CSP (Content Security Policy)
- Allow inline styles (for injection)
- Restrict external resources (optional)

## 📦 Implementation Steps

### Phase 1: CSS Variable Extractor (30 min)
1. Create `lib/css-variable-extractor.ts`
2. Parse CSS from `<style>` tags
3. Extract variables with regex
4. Filter for color values
5. Add tests

### Phase 2: Preview Component (45 min)
1. Create `components/website-preview.tsx`
2. Render iframe with srcDoc
3. Inject base HTML
4. Add loading state
5. Handle errors

### Phase 3: Variable Editor (45 min)
1. Create `components/css-variable-editor.tsx`
2. Display variables as list
3. Render color swatches
4. Add click handlers
5. Style with Tailwind

### Phase 4: Color Picker Integration (30 min)
1. Install/use color picker library
2. Create modal overlay
3. Connect to variable state
4. Add apply/cancel logic

### Phase 5: Real-time Updates (30 min)
1. Create state management (useState/useReducer)
2. Implement `injectCSS` function
3. Update iframe on color change
4. Add debouncing for performance

### Phase 6: Export Functionality (20 min)
1. Generate CSS string from modified variables
2. Add download button
3. Add copy to clipboard
4. Show success notification

### Phase 7: New Route & Integration (20 min)
1. Create `app/preview.tsx`
2. Add tab to results page
3. Pass audit data to preview
4. Test navigation

## 🧪 Testing Plan

1. **Unit Tests**
   - CSS variable extraction
   - Color parsing
   - CSS generation

2. **Integration Tests**
   - Preview rendering
   - Color updates
   - Export functionality

3. **Manual Testing**
   - Test with various websites
   - Test with different CSS structures
   - Test color picker UX
   - Test on mobile

## 📊 Success Metrics

- ✅ Extract 90%+ of CSS variables
- ✅ Preview updates < 100ms
- ✅ Works with major CSS frameworks (Tailwind, Bootstrap)
- ✅ Mobile responsive
- ✅ Export generates valid CSS

## 🚀 Future Enhancements

1. **Variable Grouping**
   - Group by category (colors, spacing, fonts)
   - Collapsible sections

2. **Color Harmony Suggestions**
   - Suggest complementary colors
   - WCAG compliance checking

3. **Undo/Redo**
   - History stack
   - Keyboard shortcuts

4. **Presets**
   - Save color schemes
   - Load from library

5. **Comparison View**
   - Side-by-side before/after
   - Toggle between original/modified

## 📝 Notes

- Use existing color harmony engine from `lib/color-harmony.ts`
- Leverage existing contrast analyzer for WCAG checks
- Reuse Tailwind config for consistent styling
- Consider performance for large CSS files (>1000 variables)
