# Theme Customization Quick Start Guide

## 🎨 What's New?

Your Site Auditor Pro project now has an interactive **Theme Customizer** that lets you:
- ✨ Customize colors for light and dark modes independently
- 👀 See changes in real-time
- 📤 Export your custom theme configuration
- 🔄 Reset to defaults anytime

## 🚀 Getting Started

### Step 1: Access the Theme Customizer

Navigate to the dev menu and open **Theme Lab Enhanced**:
```
app/dev/theme-lab-enhanced.tsx
```

### Step 2: Choose Your Mode

Click the **Light** or **Dark** button at the top to preview and customize that mode.

### Step 3: Edit Colors

1. Click any color swatch to open the color picker
2. Modify the hex value (e.g., `#FF0000` for red)
3. Click **Apply** to save the change
4. See the preview update instantly

### Step 4: Preview Changes

The **Component Preview** section shows how your colors look on:
- Primary buttons
- Surface elements
- Success, warning, and error states

### Step 5: Export Your Theme

Click **Export Theme** to generate your custom configuration:

```javascript
const themeColors = {
  primary: { light: '#0a7ea4', dark: '#3b82f6' },
  background: { light: '#ffffff', dark: '#0f1419' },
  surface: { light: '#f5f5f5', dark: '#1a1f26' },
  foreground: { light: '#11181C', dark: '#e5e7eb' },
  muted: { light: '#687076', dark: '#9ca3af' },
  border: { light: '#E5E7EB', dark: '#374151' },
  success: { light: '#22C55E', dark: '#10b981' },
  warning: { light: '#F59E0B', dark: '#f59e0b' },
  error: { light: '#EF4444', dark: '#ef4444' },
};

module.exports = { themeColors };
```

### Step 6: Apply Permanently

To save your theme permanently:

1. Copy the exported configuration
2. Replace the contents of `theme.config.js` with your custom config
3. Rebuild your project:
   ```bash
   npm run build
   # or
   pnpm build
   ```

## 🎯 Common Tasks

### Change the Primary Color

1. Click the **Primary** swatch in the Color Palette section
2. Enter a new hex value (e.g., `#FF6B35`)
3. Click **Apply**
4. See the primary buttons update in the preview

### Create a Dark Mode Theme

1. Click the **Dark** mode button
2. Customize each color for dark mode
3. Ensure good contrast for readability
4. Export and apply

### Reset All Changes

1. Click the **Reset** button (appears when changes are made)
2. Confirm the action
3. All colors return to defaults

### Compare Light vs Dark

1. The Color Palette section shows both modes side-by-side
2. Light and Dark columns display simultaneously
3. Easily see which colors need adjustment

## 📋 Color Reference

| Color | Purpose | Light Default | Dark Default |
|-------|---------|---|---|
| **Primary** | Main action color | `#0a7ea4` | `#3b82f6` |
| **Background** | Page background | `#ffffff` | `#0f1419` |
| **Surface** | Cards, panels | `#f5f5f5` | `#1a1f26` |
| **Foreground** | Main text | `#11181C` | `#e5e7eb` |
| **Muted** | Secondary text | `#687076` | `#9ca3af` |
| **Border** | Dividers, borders | `#E5E7EB` | `#374151` |
| **Success** | Success messages | `#22C55E` | `#10b981` |
| **Warning** | Warning messages | `#F59E0B` | `#f59e0b` |
| **Error** | Error messages | `#EF4444` | `#ef4444` |

## 💡 Pro Tips

1. **Accessibility**: Ensure text colors have enough contrast with backgrounds (WCAG AA: 4.5:1 for text)

2. **Consistency**: Use the same primary color in both light and dark modes for brand recognition

3. **Gradual Changes**: Adjust colors incrementally to see how they affect the overall design

4. **Test Both Modes**: Always preview in both light and dark modes before exporting

5. **Keep Backups**: Save working theme configurations before making major changes

## 🔧 Technical Details

### New Components
- **ColorPickerModal**: Modal for color selection
- **EditableColorSwatch**: Clickable color display with modification indicator

### New Hook
- **useColorCustomization**: Manages all color state and export logic

### New Screen
- **ThemeLabEnhanced**: Main interface for theme customization

### Files to Know
- `theme.config.js` - Your theme configuration (update this to persist changes)
- `lib/_core/theme.ts` - How colors are processed
- `lib/theme-provider.tsx` - Theme context and switching logic

## ❓ FAQ

**Q: Will my changes persist after I close the app?**
A: No, changes are session-based. Export your theme and update `theme.config.js` to make them permanent.

**Q: Can I customize colors for specific components?**
A: The current system customizes global theme colors. Component-specific colors can be added by extending the theme.

**Q: How do I share my custom theme?**
A: Export your theme configuration and share the JavaScript code with your team.

**Q: What hex color format is required?**
A: Use standard 6-digit hex format: `#RRGGBB` (e.g., `#FF0000` for red)

**Q: Can I undo changes?**
A: Click the **Reset** button to revert all changes to defaults.

## 📚 Learn More

For detailed technical documentation, see:
- `COLOR_CUSTOMIZATION.md` - Complete system documentation
- Component source files - Inline comments and JSDoc

## 🎨 Example Themes

### Modern Blue
```javascript
primary: { light: '#0066CC', dark: '#4D94FF' }
background: { light: '#F8FAFC', dark: '#0F1419' }
surface: { light: '#FFFFFF', dark: '#1A1F26' }
```

### Warm Orange
```javascript
primary: { light: '#FF6B35', dark: '#FF8C42' }
background: { light: '#FFF8F3', dark: '#1A0F08' }
surface: { light: '#FFE8D6', dark: '#2D1810' }
```

### Professional Purple
```javascript
primary: { light: '#6366F1', dark: '#818CF8' }
background: { light: '#FAFAFA', dark: '#0F0F1E' }
surface: { light: '#F3F4F6', dark: '#1F1F3A' }
```

---

**Happy customizing! 🎨**
