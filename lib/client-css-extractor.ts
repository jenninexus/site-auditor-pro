/**
 * Client-Side CSS Variable Extractor
 * Extracts CSS variables directly from the browser's computed styles
 * Used as a fallback when server-side extraction fails
 */

import { CSSVariable, CSSVariablePalette, ColorMode } from "./css-variable-extractor";

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
 * Extract CSS variables from an iframe's document
 * This runs client-side in the browser
 */
export function extractCSSVariablesFromIframe(iframe: HTMLIFrameElement): CSSVariablePalette {
  const variables: CSSVariable[] = [];
  
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      console.warn("Cannot access iframe document");
      return { light: [], dark: [], shared: [] };
    }

    // Get all stylesheets from the iframe
    const stylesheets = Array.from(doc.styleSheets);
    
    for (const sheet of stylesheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        
        for (const rule of rules) {
          // Check for :root or body rules
          if (rule instanceof CSSStyleRule && 
              (rule.selectorText === ':root' || rule.selectorText === 'body')) {
            
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--')) {
                const value = style.getPropertyValue(prop).trim();
                variables.push({
                  name: prop,
                  value,
                  originalValue: value,
                  selector: rule.selectorText,
                  type: getVariableType(value),
                  source: "stylesheet",
                  mode: "light", // Default to light mode
                });
              }
            }
          }
          
          // Check for dark mode rules
          if (rule instanceof CSSStyleRule && 
              (rule.selectorText.includes('[data-bs-theme="dark"]') ||
               rule.selectorText.includes('.dark') ||
               rule.selectorText.includes('[data-theme="dark"]') ||
               rule.selectorText.includes('@media (prefers-color-scheme: dark)'))) {
            
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--')) {
                const value = style.getPropertyValue(prop).trim();
                variables.push({
                  name: prop,
                  value,
                  originalValue: value,
                  selector: rule.selectorText,
                  type: getVariableType(value),
                  source: "stylesheet",
                  mode: "dark",
                });
              }
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet, skip
        console.warn("Cannot access stylesheet:", e);
      }
    }

    // Also check computed styles on the root element
    const rootStyles = doc.defaultView?.getComputedStyle(doc.documentElement);
    if (rootStyles) {
      for (let i = 0; i < rootStyles.length; i++) {
        const prop = rootStyles[i];
        if (prop.startsWith('--')) {
          const value = rootStyles.getPropertyValue(prop).trim();
          // Only add if not already found
          if (!variables.some(v => v.name === prop && v.mode === "light")) {
            variables.push({
              name: prop,
              value,
              originalValue: value,
              selector: ":root",
              type: getVariableType(value),
              source: "stylesheet",
              mode: "light",
            });
          }
        }
      }
    }

  } catch (error) {
    console.error("Error extracting CSS variables from iframe:", error);
  }

  // Group by mode
  const lightVars = variables.filter(v => v.mode === "light");
  const darkVars = variables.filter(v => v.mode === "dark");
  
  // Variables that appear in both modes are "shared"
  const sharedVarNames = new Set(
    lightVars.filter(lv => darkVars.some(dv => dv.name === lv.name)).map(v => v.name)
  );
  
  const shared = lightVars.filter(v => sharedVarNames.has(v.name));
  const lightOnly = lightVars.filter(v => !sharedVarNames.has(v.name));
  const darkOnly = darkVars.filter(v => !sharedVarNames.has(v.name));

  return {
    light: [...shared, ...lightOnly],
    dark: [...shared, ...darkOnly],
    shared,
  };
}

/**
 * Extract CSS variables from the current page's computed styles
 * This is a simpler version that just gets variables from :root
 */
export function extractCSSVariablesFromPage(): CSSVariable[] {
  const variables: CSSVariable[] = [];
  
  try {
    const rootStyles = getComputedStyle(document.documentElement);
    
    for (let i = 0; i < rootStyles.length; i++) {
      const prop = rootStyles[i];
      if (prop.startsWith('--')) {
        const value = rootStyles.getPropertyValue(prop).trim();
        variables.push({
          name: prop,
          value,
          originalValue: value,
          selector: ":root",
          type: getVariableType(value),
          source: "stylesheet",
        });
      }
    }
  } catch (error) {
    console.error("Error extracting CSS variables:", error);
  }

  return variables;
}
