/**
 * Bootstrap Fallback Variables
 * Provides default Bootstrap CSS variables when none are found in the website
 */

import { CSSVariable, CSSVariablePalette } from "./css-variable-extractor";

/**
 * Default Bootstrap 5 color variables
 * These are the core Bootstrap color system variables
 */
export const BOOTSTRAP_DEFAULT_VARIABLES: CSSVariable[] = [
  // Primary colors
  {
    name: "--bs-primary",
    value: "#0d6efd",
    originalValue: "#0d6efd",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  {
    name: "--bs-secondary",
    value: "#6c757d",
    originalValue: "#6c757d",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  {
    name: "--bs-success",
    value: "#198754",
    originalValue: "#198754",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  {
    name: "--bs-info",
    value: "#0dcaf0",
    originalValue: "#0dcaf0",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  {
    name: "--bs-warning",
    value: "#ffc107",
    originalValue: "#ffc107",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  {
    name: "--bs-danger",
    value: "#dc3545",
    originalValue: "#dc3545",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  {
    name: "--bs-light",
    value: "#f8f9fa",
    originalValue: "#f8f9fa",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  {
    name: "--bs-dark",
    value: "#212529",
    originalValue: "#212529",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  
  // Body colors
  {
    name: "--bs-body-color",
    value: "#212529",
    originalValue: "#212529",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  {
    name: "--bs-body-bg",
    value: "#ffffff",
    originalValue: "#ffffff",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  
  // Link colors
  {
    name: "--bs-link-color",
    value: "#0d6efd",
    originalValue: "#0d6efd",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  {
    name: "--bs-link-hover-color",
    value: "#0a58ca",
    originalValue: "#0a58ca",
    selector: ":root",
    type: "color",
    source: "inline",
  },
  
  // Border colors
  {
    name: "--bs-border-color",
    value: "#dee2e6",
    originalValue: "#dee2e6",
    selector: ":root",
    type: "color",
    source: "inline",
  },
];

/**
 * Dark mode Bootstrap variables
 */
export const BOOTSTRAP_DARK_VARIABLES: CSSVariable[] = [
  {
    name: "--bs-body-color",
    value: "#dee2e6",
    originalValue: "#dee2e6",
    selector: ":root",
    type: "color",
    source: "inline",
    mode: "dark",
  },
  {
    name: "--bs-body-bg",
    value: "#212529",
    originalValue: "#212529",
    selector: ":root",
    type: "color",
    source: "inline",
    mode: "dark",
  },
  {
    name: "--bs-border-color",
    value: "#495057",
    originalValue: "#495057",
    selector: ":root",
    type: "color",
    source: "inline",
    mode: "dark",
  },
];

/**
 * Check if HTML contains Bootstrap
 */
export function detectBootstrap(html: string): boolean {
  // Check for Bootstrap class names
  const bootstrapClasses = [
    'class="container',
    'class="row',
    'class="col-',
    'class="btn',
    'class="navbar',
    'class="card',
    'class="modal',
    'class="alert',
  ];
  
  for (const className of bootstrapClasses) {
    if (html.includes(className)) {
      return true;
    }
  }
  
  // Check for Bootstrap CDN or file references
  const bootstrapReferences = [
    'bootstrap.min.css',
    'bootstrap.css',
    'bootstrap.bundle.min.js',
    'bootstrap.min.js',
    'cdn.jsdelivr.net/npm/bootstrap',
    'stackpath.bootstrapcdn.com/bootstrap',
    'maxcdn.bootstrapcdn.com/bootstrap',
  ];
  
  for (const ref of bootstrapReferences) {
    if (html.includes(ref)) {
      return true;
    }
  }
  
  // Check for Bootstrap CSS variables in inline styles
  if (html.includes('--bs-')) {
    return true;
  }
  
  return false;
}

/**
 * Get Bootstrap fallback palette
 */
export function getBootstrapFallbackPalette(): CSSVariablePalette {
  return {
    light: BOOTSTRAP_DEFAULT_VARIABLES,
    dark: BOOTSTRAP_DARK_VARIABLES,
    shared: [],
  };
}

/**
 * Enhance palette with Bootstrap fallback if needed
 * If no variables are found but Bootstrap is detected, use Bootstrap defaults
 */
export function enhancePaletteWithBootstrapFallback(
  palette: CSSVariablePalette,
  html: string
): CSSVariablePalette {
  // If we already have variables, return as-is
  const totalVars = palette.light.length + palette.dark.length + palette.shared.length;
  if (totalVars > 0) {
    return palette;
  }
  
  // Check if Bootstrap is present
  const hasBootstrap = detectBootstrap(html);
  if (!hasBootstrap) {
    return palette;
  }
  
  // Return Bootstrap fallback
  console.log("No CSS variables found, but Bootstrap detected. Using Bootstrap defaults.");
  return getBootstrapFallbackPalette();
}
