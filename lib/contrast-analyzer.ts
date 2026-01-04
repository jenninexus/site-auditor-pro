/**
 * Enhanced Color Contrast Analyzer
 * Analyzes color contrast ratios and WCAG compliance for both light and dark modes
 * Provides specific color fix suggestions
 */

export type WCAGLevel = "AAA" | "AA" | "Fail";
export type TextSize = "normal" | "large";
export type ColorMode = "light" | "dark";

export interface ColorSuggestion {
  color: string;
  ratio: number;
  level: WCAGLevel;
  description: string;
}

export interface ContrastIssue {
  element: string;
  foreground: string;
  background: string;
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  textSize: TextSize;
  recommendation: string;
  mode: ColorMode;
  suggestedFixes: ColorSuggestion[];
}

export interface ModeReport {
  mode: ColorMode;
  contrastIssues: ContrastIssue[];
  wcagAA: {
    pass: number;
    fail: number;
    percentage: number;
  };
  wcagAAA: {
    pass: number;
    fail: number;
    percentage: number;
  };
}

export interface AccessibilityReport {
  url: string;
  timestamp: number;
  totalElements: number;
  lightMode: ModeReport;
  darkMode: ModeReport;
  summary: string;
  // Legacy fields for backward compatibility
  contrastIssues: ContrastIssue[];
  wcagAA: {
    pass: number;
    fail: number;
    percentage: number;
  };
  wcagAAA: {
    pass: number;
    fail: number;
    percentage: number;
  };
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
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
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

/**
 * Parse CSS color to RGB
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  color = color.trim().toLowerCase();

  // Handle hex colors
  if (color.startsWith("#")) {
    return hexToRgb(color);
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
    };
  }

  // Handle named colors (basic set)
  const namedColors: Record<string, { r: number; g: number; b: number }> = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 },
    transparent: { r: 255, g: 255, b: 255 },
  };

  return namedColors[color] || null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula
 */
function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function calculateContrastRatio(
  foreground: string,
  background: string
): number | null {
  const fgRgb = parseColor(foreground);
  const bgRgb = parseColor(background);

  if (!fgRgb || !bgRgb) {
    return null;
  }

  const fgLum = getLuminance(fgRgb);
  const bgLum = getLuminance(bgRgb);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine WCAG compliance level
 */
export function getWCAGLevel(ratio: number, textSize: TextSize = "normal"): WCAGLevel {
  if (textSize === "large") {
    // Large text: 18pt+ or 14pt+ bold
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
  } else {
    // Normal text
    if (ratio >= 7) return "AAA";
    if (ratio >= 4.5) return "AA";
  }

  return "Fail";
}

/**
 * Calculate color distance (for finding similar colors)
 */
function colorDistance(color1: string, color2: string): number {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  
  if (!rgb1 || !rgb2) return Infinity;
  
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

/**
 * Generate color suggestions that meet WCAG requirements
 */
function generateColorSuggestions(
  foreground: string,
  background: string,
  textSize: TextSize
): ColorSuggestion[] {
  const targetAA = textSize === "large" ? 3 : 4.5;
  const targetAAA = textSize === "large" ? 4.5 : 7;
  
  const suggestions: ColorSuggestion[] = [];
  const fgRgb = parseColor(foreground);
  const bgRgb = parseColor(background);
  
  if (!fgRgb || !bgRgb) return suggestions;
  
  // Strategy 1: Darken foreground
  for (let factor = 0.7; factor >= 0.1; factor -= 0.1) {
    const adjusted = {
      r: fgRgb.r * factor,
      g: fgRgb.g * factor,
      b: fgRgb.b * factor,
    };
    const color = rgbToHex(adjusted.r, adjusted.g, adjusted.b);
    const ratio = calculateContrastRatio(color, background);
    
    if (ratio && ratio >= targetAA) {
      const level = getWCAGLevel(ratio, textSize);
      suggestions.push({
        color,
        ratio: Math.round(ratio * 100) / 100,
        level,
        description: `Darken text to ${color} (${level} - ${ratio.toFixed(2)}:1)`,
      });
      
      if (suggestions.length >= 2) break;
    }
  }
  
  // Strategy 2: Lighten foreground
  for (let factor = 1.3; factor <= 2.5; factor += 0.2) {
    const adjusted = {
      r: Math.min(255, fgRgb.r * factor),
      g: Math.min(255, fgRgb.g * factor),
      b: Math.min(255, fgRgb.b * factor),
    };
    const color = rgbToHex(adjusted.r, adjusted.g, adjusted.b);
    const ratio = calculateContrastRatio(color, background);
    
    if (ratio && ratio >= targetAA) {
      const level = getWCAGLevel(ratio, textSize);
      suggestions.push({
        color,
        ratio: Math.round(ratio * 100) / 100,
        level,
        description: `Lighten text to ${color} (${level} - ${ratio.toFixed(2)}:1)`,
      });
      
      if (suggestions.length >= 4) break;
    }
  }
  
  // Strategy 3: Adjust background
  for (let factor = 0.7; factor >= 0.1; factor -= 0.1) {
    const adjusted = {
      r: bgRgb.r * factor,
      g: bgRgb.g * factor,
      b: bgRgb.b * factor,
    };
    const color = rgbToHex(adjusted.r, adjusted.g, adjusted.b);
    const ratio = calculateContrastRatio(foreground, color);
    
    if (ratio && ratio >= targetAA) {
      const level = getWCAGLevel(ratio, textSize);
      suggestions.push({
        color,
        ratio: Math.round(ratio * 100) / 100,
        level,
        description: `Change background to ${color} (${level} - ${ratio.toFixed(2)}:1)`,
      });
      
      if (suggestions.length >= 6) break;
    }
  }
  
  // Sort by closest to original color and remove duplicates
  const unique = suggestions.filter((s, i, arr) => 
    arr.findIndex(t => t.color === s.color) === i
  );
  
  return unique
    .sort((a, b) => colorDistance(foreground, a.color) - colorDistance(foreground, b.color))
    .slice(0, 3);
}

/**
 * Extract dark mode colors from CSS
 */
function extractDarkModeColors(html: string): Array<{fg: string; bg: string; element: string}> {
  const darkModeColors: Array<{fg: string; bg: string; element: string}> = [];
  
  // Look for @media (prefers-color-scheme: dark) rules
  const darkModeRegex = /@media\s*\(prefers-color-scheme:\s*dark\)\s*{([^}]+)}/gi;
  let match;
  
  while ((match = darkModeRegex.exec(html)) !== null) {
    const cssBlock = match[1];
    
    // Extract color and background-color from the block
    const colorMatch = /color:\s*([^;]+);/i.exec(cssBlock);
    const bgMatch = /background(?:-color)?:\s*([^;]+);/i.exec(cssBlock);
    
    if (colorMatch || bgMatch) {
      darkModeColors.push({
        fg: colorMatch ? colorMatch[1].trim() : "#ffffff",
        bg: bgMatch ? bgMatch[1].trim() : "#000000",
        element: "dark-mode-style",
      });
    }
  }
  
  // Also check for common dark mode patterns
  const commonDarkPatterns = [
    { fg: "#ffffff", bg: "#000000", element: "dark-body" },
    { fg: "#e0e0e0", bg: "#121212", element: "dark-text" },
    { fg: "#b0b0b0", bg: "#1e1e1e", element: "dark-muted" },
    { fg: "#cccccc", bg: "#2d2d2d", element: "dark-secondary" },
  ];
  
  darkModeColors.push(...commonDarkPatterns);
  
  return darkModeColors;
}

/**
 * Analyze contrast for a specific mode
 */
function analyzeModeContrast(
  html: string,
  mode: ColorMode
): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  
  // Get colors based on mode
  const colorPairs = mode === "light" 
    ? extractLightModeColors(html)
    : extractDarkModeColors(html);
  
  colorPairs.forEach(({ fg, bg, element }) => {
    const ratio = calculateContrastRatio(fg, bg);
    if (!ratio) return;
    
    const textSize: TextSize = element.includes("h") ? "large" : "normal";
    const targetAA = textSize === "large" ? 3 : 4.5;
    const targetAAA = textSize === "large" ? 4.5 : 7;
    
    const wcagAA = ratio >= targetAA;
    const wcagAAA = ratio >= targetAAA;
    
    // Only report issues that don't meet WCAG AA
    if (!wcagAA) {
      const suggestedFixes = generateColorSuggestions(fg, bg, textSize);
      const recommendation = generateContrastRecommendation(ratio, textSize, fg, bg, suggestedFixes);
      
      issues.push({
        element,
        foreground: fg,
        background: bg,
        ratio: Math.round(ratio * 100) / 100,
        wcagAA,
        wcagAAA,
        textSize,
        recommendation,
        mode,
        suggestedFixes,
      });
    }
  });
  
  return issues;
}

/**
 * Extract light mode colors from HTML
 */
function extractLightModeColors(html: string): Array<{fg: string; bg: string; element: string}> {
  const lightModeColors: Array<{fg: string; bg: string; element: string}> = [];
  
  // Parse inline styles
  const textElementRegex = /<(p|h[1-6]|a|button|span|div|li)[^>]*style="([^"]*)"[^>]*>([^<]*)<\/\1>/gi;
  const styleRegex = /color:\s*([^;]+);|background(?:-color)?:\s*([^;]+);/gi;
  
  let match;
  while ((match = textElementRegex.exec(html)) !== null) {
    const elementTag = match[1];
    const styleAttr = match[2];
    const content = match[3];
    
    if (!content.trim()) continue;
    
    let foreground = "#000000";
    let background = "#ffffff";
    
    let styleMatch;
    while ((styleMatch = styleRegex.exec(styleAttr)) !== null) {
      if (styleMatch[1]) foreground = styleMatch[1].trim();
      if (styleMatch[2]) background = styleMatch[2].trim();
    }
    
    lightModeColors.push({
      fg: foreground,
      bg: background,
      element: `<${elementTag}>`,
    });
  }
  
  // Add common light mode patterns
  const commonLightPatterns = [
    { fg: "#000000", bg: "#ffffff", element: "light-body" },
    { fg: "#333333", bg: "#ffffff", element: "light-text" },
    { fg: "#666666", bg: "#f5f5f5", element: "light-muted" },
    { fg: "#444444", bg: "#fafafa", element: "light-secondary" },
  ];
  
  lightModeColors.push(...commonLightPatterns);
  
  return lightModeColors;
}

/**
 * Generate recommendation with suggested fixes
 */
function generateContrastRecommendation(
  currentRatio: number,
  textSize: TextSize,
  foreground: string,
  background: string,
  suggestedFixes: ColorSuggestion[]
): string {
  const targetAA = textSize === "large" ? 3 : 4.5;
  const targetAAA = textSize === "large" ? 4.5 : 7;
  
  let recommendation = `Current contrast ratio is ${currentRatio.toFixed(2)}:1. `;
  
  if (currentRatio < targetAA) {
    recommendation += `Needs ${targetAA}:1 for WCAG AA. `;
  } else if (currentRatio < targetAAA) {
    recommendation += `Needs ${targetAAA}:1 for WCAG AAA. `;
  }
  
  if (suggestedFixes.length > 0) {
    recommendation += `Try: ${suggestedFixes[0].description}`;
  } else {
    recommendation += `Increase contrast between text and background.`;
  }
  
  return recommendation;
}

/**
 * Generate mode report
 */
function generateModeReport(issues: ContrastIssue[], mode: ColorMode): ModeReport {
  const wcagAAPass = issues.filter((i) => i.wcagAA).length;
  const wcagAAAPass = issues.filter((i) => i.wcagAAA).length;
  
  return {
    mode,
    contrastIssues: issues,
    wcagAA: {
      pass: wcagAAPass,
      fail: issues.length - wcagAAPass,
      percentage: issues.length > 0 ? Math.round((wcagAAPass / issues.length) * 100) : 100,
    },
    wcagAAA: {
      pass: wcagAAAPass,
      fail: issues.length - wcagAAAPass,
      percentage: issues.length > 0 ? Math.round((wcagAAAPass / issues.length) * 100) : 100,
    },
  };
}

/**
 * Analyze page contrast for both light and dark modes
 */
export async function analyzePageContrast(html: string, url: string): Promise<AccessibilityReport> {
  try {
    // Analyze both modes
    const lightIssues = analyzeModeContrast(html, "light");
    const darkIssues = analyzeModeContrast(html, "dark");
    
    const lightReport = generateModeReport(lightIssues, "light");
    const darkReport = generateModeReport(darkIssues, "dark");
    
    // Combined statistics for legacy compatibility
    const allIssues = [...lightIssues, ...darkIssues];
    const wcagAAPass = allIssues.filter((i) => i.wcagAA).length;
    const wcagAAAPass = allIssues.filter((i) => i.wcagAAA).length;
    
    const summary = generateDualModeSummary(lightReport, darkReport);
    
    const report: AccessibilityReport = {
      url,
      timestamp: Date.now(),
      totalElements: Math.max(lightIssues.length, darkIssues.length),
      lightMode: lightReport,
      darkMode: darkReport,
      summary,
      // Legacy fields
      contrastIssues: allIssues,
      wcagAA: {
        pass: wcagAAPass,
        fail: allIssues.length - wcagAAPass,
        percentage: allIssues.length > 0 ? Math.round((wcagAAPass / allIssues.length) * 100) : 100,
      },
      wcagAAA: {
        pass: wcagAAAPass,
        fail: allIssues.length - wcagAAAPass,
        percentage: allIssues.length > 0 ? Math.round((wcagAAAPass / allIssues.length) * 100) : 100,
      },
    };
    
    return report;
  } catch (error) {
    throw new Error(`Failed to analyze page contrast: ${error}`);
  }
}

/**
 * Generate summary for dual-mode analysis
 */
function generateDualModeSummary(lightReport: ModeReport, darkReport: ModeReport): string {
  const lightAA = lightReport.wcagAA.percentage;
  const darkAA = darkReport.wcagAA.percentage;
  
  let summary = "";
  
  if (lightAA >= 90 && darkAA >= 90) {
    summary = "Excellent! Both light and dark modes meet WCAG AA standards.";
  } else if (lightAA >= 80 && darkAA >= 80) {
    summary = "Good accessibility in both modes, with minor improvements needed.";
  } else if (lightAA >= 80 || darkAA >= 80) {
    const betterMode = lightAA > darkAA ? "light" : "dark";
    const worseMode = lightAA > darkAA ? "dark" : "light";
    summary = `${betterMode} mode has good accessibility, but ${worseMode} mode needs improvement.`;
  } else {
    summary = "Both modes need significant accessibility improvements.";
  }
  
  summary += ` Light: ${lightAA}% AA, Dark: ${darkAA}% AA.`;
  
  return summary;
}

/**
 * Suggest improved colors for contrast (legacy function)
 */
export function suggestImprovedColors(
  foreground: string,
  background: string,
  targetRatio: number = 7
): { foreground: string; background: string; ratio: number } {
  const suggestions = generateColorSuggestions(foreground, background, "normal");
  
  if (suggestions.length > 0) {
    const best = suggestions.find(s => s.ratio >= targetRatio) || suggestions[0];
    return {
      foreground: best.color,
      background,
      ratio: best.ratio,
    };
  }
  
  return { foreground, background, ratio: 0 };
}
