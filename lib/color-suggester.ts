/**
 * Color Suggester
 * Generates color pairs that meet WCAG AAA standards
 */

import { calculateContrastRatio, getWCAGLevel, type TextSize } from "./contrast-analyzer";

export interface ColorSuggestion {
  foreground: string;
  background: string;
  ratio: number;
  wcagLevel: "AAA" | "AA" | "Fail";
  strategy: "darken-fg" | "lighten-bg" | "saturate-fg" | "desaturate-bg" | "hybrid";
  improvement: number; // percentage improvement from original
  preview: {
    original: { fg: string; bg: string; ratio: number };
    suggested: { fg: string; bg: string; ratio: number };
  };
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

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
 * Convert HSL to RGB
 */
function hslToRgb(hsl: HSL): RGB {
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

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Darken a color by reducing lightness
 */
function darkenColor(hex: string, amount: number = 10): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb);
  hsl.l = Math.max(0, hsl.l - amount);

  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Lighten a color by increasing lightness
 */
function lightenColor(hex: string, amount: number = 10): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb);
  hsl.l = Math.min(100, hsl.l + amount);

  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Increase saturation of a color
 */
function saturateColor(hex: string, amount: number = 20): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb);
  hsl.s = Math.min(100, hsl.s + amount);

  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Decrease saturation of a color
 */
function desaturateColor(hex: string, amount: number = 20): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const hsl = rgbToHsl(rgb);
  hsl.s = Math.max(0, hsl.s - amount);

  const newRgb = hslToRgb(hsl);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Generate color suggestions for failing contrast
 */
export function generateColorSuggestions(
  foreground: string,
  background: string,
  textSize: TextSize = "normal",
  targetRatio: number = 7
): ColorSuggestion[] {
  const suggestions: ColorSuggestion[] = [];
  const originalRatio = calculateContrastRatio(foreground, background) || 1;

  // Strategy 1: Darken foreground progressively
  for (let i = 5; i <= 30; i += 5) {
    const darkened = darkenColor(foreground, i);
    const ratio = calculateContrastRatio(darkened, background) || 0;

    if (ratio >= targetRatio) {
      const improvement = ((ratio - originalRatio) / originalRatio) * 100;
      suggestions.push({
        foreground: darkened,
        background,
        ratio: Math.round(ratio * 100) / 100,
        wcagLevel: getWCAGLevel(ratio, textSize),
        strategy: "darken-fg",
        improvement: Math.round(improvement),
        preview: {
          original: {
            fg: foreground,
            bg: background,
            ratio: Math.round(originalRatio * 100) / 100,
          },
          suggested: {
            fg: darkened,
            bg: background,
            ratio: Math.round(ratio * 100) / 100,
          },
        },
      });
      break;
    }
  }

  // Strategy 2: Lighten background progressively
  for (let i = 5; i <= 30; i += 5) {
    const lightened = lightenColor(background, i);
    const ratio = calculateContrastRatio(foreground, lightened) || 0;

    if (ratio >= targetRatio) {
      const improvement = ((ratio - originalRatio) / originalRatio) * 100;
      suggestions.push({
        foreground,
        background: lightened,
        ratio: Math.round(ratio * 100) / 100,
        wcagLevel: getWCAGLevel(ratio, textSize),
        strategy: "lighten-bg",
        improvement: Math.round(improvement),
        preview: {
          original: {
            fg: foreground,
            bg: background,
            ratio: Math.round(originalRatio * 100) / 100,
          },
          suggested: {
            fg: foreground,
            bg: lightened,
            ratio: Math.round(ratio * 100) / 100,
          },
        },
      });
      break;
    }
  }

  // Strategy 3: Saturate foreground (if it helps with luminance)
  for (let i = 10; i <= 40; i += 10) {
    const saturated = saturateColor(foreground, i);
    const ratio = calculateContrastRatio(saturated, background) || 0;

    if (ratio >= targetRatio) {
      const improvement = ((ratio - originalRatio) / originalRatio) * 100;
      suggestions.push({
        foreground: saturated,
        background,
        ratio: Math.round(ratio * 100) / 100,
        wcagLevel: getWCAGLevel(ratio, textSize),
        strategy: "saturate-fg",
        improvement: Math.round(improvement),
        preview: {
          original: {
            fg: foreground,
            bg: background,
            ratio: Math.round(originalRatio * 100) / 100,
          },
          suggested: {
            fg: saturated,
            bg: background,
            ratio: Math.round(ratio * 100) / 100,
          },
        },
      });
      break;
    }
  }

  // Strategy 4: Desaturate background (reduce noise)
  for (let i = 10; i <= 40; i += 10) {
    const desaturated = desaturateColor(background, i);
    const ratio = calculateContrastRatio(foreground, desaturated) || 0;

    if (ratio >= targetRatio) {
      const improvement = ((ratio - originalRatio) / originalRatio) * 100;
      suggestions.push({
        foreground,
        background: desaturated,
        ratio: Math.round(ratio * 100) / 100,
        wcagLevel: getWCAGLevel(ratio, textSize),
        strategy: "desaturate-bg",
        improvement: Math.round(improvement),
        preview: {
          original: {
            fg: foreground,
            bg: background,
            ratio: Math.round(originalRatio * 100) / 100,
          },
          suggested: {
            fg: foreground,
            bg: desaturated,
            ratio: Math.round(ratio * 100) / 100,
          },
        },
      });
      break;
    }
  }

  // Strategy 5: Hybrid - darken foreground AND lighten background
  for (let fgDarken = 5; fgDarken <= 20; fgDarken += 5) {
    for (let bgLighten = 5; bgLighten <= 20; bgLighten += 5) {
      const darkened = darkenColor(foreground, fgDarken);
      const lightened = lightenColor(background, bgLighten);
      const ratio = calculateContrastRatio(darkened, lightened) || 0;

      if (ratio >= targetRatio) {
        const improvement = ((ratio - originalRatio) / originalRatio) * 100;
        suggestions.push({
          foreground: darkened,
          background: lightened,
          ratio: Math.round(ratio * 100) / 100,
          wcagLevel: getWCAGLevel(ratio, textSize),
          strategy: "hybrid",
          improvement: Math.round(improvement),
          preview: {
            original: {
              fg: foreground,
              bg: background,
              ratio: Math.round(originalRatio * 100) / 100,
            },
            suggested: {
              fg: darkened,
              bg: lightened,
              ratio: Math.round(ratio * 100) / 100,
            },
          },
        });
        break;
      }
    }
    if (suggestions.some((s) => s.strategy === "hybrid")) break;
  }

  // Sort by improvement (best first) and remove duplicates
  const uniqueSuggestions = Array.from(
    new Map(
      suggestions
        .sort((a, b) => b.improvement - a.improvement)
        .map((s) => [
          `${s.foreground}-${s.background}`,
          s,
        ])
    ).values()
  );

  return uniqueSuggestions;
}

/**
 * Get the best suggestion for a color pair
 */
export function getBestSuggestion(
  foreground: string,
  background: string,
  textSize: TextSize = "normal"
): ColorSuggestion | null {
  const suggestions = generateColorSuggestions(foreground, background, textSize);

  if (suggestions.length === 0) return null;

  // Prefer hybrid strategy as it's more balanced
  const hybrid = suggestions.find((s) => s.strategy === "hybrid");
  if (hybrid) return hybrid;

  // Otherwise return the best improvement
  return suggestions[0];
}

/**
 * Get strategy description for UI
 */
export function getStrategyDescription(strategy: string): string {
  const descriptions: Record<string, string> = {
    "darken-fg": "Darken the text color",
    "lighten-bg": "Lighten the background color",
    "saturate-fg": "Increase text color saturation",
    "desaturate-bg": "Decrease background saturation",
    hybrid: "Adjust both text and background colors",
  };

  return descriptions[strategy] || strategy;
}

/**
 * Get strategy emoji/icon name for UI
 */
export function getStrategyIcon(strategy: string): string {
  const icons: Record<string, string> = {
    "darken-fg": "text-darkening",
    "lighten-bg": "background-lightening",
    "saturate-fg": "color-saturation",
    "desaturate-bg": "color-desaturation",
    hybrid: "balanced-adjustment",
  };

  return icons[strategy] || "adjustment";
}
