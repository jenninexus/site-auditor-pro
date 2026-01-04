/**
 * CSS Variable Extractor
 * Extracts CSS custom properties (variables) from HTML and CSS
 */

export interface CSSVariable {
  name: string; // e.g., "--color-primary"
  value: string; // e.g., "#0a7ea4"
  originalValue: string; // Store original for reset
  selector: string; // e.g., ":root"
  type: "color" | "size" | "other";
  source: "inline" | "stylesheet"; // Where it was found
}

/**
 * Check if a value is a color
 */
function isColorValue(value: string): boolean {
  const trimmed = value.trim();

  // Hex colors
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(trimmed)) {
    return true;
  }

  // RGB/RGBA
  if (/^rgba?\(/.test(trimmed)) {
    return true;
  }

  // HSL/HSLA
  if (/^hsla?\(/.test(trimmed)) {
    return true;
  }

  // Named colors (common ones)
  const namedColors = [
    "black",
    "white",
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "pink",
    "gray",
    "grey",
    "brown",
    "cyan",
    "magenta",
    "transparent",
  ];
  if (namedColors.includes(trimmed.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Check if a value is a size/dimension
 */
function isSizeValue(value: string): boolean {
  const trimmed = value.trim();
  return /^-?\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|cm|mm|in)$/.test(trimmed);
}

/**
 * Determine the type of CSS variable
 */
function getVariableType(value: string): CSSVariable["type"] {
  if (isColorValue(value)) return "color";
  if (isSizeValue(value)) return "size";
  return "other";
}

/**
 * Extract CSS variables from inline styles
 */
function extractFromInlineStyles(html: string): CSSVariable[] {
  const variables: CSSVariable[] = [];
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;

  while ((match = styleTagRegex.exec(html)) !== null) {
    const cssContent = match[1];
    variables.push(...parseCSSContent(cssContent, "inline"));
  }

  return variables;
}

/**
 * Parse CSS content for variables
 */
function parseCSSContent(
  css: string,
  source: "inline" | "stylesheet"
): CSSVariable[] {
  const variables: CSSVariable[] = [];

  // Match CSS rules with variable declarations
  // Pattern: selector { --var-name: value; }
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  let ruleMatch;

  while ((ruleMatch = ruleRegex.exec(css)) !== null) {
    const selector = ruleMatch[1].trim();
    const declarations = ruleMatch[2];

    // Extract variable declarations
    const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let varMatch;

    while ((varMatch = varRegex.exec(declarations)) !== null) {
      const name = `--${varMatch[1]}`;
      const value = varMatch[2].trim();

      variables.push({
        name,
        value,
        originalValue: value,
        selector,
        type: getVariableType(value),
        source,
      });
    }
  }

  return variables;
}

/**
 * Extract CSS variables from external stylesheets
 * Note: In browser, we can only extract from same-origin stylesheets
 */
function extractFromStylesheets(html: string): CSSVariable[] {
  // For now, we'll focus on inline styles
  // External stylesheet extraction would require fetching them separately
  // which we can add as an enhancement
  return [];
}

/**
 * Main function to extract all CSS variables from HTML
 */
export function extractCSSVariables(html: string): CSSVariable[] {
  const variables: CSSVariable[] = [];

  // Extract from inline styles
  variables.push(...extractFromInlineStyles(html));

  // Extract from external stylesheets (future enhancement)
  variables.push(...extractFromStylesheets(html));

  // Remove duplicates (keep first occurrence)
  const seen = new Set<string>();
  const unique = variables.filter((v) => {
    const key = `${v.name}-${v.selector}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: colors first, then by name
  return unique.sort((a, b) => {
    if (a.type === "color" && b.type !== "color") return -1;
    if (a.type !== "color" && b.type === "color") return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Filter variables by type
 */
export function filterVariablesByType(
  variables: CSSVariable[],
  type: CSSVariable["type"]
): CSSVariable[] {
  return variables.filter((v) => v.type === type);
}

/**
 * Get only color variables
 */
export function getColorVariables(variables: CSSVariable[]): CSSVariable[] {
  return filterVariablesByType(variables, "color");
}

/**
 * Generate CSS string from variables
 */
export function generateCSSFromVariables(
  variables: CSSVariable[],
  modifiedValues?: Map<string, string>
): string {
  // Group by selector
  const grouped = new Map<string, CSSVariable[]>();

  variables.forEach((v) => {
    if (!grouped.has(v.selector)) {
      grouped.set(v.selector, []);
    }
    grouped.get(v.selector)!.push(v);
  });

  // Generate CSS
  let css = "/* Modified CSS Variables */\n\n";

  grouped.forEach((vars, selector) => {
    css += `${selector} {\n`;
    vars.forEach((v) => {
      const value = modifiedValues?.get(v.name) || v.value;
      css += `  ${v.name}: ${value};\n`;
    });
    css += "}\n\n";
  });

  return css;
}

/**
 * Convert color to hex format for consistency
 */
export function normalizeColor(color: string): string {
  // This is a simple implementation
  // For production, consider using a color library like tinycolor2

  const trimmed = color.trim();

  // Already hex
  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  // RGB to hex (simplified)
  const rgbMatch = trimmed.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, "0");
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, "0");
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  // Return as-is for other formats
  return trimmed;
}

/**
 * Get a preview of how many variables were found
 */
export function getVariableSummary(variables: CSSVariable[]): {
  total: number;
  colors: number;
  sizes: number;
  other: number;
} {
  return {
    total: variables.length,
    colors: variables.filter((v) => v.type === "color").length,
    sizes: variables.filter((v) => v.type === "size").length,
    other: variables.filter((v) => v.type === "other").length,
  };
}
