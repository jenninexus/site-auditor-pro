/**
 * Color Harmony and Brand Palette Matching
 * Generates harmonious color suggestions based on color theory
 */

interface ColorHSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

interface HarmonyColor {
  hex: string;
  hsl: ColorHSL;
  name: string;
  harmony: "complementary" | "analogous" | "triadic" | "tetradic" | "split-complementary";
  distance: number; // How far from original hue
}

export interface BrandPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  warning: string;
  error: string;
}

/**
 * Convert hex color to HSL
 */
export function hexToHSL(hex: string): ColorHSL {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(hsl: ColorHSL): string {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generate complementary color (opposite on color wheel)
 */
export function getComplementary(hex: string): HarmonyColor {
  const hsl = hexToHSL(hex);
  const complementaryHue = (hsl.h + 180) % 360;

  return {
    hex: hslToHex({ ...hsl, h: complementaryHue }),
    hsl: { ...hsl, h: complementaryHue },
    name: "Complementary",
    harmony: "complementary",
    distance: 180,
  };
}

/**
 * Generate analogous colors (adjacent on color wheel)
 */
export function getAnalogous(hex: string): HarmonyColor[] {
  const hsl = hexToHSL(hex);
  const angle = 30; // 30 degrees apart

  return [
    {
      hex: hslToHex({ ...hsl, h: (hsl.h - angle + 360) % 360 }),
      hsl: { ...hsl, h: (hsl.h - angle + 360) % 360 },
      name: "Analogous Left",
      harmony: "analogous",
      distance: -angle,
    },
    {
      hex: hslToHex({ ...hsl, h: (hsl.h + angle) % 360 }),
      hsl: { ...hsl, h: (hsl.h + angle) % 360 },
      name: "Analogous Right",
      harmony: "analogous",
      distance: angle,
    },
  ];
}

/**
 * Generate triadic colors (120 degrees apart)
 */
export function getTriadic(hex: string): HarmonyColor[] {
  const hsl = hexToHSL(hex);

  return [
    {
      hex: hslToHex({ ...hsl, h: (hsl.h + 120) % 360 }),
      hsl: { ...hsl, h: (hsl.h + 120) % 360 },
      name: "Triadic 1",
      harmony: "triadic",
      distance: 120,
    },
    {
      hex: hslToHex({ ...hsl, h: (hsl.h + 240) % 360 }),
      hsl: { ...hsl, h: (hsl.h + 240) % 360 },
      name: "Triadic 2",
      harmony: "triadic",
      distance: 240,
    },
  ];
}

/**
 * Generate split-complementary colors (150 degrees apart)
 */
export function getSplitComplementary(hex: string): HarmonyColor[] {
  const hsl = hexToHSL(hex);

  return [
    {
      hex: hslToHex({ ...hsl, h: (hsl.h + 150) % 360 }),
      hsl: { ...hsl, h: (hsl.h + 150) % 360 },
      name: "Split-Comp 1",
      harmony: "split-complementary",
      distance: 150,
    },
    {
      hex: hslToHex({ ...hsl, h: (hsl.h + 210) % 360 }),
      hsl: { ...hsl, h: (hsl.h + 210) % 360 },
      name: "Split-Comp 2",
      harmony: "split-complementary",
      distance: 210,
    },
  ];
}

/**
 * Generate tetradic colors (90 degrees apart)
 */
export function getTetradic(hex: string): HarmonyColor[] {
  const hsl = hexToHSL(hex);

  return [
    {
      hex: hslToHex({ ...hsl, h: (hsl.h + 90) % 360 }),
      hsl: { ...hsl, h: (hsl.h + 90) % 360 },
      name: "Tetradic 1",
      harmony: "tetradic",
      distance: 90,
    },
    {
      hex: hslToHex({ ...hsl, h: (hsl.h + 180) % 360 }),
      hsl: { ...hsl, h: (hsl.h + 180) % 360 },
      name: "Tetradic 2",
      harmony: "tetradic",
      distance: 180,
    },
    {
      hex: hslToHex({ ...hsl, h: (hsl.h + 270) % 360 }),
      hsl: { ...hsl, h: (hsl.h + 270) % 360 },
      name: "Tetradic 3",
      harmony: "tetradic",
      distance: 270,
    },
  ];
}

/**
 * Get all harmony suggestions for a color
 */
export function getAllHarmony(hex: string): HarmonyColor[] {
  return [
    getComplementary(hex),
    ...getAnalogous(hex),
    ...getTriadic(hex),
    ...getSplitComplementary(hex),
    ...getTetradic(hex),
  ];
}

/**
 * Find closest color in brand palette to a given color
 */
export function findClosestBrandColor(
  hex: string,
  brandPalette: BrandPalette
): { color: string; name: string; distance: number } {
  const targetHSL = hexToHSL(hex);
  const paletteEntries = Object.entries(brandPalette);

  let closest = { color: "", name: "", distance: Infinity };

  paletteEntries.forEach(([name, color]) => {
    const paletteHSL = hexToHSL(color);

    // Calculate color distance using HSL
    const hDiff = Math.min(Math.abs(targetHSL.h - paletteHSL.h), 360 - Math.abs(targetHSL.h - paletteHSL.h));
    const sDiff = Math.abs(targetHSL.s - paletteHSL.s);
    const lDiff = Math.abs(targetHSL.l - paletteHSL.l);

    // Weighted distance (hue is most important)
    const distance = hDiff * 1.5 + sDiff * 0.5 + lDiff * 0.5;

    if (distance < closest.distance) {
      closest = { color, name, distance };
    }
  });

  return closest;
}

/**
 * Generate brand-aware color suggestions
 * Suggests colors from brand palette that match harmony rules
 */
export function getBrandAwareHarmony(
  hex: string,
  brandPalette: BrandPalette
): Array<{ color: string; name: string; harmony: string; fromBrand: boolean }> {
  const allHarmony = getAllHarmony(hex);
  const suggestions: Array<{ color: string; name: string; harmony: string; fromBrand: boolean }> = [];

  allHarmony.forEach((harmonyColor) => {
    const closest = findClosestBrandColor(harmonyColor.hex, brandPalette);

    // Only add if it's reasonably close to the harmony color
    if (closest.distance < 60) {
      suggestions.push({
        color: closest.color,
        name: `${harmonyColor.name} (${closest.name})`,
        harmony: harmonyColor.harmony,
        fromBrand: true,
      });
    } else {
      // Add the pure harmony color if no close brand match
      suggestions.push({
        color: harmonyColor.hex,
        name: harmonyColor.name,
        harmony: harmonyColor.harmony,
        fromBrand: false,
      });
    }
  });

  return suggestions;
}

/**
 * Extract dominant colors from an audit result
 * Returns a brand palette based on detected colors
 */
export function extractBrandPalette(colors: string[]): BrandPalette {
  const uniqueColors = [...new Set(colors)].slice(0, 7);

  return {
    primary: uniqueColors[0] || "#0a7ea4",
    secondary: uniqueColors[1] || "#687076",
    accent: uniqueColors[2] || "#10B981",
    neutral: uniqueColors[3] || "#f5f5f5",
    success: uniqueColors[4] || "#22C55E",
    warning: uniqueColors[5] || "#F59E0B",
    error: uniqueColors[6] || "#EF4444",
  };
}

/**
 * Check if two colors are harmonious (good together)
 */
export function areHarmonious(color1: string, color2: string, tolerance: number = 30): boolean {
  const hsl1 = hexToHSL(color1);
  const hsl2 = hexToHSL(color2);

  const hueDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h));

  // Check if hue difference matches common harmony angles
  const harmonyAngles = [0, 30, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return harmonyAngles.some((angle) => Math.abs(hueDiff - angle) <= tolerance);
}

/**
 * Generate a monochromatic palette from a single color
 */
export function getMonochromatic(hex: string, count: number = 5): HarmonyColor[] {
  const hsl = hexToHSL(hex);
  const colors: HarmonyColor[] = [];

  for (let i = 0; i < count; i++) {
    const lightness = (hsl.l * (i + 1)) / count;
    const newHSL = { ...hsl, l: Math.max(5, Math.min(95, lightness)) };

    colors.push({
      hex: hslToHex(newHSL),
      hsl: newHSL,
      name: `Shade ${i + 1}`,
      harmony: "analogous",
      distance: 0,
    });
  }

  return colors;
}
