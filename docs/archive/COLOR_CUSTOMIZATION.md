# Color Customization System

## Overview

The Site Auditor Pro project now includes an enhanced theme customization system that allows users to customize colors for both light and dark modes independently. This system provides a visual interface for editing color swatches and exporting customized themes.

## Architecture

### Components

#### 1. **ColorPickerModal** (`components/color-picker-modal.tsx`)
A reusable modal component for selecting and editing colors with:
- Hex color input field
- RGB value display
- Real-time color preview
- Apply/Cancel actions

**Props:**
```typescript
interface ColorPickerModalProps {
  isVisible: boolean;
  colorName: string;
  currentColor: string;
  onClose: () => void;
  onApply: (color: string) => void;
}
```

#### 2. **EditableColorSwatch** (`components/editable-color-swatch.tsx`)
A clickable color swatch component that displays:
- Color preview circle
- Color name and hex value
- Modified indicator (shows when color differs from default)
- Responsive styling based on modification state

**Props:**
```typescript
interface EditableColorSwatchProps {
  name: string;
  value: string;
  isModified: boolean;
  onPress: () => void;
}
```

### Hooks

#### **useColorCustomization** (`hooks/use-color-customization.ts`)
A custom hook that manages all color customization state and operations:

**State:**
- `customizations`: Object containing light and dark mode color values

**Methods:**
- `updateColor(scheme, colorName, value)`: Update a specific color
- `resetColors()`: Reset all colors to default values
- `isModified(scheme, colorName)`: Check if a color has been modified
- `getModifiedCount(scheme)`: Get count of modified colors in a scheme
- `exportAsJson()`: Export customizations as JSON
- `exportAsThemeConfig()`: Export as JavaScript theme configuration

**Returns:**
```typescript
{
  customizations: ColorCustomizations;
  updateColor: (scheme: ColorScheme, colorName: string, value: string) => void;
  resetColors: () => void;
  isModified: (scheme: ColorScheme, colorName: string) => boolean;
  getModifiedCount: (scheme: ColorScheme) => number;
  exportAsJson: () => string;
  exportAsThemeConfig: () => string;
}
```

### Screens

#### **ThemeLabEnhanced** (`app/dev/theme-lab-enhanced.tsx`)
The main interface for theme customization featuring:

**Sections:**
1. **Header**: Shows title and total modified colors count
2. **Mode Selector**: Toggle between light and dark preview modes
3. **Color Palette**: Side-by-side editable swatches for light and dark modes
4. **Component Preview**: Live preview of buttons using customized colors
5. **Activity Log**: Shows interaction history
6. **Actions**: Export and Reset buttons

**Key Features:**
- Real-time color updates across all UI elements
- Side-by-side light/dark mode editing
- Visual indicators for modified colors
- Component preview showing how colors look in practice
- Export functionality for sharing themes

## Usage

### Basic Usage

1. Navigate to the Theme Lab Enhanced screen from the dev menu
2. Select Light or Dark mode to preview changes
3. Click on any color swatch to open the color picker
4. Adjust the hex value or use the RGB display
5. Click "Apply" to update the color
6. See the changes reflected in the component preview immediately
7. Click "Export Theme" to save your customizations
8. Click "Reset" to revert all changes to defaults

### Programmatic Usage

```typescript
import { useColorCustomization } from "@/hooks/use-color-customization";

function MyComponent() {
  const {
    customizations,
    updateColor,
    resetColors,
    isModified,
    exportAsThemeConfig,
  } = useColorCustomization();

  // Update a color
  const handleColorChange = () => {
    updateColor("light", "primary", "#FF0000");
  };

  // Check if modified
  if (isModified("dark", "background")) {
    console.log("Background color was customized");
  }

  // Export configuration
  const config = exportAsThemeConfig();
  console.log(config);

  return (
    // Your component JSX
  );
}
```

## Color Tokens

The following color tokens are available for customization:

| Token | Purpose | Default Light | Default Dark |
|-------|---------|---|---|
| `primary` | Primary action color | `#0a7ea4` | `#3b82f6` |
| `background` | Main background | `#ffffff` | `#0f1419` |
| `surface` | Elevated surface | `#f5f5f5` | `#1a1f26` |
| `foreground` | Primary text color | `#11181C` | `#e5e7eb` |
| `muted` | Secondary text color | `#687076` | `#9ca3af` |
| `border` | Border color | `#E5E7EB` | `#374151` |
| `success` | Success state | `#22C55E` | `#10b981` |
| `warning` | Warning state | `#F59E0B` | `#f59e0b` |
| `error` | Error state | `#EF4444` | `#ef4444` |

## Export Formats

### JSON Export
Exports customizations as a JSON object:
```json
{
  "light": {
    "primary": "#0a7ea4",
    "background": "#ffffff",
    ...
  },
  "dark": {
    "primary": "#3b82f6",
    "background": "#0f1419",
    ...
  }
}
```

### Theme Config Export
Exports as a JavaScript module compatible with `theme.config.js`:
```javascript
const themeColors = {
  primary: { light: '#0a7ea4', dark: '#3b82f6' },
  background: { light: '#ffffff', dark: '#0f1419' },
  ...
};

module.exports = { themeColors };
```

## Integration with Existing Theme System

The color customization system integrates seamlessly with the existing theme infrastructure:

1. **ThemeProvider** (`lib/theme-provider.tsx`): Continues to manage color scheme switching
2. **SchemeColors** (`lib/_core/theme.ts`): Provides default color values
3. **NativeWind**: Tailwind CSS integration continues to work with customized colors
4. **useColors Hook** (`hooks/use-colors.ts`): Provides runtime color palette

### How It Works

1. `useColorCustomization` maintains a local state of customized colors
2. When a color is updated, the component re-renders with the new value
3. The color picker modal allows hex input with validation
4. Export functions generate shareable theme configurations
5. Users can copy the exported config and update `theme.config.js` to persist changes

## Workflow

### For Users

1. **Explore**: Browse the Theme Lab Enhanced screen to see all available colors
2. **Customize**: Click swatches to adjust colors for your brand
3. **Preview**: See changes reflected immediately in component examples
4. **Export**: Generate a theme configuration file
5. **Apply**: Copy the exported config to `theme.config.js` and rebuild

### For Developers

1. **Extend**: Add new color tokens to `theme.config.js`
2. **Integrate**: Use `useColorCustomization` hook in custom components
3. **Export**: Generate theme configs programmatically
4. **Version**: Track theme versions in your design system

## Best Practices

1. **Contrast**: Ensure sufficient contrast between foreground and background colors for accessibility
2. **Consistency**: Use the same primary color across both light and dark modes for brand consistency
3. **Testing**: Preview components in both modes before exporting
4. **Documentation**: Document your custom color choices for team reference
5. **Versioning**: Keep backups of working theme configurations

## Troubleshooting

### Colors Not Updating
- Ensure the hex value is valid (format: `#RRGGBB`)
- Check that the color scheme is selected correctly
- Verify the component is using the customized colors

### Export Not Working
- Check that at least one color has been modified
- Ensure the device has sharing capabilities
- Try copying the JSON export manually

### Changes Not Persisting
- Remember that customizations are session-based
- Export and save your theme configuration
- Update `theme.config.js` to persist changes permanently

## Future Enhancements

Potential improvements for future versions:

1. **Color Presets**: Pre-built theme palettes (Material Design, Tailwind, etc.)
2. **Accessibility Checker**: Validate contrast ratios
3. **Color Harmony**: Suggest complementary colors
4. **History**: Undo/redo functionality
5. **Persistence**: Save themes to device storage
6. **Sharing**: Generate shareable theme links
7. **Animation**: Smooth color transitions
8. **Advanced Picker**: HSL/HSV color space support

## Files Modified/Created

### New Files
- `components/color-picker-modal.tsx`
- `components/editable-color-swatch.tsx`
- `hooks/use-color-customization.ts`
- `app/dev/theme-lab-enhanced.tsx`
- `COLOR_CUSTOMIZATION.md` (this file)

### Existing Files (No Changes Required)
- `theme.config.js` - Source of truth for default colors
- `lib/_core/theme.ts` - Color definitions
- `lib/theme-provider.tsx` - Theme context provider
- `constants/theme.ts` - Theme exports

## Support

For issues or questions about the color customization system, refer to:
- Component source code comments
- Hook documentation
- This guide's troubleshooting section
