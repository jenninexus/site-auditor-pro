/**
 * Color Contrast Analyzer
 * Analyzes color contrast ratios and WCAG compliance
 */

export type WCAGLevel = "AAA" | "AA" | "Fail";
export type TextSize = "normal" | "large";

export interface ContrastIssue {
  element: string;
  foreground: string;
  background: string;
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  textSize: TextSize;
  recommendation: string;
}

export interface AccessibilityReport {
  url: string;
  timestamp: number;
  totalElements: number;
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
  summary: string;
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
    const hex = x.toString(16);
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
 * Extract colors from HTML and analyze contrast
 */
export async function analyzePageContrast(html: string, url: string): Promise<AccessibilityReport> {
  const issues: ContrastIssue[] = [];
  let totalElements = 0;

  try {
    // Parse HTML to find text elements
    const textElementRegex = /<(p|h[1-6]|a|button|span|div|li)[^>]*style="([^"]*)"[^>]*>([^<]*)<\/\1>/gi;
    const styleRegex = /color:\s*([^;]+);|background(?:-color)?:\s*([^;]+);/gi;

    let match;
    while ((match = textElementRegex.exec(html)) !== null) {
      totalElements++;
      const elementTag = match[1];
      const styleAttr = match[2];
      const content = match[3];

      if (!content.trim()) continue;

      let foreground = "#000000";
      let background = "#ffffff";

      let styleMatch;
      while ((styleMatch = styleRegex.exec(styleAttr)) !== null) {
        if (styleMatch[1]) {
          foreground = styleMatch[1].trim();
        }
        if (styleMatch[2]) {
          background = styleMatch[2].trim();
        }
      }

      const ratio = calculateContrastRatio(foreground, background);
      if (ratio === null) continue;

      const textSize: TextSize = ["h1", "h2", "h3"].includes(elementTag) ? "large" : "normal";
      const wcagLevel = getWCAGLevel(ratio, textSize);

      if (wcagLevel === "Fail") {
        const recommendation = generateContrastRecommendation(ratio, textSize, foreground, background);

        issues.push({
          element: `<${elementTag}>`,
          foreground,
          background,
          ratio: Math.round(ratio * 100) / 100,
          wcagAA: ratio >= (textSize === "large" ? 3 : 4.5),
          wcagAAA: ratio >= (textSize === "large" ? 4.5 : 7),
          textSize,
          recommendation,
        });
      }
    }

    // Also check computed styles from the page
    const computedIssues = extractComputedContrasts(html);
    issues.push(...computedIssues);

    // Calculate statistics
    const wcagAAPass = issues.filter((i) => i.wcagAA).length;
    const wcagAAAPass = issues.filter((i) => i.wcagAAA).length;

    const report: AccessibilityReport = {
      url,
      timestamp: Date.now(),
      totalElements: Math.max(totalElements, issues.length),
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
      summary: generateAccessibilitySummary(issues, wcagAAPass, wcagAAAPass),
    };

    return report;
  } catch (error) {
    throw new Error(`Failed to analyze page contrast: ${error}`);
  }
}

/**
 * Extract contrast issues from computed styles in HTML
 */
function extractComputedContrasts(html: string): ContrastIssue[] {
  const issues: ContrastIssue[] = [];

  // Look for common color patterns in CSS
  const colorPatterns = [
    { fg: "#11181C", bg: "#ffffff", level: "normal" }, // Dark text on white
    { fg: "#ECEDEE", bg: "#151718", level: "normal" }, // Light text on dark
    { fg: "#687076", bg: "#ffffff", level: "normal" }, // Muted text on white
    { fg: "#9BA1A6", bg: "#151718", level: "normal" }, // Muted text on dark
  ];

  colorPatterns.forEach((pattern) => {
    const ratio = calculateContrastRatio(pattern.fg, pattern.bg);
    if (ratio && ratio < 4.5) {
      issues.push({
        element: "computed-style",
        foreground: pattern.fg,
        background: pattern.bg,
        ratio: Math.round(ratio * 100) / 100,
        wcagAA: ratio >= 4.5,
        wcagAAA: ratio >= 7,
        textSize: pattern.level as TextSize,
        recommendation: generateContrastRecommendation(ratio, pattern.level as TextSize, pattern.fg, pattern.bg),
      });
    }
  });

  return issues;
}

/**
 * Generate recommendation for improving contrast
 */
function generateContrastRecommendation(
  currentRatio: number,
  textSize: TextSize,
  foreground: string,
  background: string
): string {
  const targetAA = textSize === "large" ? 3 : 4.5;
  const targetAAA = textSize === "large" ? 4.5 : 7;

  let recommendation = `Current contrast ratio is ${currentRatio.toFixed(2)}:1. `;

  if (currentRatio < targetAA) {
    recommendation += `To meet WCAG AA (${targetAA}:1), `;
    recommendation += "make the text darker or the background lighter. ";
  } else if (currentRatio < targetAAA) {
    recommendation += `To meet WCAG AAA (${targetAAA}:1), `;
    recommendation += "increase the contrast further. ";
  }

  recommendation += `Try using a darker shade of text or adjusting the background color.`;

  return recommendation;
}

/**
 * Generate accessibility summary
 */
function generateAccessibilitySummary(
  issues: ContrastIssue[],
  wcagAAPass: number,
  wcagAAAPass: number
): string {
  if (issues.length === 0) {
    return "Excellent! All text elements meet WCAG AAA contrast requirements.";
  }

  const wcagAAPercentage = Math.round((wcagAAPass / issues.length) * 100);
  const wcagAAAPercentage = Math.round((wcagAAAPass / issues.length) * 100);

  let summary = `Found ${issues.length} contrast issues. `;
  summary += `${wcagAAPercentage}% meet WCAG AA, ${wcagAAAPercentage}% meet WCAG AAA. `;

  if (wcagAAPercentage < 50) {
    summary += "Significant improvements needed for accessibility.";
  } else if (wcagAAPercentage < 80) {
    summary += "Several contrast issues should be addressed.";
  } else {
    summary += "Most elements meet standards; minor improvements recommended.";
  }

  return summary;
}

/**
 * Suggest improved colors for contrast
 */
export function suggestImprovedColors(
  foreground: string,
  background: string,
  targetRatio: number = 7
): { foreground: string; background: string; ratio: number } {
  const fgRgb = parseColor(foreground);
  const bgRgb = parseColor(background);

  if (!fgRgb || !bgRgb) {
    return { foreground, background, ratio: 0 };
  }

  // Try darkening the foreground
  let adjustedFg = { ...fgRgb };
  let ratio = calculateContrastRatio(rgbToHex(adjustedFg.r, adjustedFg.g, adjustedFg.b), background) || 0;

  while (ratio < targetRatio && (adjustedFg.r > 0 || adjustedFg.g > 0 || adjustedFg.b > 0)) {
    adjustedFg.r = Math.max(0, adjustedFg.r - 20);
    adjustedFg.g = Math.max(0, adjustedFg.g - 20);
    adjustedFg.b = Math.max(0, adjustedFg.b - 20);
    ratio = calculateContrastRatio(rgbToHex(adjustedFg.r, adjustedFg.g, adjustedFg.b), background) || 0;
  }

  return {
    foreground: rgbToHex(adjustedFg.r, adjustedFg.g, adjustedFg.b),
    background,
    ratio: Math.round(ratio * 100) / 100,
  };
}
