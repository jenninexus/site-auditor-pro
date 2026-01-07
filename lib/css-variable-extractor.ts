/**
 * Enhanced CSS Variable Extractor
 * Extracts CSS custom properties (variables) from HTML and CSS
 * Separates light and dark mode variables
 */

export type ColorMode = "light" | "dark";

export interface CSSVariable {
  name: string; // e.g., "--color-primary"
  value: string; // e.g., "#0a7ea4"
  originalValue: string; // Store original for reset
  selector: string; // e.g., ":root"
  type: "color" | "size" | "other";
  source: "inline" | "stylesheet"; // Where it was found
  mode?: ColorMode; // NEW: Which mode this variable belongs to
  darkModeValue?: string; // NEW: Alternate value for dark mode
}

export interface CSSVariablePalette {
  light: CSSVariable[];
  dark: CSSVariable[];
  shared: CSSVariable[]; // Variables without mode-specific values
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
    "black", "white", "red", "green", "blue", "yellow", "orange",
    "purple", "pink", "gray", "grey", "brown", "cyan", "magenta", "transparent",
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
 * Parse Bootstrap data-bs-theme dark mode rules
 */
function parseBootstrapDarkMode(css: string): Map<string, string> {
  const darkModeVars = new Map<string, string>();
  
  // Match [data-bs-theme="dark"] blocks
  const bootstrapDarkRegex = /\[data-bs-theme=["']dark["']\]\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/gi;
  let match;
  
  while ((match = bootstrapDarkRegex.exec(css)) !== null) {
    const darkBlock = match[1];
    
    // Extract Bootstrap variable declarations
    const varRegex = /--(bs-[\w-]+)\s*:\s*([^;]+);/g;
    let varMatch;
    
    while ((varMatch = varRegex.exec(darkBlock)) !== null) {
      const name = `--${varMatch[1]}`;
      const value = varMatch[2].trim();
      darkModeVars.set(name, value);
    }
  }
  
  return darkModeVars;
}

/**
 * Parse dark mode CSS rules (media query)
 */
function parseDarkModeRules(css: string): Map<string, string> {
  const darkModeVars = new Map<string, string>();
  
  // Match @media (prefers-color-scheme: dark) blocks
  const darkModeRegex = /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/gi;
  let match;
  
  while ((match = darkModeRegex.exec(css)) !== null) {
    const darkBlock = match[1];
    
    // Extract variable declarations from the dark mode block
    const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let varMatch;
    
    while ((varMatch = varRegex.exec(darkBlock)) !== null) {
      const name = `--${varMatch[1]}`;
      const value = varMatch[2].trim();
      darkModeVars.set(name, value);
    }
  }
  
  // Also check for Bootstrap dark mode
  const bootstrapVars = parseBootstrapDarkMode(css);
  bootstrapVars.forEach((value, name) => {
    darkModeVars.set(name, value);
  });
  
  return darkModeVars;
}

/**
 * Parse CSS content for variables with mode detection
 */
function parseCSSContent(
  css: string,
  source: "inline" | "stylesheet"
): CSSVariable[] {
  const variables: CSSVariable[] = [];
  const darkModeVars = parseDarkModeRules(css);
  
  // Match CSS rules with variable declarations (excluding @media blocks)
  // Remove @media blocks first to avoid double-counting
  const cssWithoutMedia = css.replace(/@media[^{]+\{[^}]+(?:\{[^}]*\}[^}]*)*\}/gi, '');
  
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  let ruleMatch;

  while ((ruleMatch = ruleRegex.exec(cssWithoutMedia)) !== null) {
    const selector = ruleMatch[1].trim();
    const declarations = ruleMatch[2];

    // Extract variable declarations
    const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let varMatch;

    while ((varMatch = varRegex.exec(declarations)) !== null) {
      const name = `--${varMatch[1]}`;
      const value = varMatch[2].trim();
      const darkValue = darkModeVars.get(name);
      
      const variable: CSSVariable = {
        name,
        value,
        originalValue: value,
        selector,
        type: getVariableType(value),
        source,
      };
      
      // If there's a dark mode value, mark this as having both modes
      if (darkValue) {
        variable.darkModeValue = darkValue;
        variable.mode = "light"; // The base value is for light mode
      }
      
      variables.push(variable);
      
      // If there's a dark mode value, also create a dark mode entry
      if (darkValue) {
        variables.push({
          name,
          value: darkValue,
          originalValue: darkValue,
          selector,
          type: getVariableType(darkValue),
          source,
          mode: "dark",
        });
      }
    }
  }

  return variables;
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
 * Group variables by mode
 */
function groupVariablesByMode(variables: CSSVariable[]): CSSVariablePalette {
  const light: CSSVariable[] = [];
  const dark: CSSVariable[] = [];
  const shared: CSSVariable[] = [];
  
  // Group by variable name to detect mode-specific variables
  const byName = new Map<string, CSSVariable[]>();
  
  variables.forEach(v => {
    if (!byName.has(v.name)) {
      byName.set(v.name, []);
    }
    byName.get(v.name)!.push(v);
  });
  
  // Categorize each variable
  byName.forEach((vars, name) => {
    const lightVar = vars.find(v => v.mode === "light" || !v.mode);
    const darkVar = vars.find(v => v.mode === "dark");
    
    if (lightVar && darkVar) {
      // Has both modes
      light.push(lightVar);
      dark.push(darkVar);
    } else if (lightVar && lightVar.darkModeValue) {
      // Has dark mode value stored
      light.push(lightVar);
      dark.push({
        ...lightVar,
        value: lightVar.darkModeValue,
        originalValue: lightVar.darkModeValue,
        mode: "dark",
      });
    } else if (lightVar) {
      // Only light mode (or no mode specified)
      shared.push(lightVar);
    } else if (darkVar) {
      // Only dark mode
      dark.push(darkVar);
    }
  });
  
  return { light, dark, shared };
}

/**
 * Main function to extract all CSS variables from HTML and external stylesheets
 */
export async function extractCSSVariables(html: string, baseUrl?: string): Promise<CSSVariable[]> {
  const variables: CSSVariable[] = [];

  // 1. Extract from inline styles
  variables.push(...extractFromInlineStyles(html));

  // 2. Extract from style attributes
  const styleAttrRegex = /style=["']([^"']+)["']/gi;
  let match;
  while ((match = styleAttrRegex.exec(html)) !== null) {
    const styleAttr = match[1];
    const varRegex = /--([\w-]+)\s*:\s*([^;]+)/g;
    let varMatch;
    while ((varMatch = varRegex.exec(styleAttr)) !== null) {
      const name = `--${varMatch[1]}`;
      const value = varMatch[2].trim();
      variables.push({
        name,
        value,
        originalValue: value,
        selector: "inline-attr",
        type: getVariableType(value),
        source: "inline",
      });
    }
  }

  // 3. Extract from external stylesheets if baseUrl is provided
  if (baseUrl) {
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>|<link[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi;
    let linkMatch;
    const stylesheetUrls: string[] = [];

    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const href = linkMatch[1] || linkMatch[2];
      if (href) {
        try {
          let fullUrl = href;
          if (!href.startsWith("http") && !href.startsWith("//")) {
            const base = new URL(baseUrl);
            fullUrl = new URL(href, base.origin + base.pathname).href;
          } else if (href.startsWith("//")) {
            fullUrl = "https:" + href;
          }
          stylesheetUrls.push(fullUrl);
        } catch (e) {
          console.warn("Failed to parse stylesheet URL:", href);
        }
      }
    }

    // Fetch and parse each stylesheet
    for (const url of stylesheetUrls) {
      try {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const cssContent = await response.text();
          variables.push(...parseCSSContent(cssContent, "stylesheet"));
        }
      } catch (e) {
        console.warn("Failed to fetch external stylesheet:", url);
      }
    }
  }

  // Remove duplicates (keep first occurrence)
  const seen = new Set<string>();
  const unique = variables.filter((v) => {
    const key = `${v.name}-${v.selector}-${v.mode || 'none'}`;
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
 * Extract CSS variables separated by mode
 * Async function that fetches external stylesheets when baseUrl is provided
 */
export async function extractCSSVariablesByMode(html: string, baseUrl?: string): Promise<CSSVariablePalette> {
  const allVariables = await extractCSSVariables(html, baseUrl);
  return groupVariablesByMode(allVariables);
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
 * Get color variables for a specific mode
 */
export function getColorVariablesByMode(
  palette: CSSVariablePalette,
  mode: ColorMode
): CSSVariable[] {
  const vars = mode === "light" ? palette.light : palette.dark;
  const sharedVars = palette.shared;
  
  // Combine mode-specific colors with shared colors
  const allColors = [...getColorVariables(vars), ...getColorVariables(sharedVars)];
  
  // Deduplicate by name
  const seen = new Set<string>();
  return allColors.filter(v => {
    if (seen.has(v.name)) return false;
    seen.add(v.name);
    return true;
  });
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
 * Generate CSS with separate light and dark mode sections
 */
export function generateDualModeCSSFromVariables(
  palette: CSSVariablePalette,
  lightModified?: Map<string, string>,
  darkModified?: Map<string, string>
): string {
  let css = "/* Modified CSS Variables (Light & Dark Modes) */\n\n";
  
  // Light mode (default)
  if (palette.light.length > 0 || palette.shared.length > 0) {
    const lightVars = [...palette.light, ...palette.shared];
    const grouped = new Map<string, CSSVariable[]>();
    
    lightVars.forEach(v => {
      if (!grouped.has(v.selector)) {
        grouped.set(v.selector, []);
      }
      grouped.get(v.selector)!.push(v);
    });
    
    grouped.forEach((vars, selector) => {
      css += `${selector} {\n`;
      vars.forEach(v => {
        const value = lightModified?.get(v.name) || v.value;
        css += `  ${v.name}: ${value};\n`;
      });
      css += "}\n\n";
    });
  }
  
  // Dark mode
  if (palette.dark.length > 0) {
    css += "@media (prefers-color-scheme: dark) {\n";
    
    const darkVars = palette.dark;
    const grouped = new Map<string, CSSVariable[]>();
    
    darkVars.forEach(v => {
      if (!grouped.has(v.selector)) {
        grouped.set(v.selector, []);
      }
      grouped.get(v.selector)!.push(v);
    });
    
    grouped.forEach((vars, selector) => {
      css += `  ${selector} {\n`;
      vars.forEach(v => {
        const value = darkModified?.get(v.name) || v.value;
        css += `    ${v.name}: ${value};\n`;
      });
      css += `  }\n\n`;
    });
    
    css += "}\n";
  }
  
  return css;
}

/**
 * Convert color to hex format for consistency
 */
export function normalizeColor(color: string): string {
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
