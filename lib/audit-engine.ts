/**
 * Website Audit Engine
 * Analyzes websites for CSS and JavaScript consistency issues
 */

export interface AuditIssue {
  id: string;
  category: "css" | "javascript" | "performance" | "best-practice";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  affectedPages?: string[];
  examples?: string[];
  recommendation: string;
  difficulty: "easy" | "medium" | "hard";
  impact: "high" | "medium" | "low";
}

export interface AuditResult {
  url: string;
  timestamp: number;
  cssScore: number;
  jsScore: number;
  overallScore: number;
  accessibilityScore?: number;
  issues: AuditIssue[];
  accessibilityReport?: any;
  summary: {
    totalIssues: number;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
}

interface StylesheetInfo {
  url: string;
  size: number;
  isMinified: boolean;
  isExternal: boolean;
}

interface ScriptInfo {
  url: string;
  size: number;
  isMinified: boolean;
  isExternal: boolean;
  isDuplicate?: boolean;
}

/**
 * Main audit function that analyzes a website
 */
export async function auditWebsite(url: string, skipCache: boolean = false): Promise<AuditResult> {
  try {
    // Ensure URL has protocol
    let auditUrl = url.trim();
    if (!auditUrl.startsWith("http://") && !auditUrl.startsWith("https://")) {
      auditUrl = "https://" + auditUrl;
    }

    // Use our own Vercel Edge Function proxy to bypass CORS restrictions
    // Add cache-busting timestamp if skipCache is true
    const cacheParam = skipCache ? `&t=${Date.now()}` : "";
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(auditUrl)}${cacheParam}`;
    const response = await fetch(proxyUrl);
    const html = await response.text();

    // Parse HTML to extract CSS and JS information
    const cssInfo = extractStylesheetInfo(html, url);
    const jsInfo = extractScriptInfo(html, url);
    const classNames = extractClassNames(html);

    // Generate issues based on analysis
    const issues: AuditIssue[] = [];

    // CSS consistency checks
    issues.push(...analyzeCSSConsistency(cssInfo, classNames));

    // JavaScript consistency checks
    issues.push(...analyzeJSConsistency(jsInfo));

    // Performance checks
    issues.push(...analyzePerformance(cssInfo, jsInfo));

    // Calculate scores
    const cssScore = calculateCSSScore(issues);
    const jsScore = calculateJSScore(issues);
    const overallScore = (cssScore + jsScore) / 2;

    // Analyze color contrast for accessibility
    let accessibilityScore = 100;
    let accessibilityReport: any = undefined;
    try {
      const { analyzePageContrast } = await import("./contrast-analyzer");
      accessibilityReport = await analyzePageContrast(html, auditUrl);
      accessibilityScore = accessibilityReport.wcagAA.percentage;
    } catch (error) {
      console.warn("Failed to analyze contrast:", error);
    }

    // Compile results
    const result: AuditResult = {
      url: auditUrl,
      timestamp: Date.now(),
      cssScore,
      jsScore,
      overallScore,
      accessibilityScore,
      issues,
      accessibilityReport,
      summary: {
        totalIssues: issues.length,
        criticalCount: issues.filter((i) => i.severity === "critical").length,
        warningCount: issues.filter((i) => i.severity === "warning").length,
        infoCount: issues.filter((i) => i.severity === "info").length,
      },
    };

    return result;
  } catch (error) {
    throw new Error(`Failed to audit website: ${error}`);
  }
}

/**
 * Extract stylesheet information from HTML
 */
function extractStylesheetInfo(html: string, baseUrl: string): StylesheetInfo[] {
  const stylesheets: StylesheetInfo[] = [];
  const linkRegex = /<link[^>]*href=["']([^"']+)["'][^>]*>/gi;
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    stylesheets.push({
      url: href,
      size: href.length,
      isMinified: href.includes(".min.css"),
      isExternal: href.startsWith("http") || href.startsWith("//"),
    });
  }

  while ((match = styleRegex.exec(html)) !== null) {
    const content = match[1];
    stylesheets.push({
      url: "inline-style",
      size: content.length,
      isMinified: false,
      isExternal: false,
    });
  }

  return stylesheets;
}

/**
 * Extract script information from HTML
 */
function extractScriptInfo(html: string, baseUrl: string): ScriptInfo[] {
  const scripts: ScriptInfo[] = [];
  const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const inlineRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  const scriptUrls = new Set<string>();

  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1];
    const isDuplicate = scriptUrls.has(src);
    scriptUrls.add(src);

    scripts.push({
      url: src,
      size: src.length,
      isMinified: src.includes(".min.js"),
      isExternal: src.startsWith("http") || src.startsWith("//"),
      isDuplicate,
    });
  }

  while ((match = inlineRegex.exec(html)) !== null) {
    const content = match[1];
    scripts.push({
      url: "inline-script",
      size: content.length,
      isMinified: false,
      isExternal: false,
    });
  }

  return scripts;
}

/**
 * Extract class names from HTML
 */
function extractClassNames(html: string): string[] {
  const classRegex = /class=["']([^"']+)["']/gi;
  const classes = new Set<string>();

  let match;
  while ((match = classRegex.exec(html)) !== null) {
    const classList = match[1].split(/\s+/);
    classList.forEach((cls) => classes.add(cls));
  }

  return Array.from(classes);
}

/**
 * Analyze CSS consistency
 */
function analyzeCSSConsistency(stylesheets: StylesheetInfo[], classNames: string[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Check for CSS fragmentation
  const externalCss = stylesheets.filter((s) => s.isExternal);
  if (externalCss.length > 5) {
    issues.push({
      id: "css-fragmentation",
      category: "css",
      severity: "warning",
      title: "CSS Fragmentation",
      description: `Your site loads ${externalCss.length} external CSS files. This creates unnecessary HTTP requests.`,
      recommendation: "Consolidate CSS files into a single bundle using a build tool.",
      difficulty: "medium",
      impact: "high",
    });
  }

  // Check for unminified CSS
  const unminifiedCss = stylesheets.filter((s) => s.isExternal && !s.isMinified);
  if (unminifiedCss.length > 0) {
    issues.push({
      id: "unminified-css",
      category: "performance",
      severity: "info",
      title: "Unminified CSS Files",
      description: `${unminifiedCss.length} CSS files are not minified.`,
      recommendation: "Use a build tool to minify CSS files for production.",
      difficulty: "easy",
      impact: "medium",
    });
  }

  // Check for inline styles
  const inlineStyles = stylesheets.filter((s) => s.url === "inline-style");
  if (inlineStyles.length > 0) {
    issues.push({
      id: "inline-styles",
      category: "css",
      severity: "info",
      title: "Inline Styles Detected",
      description: `Found ${inlineStyles.length} inline <style> tags. Consider moving to external files.`,
      recommendation: "Extract inline styles to external CSS files for better caching.",
      difficulty: "easy",
      impact: "low",
    });
  }

  // Check for inconsistent class naming
  const inconsistentNaming = classNames.filter((cls) => {
    const hasUnderscore = cls.includes("_");
    const hasHyphen = cls.includes("-");
    const hasCamelCase = /[a-z][A-Z]/.test(cls);
    return (hasUnderscore && hasHyphen) || (hasUnderscore && hasCamelCase) || (hasHyphen && hasCamelCase);
  });

  if (inconsistentNaming.length > 0) {
    issues.push({
      id: "inconsistent-naming",
      category: "css",
      severity: "warning",
      title: "Inconsistent CSS Naming",
      description: `Found ${inconsistentNaming.length} classes with mixed naming conventions.`,
      recommendation: "Adopt a consistent naming convention like BEM or SMACSS.",
      difficulty: "medium",
      impact: "medium",
    });
  }

  return issues;
}

/**
 * Analyze JavaScript consistency
 */
function analyzeJSConsistency(scripts: ScriptInfo[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Check for duplicate scripts
  const duplicates = scripts.filter((s) => s.isDuplicate);
  if (duplicates.length > 0) {
    const duplicateUrls = Array.from(new Set(duplicates.map(s => s.url)));
    issues.push({
      id: "duplicate-scripts",
      category: "javascript",
      severity: "critical",
      title: "Duplicate Script Files",
      description: `${duplicates.length} script files are loaded multiple times.`,
      examples: duplicateUrls,
      recommendation: "Remove duplicate script tags from your HTML. Check these URLs: " + duplicateUrls.join(", "),
      difficulty: "easy",
      impact: "high",
    });
  }

  // Check for script fragmentation
  const externalScripts = scripts.filter((s) => s.isExternal);
  if (externalScripts.length > 5) {
    issues.push({
      id: "script-fragmentation",
      category: "javascript",
      severity: "warning",
      title: "Script Fragmentation",
      description: `Your site loads ${externalScripts.length} external JavaScript files.`,
      recommendation: "Bundle JavaScript files using a module bundler.",
      difficulty: "hard",
      impact: "high",
    });
  }

  // Check for unminified scripts
  const unminifiedScripts = scripts.filter((s) => s.isExternal && !s.isMinified);
  if (unminifiedScripts.length > 0) {
    issues.push({
      id: "unminified-js",
      category: "performance",
      severity: "info",
      title: "Unminified JavaScript Files",
      description: `${unminifiedScripts.length} JavaScript files are not minified.`,
      recommendation: "Minify JavaScript files for production.",
      difficulty: "easy",
      impact: "medium",
    });
  }

  // Check for inline scripts
  const inlineScripts = scripts.filter((s) => s.url === "inline-script");
  if (inlineScripts.length > 0) {
    issues.push({
      id: "inline-scripts",
      category: "javascript",
      severity: "info",
      title: "Inline Scripts Detected",
      description: `Found ${inlineScripts.length} inline <script> tags.`,
      recommendation: "Extract inline scripts to external files.",
      difficulty: "medium",
      impact: "low",
    });
  }

  return issues;
}

/**
 * Analyze performance
 */
function analyzePerformance(stylesheets: StylesheetInfo[], scripts: ScriptInfo[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  const totalAssets = stylesheets.length + scripts.length;
  if (totalAssets > 15) {
    issues.push({
      id: "too-many-assets",
      category: "performance",
      severity: "critical",
      title: "Excessive Asset Count",
      description: `Your site loads ${totalAssets} CSS and JavaScript files. This creates too many HTTP requests.`,
      recommendation: "Consolidate and bundle your assets.",
      difficulty: "hard",
      impact: "high",
    });
  }

  return issues;
}

/**
 * Calculate CSS score (0-100)
 */
function calculateCSSScore(issues: AuditIssue[]): number {
  const cssIssues = issues.filter((i) => i.category === "css");
  const criticalCount = cssIssues.filter((i) => i.severity === "critical").length;
  const warningCount = cssIssues.filter((i) => i.severity === "warning").length;

  let score = 100;
  score -= criticalCount * 20;
  score -= warningCount * 10;

  return Math.max(0, score);
}

/**
 * Calculate JavaScript score (0-100)
 */
function calculateJSScore(issues: AuditIssue[]): number {
  const jsIssues = issues.filter((i) => i.category === "javascript");
  const criticalCount = jsIssues.filter((i) => i.severity === "critical").length;
  const warningCount = jsIssues.filter((i) => i.severity === "warning").length;

  let score = 100;
  score -= criticalCount * 20;
  score -= warningCount * 10;

  return Math.max(0, score);
}
