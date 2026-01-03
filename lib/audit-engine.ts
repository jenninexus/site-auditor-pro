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
  issues: AuditIssue[];
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
export async function auditWebsite(url: string): Promise<AuditResult> {
  try {
    // Ensure URL has protocol
    let auditUrl = url.trim();
    if (!auditUrl.startsWith("http://") && !auditUrl.startsWith("https://")) {
      auditUrl = "https://" + auditUrl;
    }

    const response = await fetch(auditUrl);
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

    // Compile results
    const result: AuditResult = {
      url: auditUrl,
      timestamp: Date.now(),
      cssScore,
      jsScore,
      overallScore,
      issues,
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
      size: 0,
      isMinified: href.includes(".min.css"),
      isExternal: href.startsWith("http") || href.startsWith("//"),
    });
  }

  // Count inline styles
  let inlineCount = 0;
  while ((match = styleRegex.exec(html)) !== null) {
    inlineCount++;
  }

  if (inlineCount > 0) {
    stylesheets.push({
      url: "inline-styles",
      size: inlineCount,
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

  const seenScripts = new Set<string>();
  let match;

  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1];
    const isDuplicate = seenScripts.has(src);
    seenScripts.add(src);

    scripts.push({
      url: src,
      size: 0,
      isMinified: src.includes(".min.js"),
      isExternal: src.startsWith("http") || src.startsWith("//"),
      isDuplicate,
    });
  }

  // Count inline scripts
  let inlineCount = 0;
  while ((match = inlineRegex.exec(html)) !== null) {
    inlineCount++;
  }

  if (inlineCount > 0) {
    scripts.push({
      url: "inline-scripts",
      size: inlineCount,
      isMinified: false,
      isExternal: false,
    });
  }

  return scripts;
}

/**
 * Extract class names from HTML to analyze naming patterns
 */
function extractClassNames(html: string): string[] {
  const classes: string[] = [];
  const classRegex = /class=["']([^"']+)["']/gi;

  let match;
  while ((match = classRegex.exec(html)) !== null) {
    const classList = match[1].split(/\s+/);
    classes.push(...classList);
  }

  return [...new Set(classes)];
}

/**
 * Analyze CSS consistency and generate issues
 */
function analyzeCSSConsistency(
  stylesheets: StylesheetInfo[],
  classNames: string[]
): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Check for multiple CSS files (fragmentation)
  const externalCss = stylesheets.filter((s) => s.isExternal && s.url !== "inline-styles");
  if (externalCss.length > 5) {
    issues.push({
      id: "css-fragmentation",
      category: "css",
      severity: "warning",
      title: "CSS Fragmentation",
      description: `Your site loads ${externalCss.length} external CSS files. This increases HTTP requests and can slow down page load times.`,
      examples: externalCss.slice(0, 3).map((s) => s.url),
      recommendation:
        "Consolidate CSS files into fewer bundles. Consider using a CSS preprocessor (SCSS) with a build tool to merge files. Aim for 1-3 main CSS files.",
      difficulty: "medium",
      impact: "high",
    });
  }

  // Check for inline styles
  const hasInlineStyles = stylesheets.some((s) => s.url === "inline-styles");
  if (hasInlineStyles) {
    issues.push({
      id: "inline-styles",
      category: "css",
      severity: "warning",
      title: "Inline Styles Detected",
      description:
        "Inline styles make CSS harder to maintain and override. They should be moved to external stylesheets.",
      recommendation:
        "Move all inline styles to external CSS files. Use CSS classes instead of inline style attributes.",
      difficulty: "medium",
      impact: "medium",
    });
  }

  // Check for unminified CSS
  const unminifiedCss = externalCss.filter((s) => !s.isMinified);
  if (unminifiedCss.length > 0) {
    issues.push({
      id: "unminified-css",
      category: "performance",
      severity: "info",
      title: "Unminified CSS Files",
      description: `${unminifiedCss.length} CSS file(s) are not minified. This increases file size unnecessarily.`,
      examples: unminifiedCss.slice(0, 2).map((s) => s.url),
      recommendation:
        "Use a build tool (Webpack, Vite, Parcel) to minify CSS files in production. This can reduce file size by 20-30%.",
      difficulty: "easy",
      impact: "medium",
    });
  }

  // Analyze class naming patterns
  const patterns = analyzeNamingPatterns(classNames);
  if (patterns.inconsistentCount > patterns.total * 0.3) {
    issues.push({
      id: "inconsistent-naming",
      category: "css",
      severity: "warning",
      title: "Inconsistent CSS Class Naming",
      description:
        "Class names follow multiple naming conventions (camelCase, kebab-case, snake_case). This makes CSS harder to maintain.",
      recommendation:
        "Adopt a single naming convention (BEM, SMACSS, or utility-first). Document it in your project guidelines.",
      difficulty: "hard",
      impact: "medium",
    });
  }

  return issues;
}

/**
 * Analyze JavaScript consistency and generate issues
 */
function analyzeJSConsistency(scripts: ScriptInfo[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Check for duplicate scripts
  const duplicates = scripts.filter((s) => s.isDuplicate);
  if (duplicates.length > 0) {
    issues.push({
      id: "duplicate-scripts",
      category: "javascript",
      severity: "critical",
      title: "Duplicate Script Files",
      description: `${duplicates.length} script file(s) are loaded multiple times. This wastes bandwidth and can cause unexpected behavior.`,
      examples: duplicates.slice(0, 2).map((s) => s.url),
      recommendation:
        "Remove duplicate script tags. Use a module bundler to ensure scripts are loaded only once.",
      difficulty: "easy",
      impact: "high",
    });
  }

  // Check for many external scripts
  const externalScripts = scripts.filter((s) => s.isExternal && s.url !== "inline-scripts");
  if (externalScripts.length > 8) {
    issues.push({
      id: "script-fragmentation",
      category: "javascript",
      severity: "warning",
      title: "Many External Scripts",
      description: `Your site loads ${externalScripts.length} external JavaScript files. This increases HTTP requests and page load time.`,
      examples: externalScripts.slice(0, 3).map((s) => s.url),
      recommendation:
        "Bundle scripts using a module bundler (Webpack, Vite, Rollup). Aim for 1-3 main JavaScript bundles.",
      difficulty: "medium",
      impact: "high",
    });
  }

  // Check for unminified scripts
  const unminifiedJs = externalScripts.filter((s) => !s.isMinified);
  if (unminifiedJs.length > 0) {
    issues.push({
      id: "unminified-js",
      category: "performance",
      severity: "info",
      title: "Unminified JavaScript Files",
      description: `${unminifiedJs.length} JavaScript file(s) are not minified. This increases file size unnecessarily.`,
      examples: unminifiedJs.slice(0, 2).map((s) => s.url),
      recommendation:
        "Use a build tool to minify JavaScript in production. This can reduce file size by 30-50%.",
      difficulty: "easy",
      impact: "medium",
    });
  }

  // Check for inline scripts
  const hasInlineScripts = scripts.some((s) => s.url === "inline-scripts");
  if (hasInlineScripts) {
    issues.push({
      id: "inline-scripts",
      category: "javascript",
      severity: "info",
      title: "Inline Scripts Detected",
      description:
        "Inline scripts make JavaScript harder to maintain and test. They should be moved to external files.",
      recommendation:
        "Move inline scripts to external JavaScript files. This makes code more maintainable and cacheable.",
      difficulty: "medium",
      impact: "low",
    });
  }

  return issues;
}

/**
 * Analyze performance issues
 */
function analyzePerformance(stylesheets: StylesheetInfo[], scripts: ScriptInfo[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  const totalAssets = stylesheets.length + scripts.length;
  if (totalAssets > 20) {
    issues.push({
      id: "too-many-assets",
      category: "performance",
      severity: "warning",
      title: "Too Many Asset Files",
      description: `Your site loads ${totalAssets} CSS and JavaScript files. This creates many HTTP requests and slows down page load.`,
      recommendation:
        "Bundle and minify assets using a modern build tool. Aim for 3-5 total asset files (CSS + JS).",
      difficulty: "medium",
      impact: "high",
    });
  }

  return issues;
}

/**
 * Analyze naming patterns in class names
 */
function analyzeNamingPatterns(
  classNames: string[]
): { total: number; inconsistentCount: number } {
  const patterns = {
    camelCase: 0,
    kebabCase: 0,
    snakeCase: 0,
    other: 0,
  };

  classNames.forEach((name) => {
    if (/^[a-z]+(?:[A-Z][a-z]+)*$/.test(name)) {
      patterns.camelCase++;
    } else if (/^[a-z]+(?:-[a-z]+)*$/.test(name)) {
      patterns.kebabCase++;
    } else if (/^[a-z]+(?:_[a-z]+)*$/.test(name)) {
      patterns.snakeCase++;
    } else {
      patterns.other++;
    }
  });

  const total = classNames.length;
  const maxPattern = Math.max(
    patterns.camelCase,
    patterns.kebabCase,
    patterns.snakeCase,
    patterns.other
  );
  const inconsistentCount = total - maxPattern;

  return { total, inconsistentCount };
}

/**
 * Calculate CSS consistency score (0-100)
 */
function calculateCSSScore(issues: AuditIssue[]): number {
  let score = 100;

  issues
    .filter((i) => i.category === "css")
    .forEach((issue) => {
      if (issue.severity === "critical") score -= 20;
      else if (issue.severity === "warning") score -= 10;
      else if (issue.severity === "info") score -= 5;
    });

  return Math.max(0, score);
}

/**
 * Calculate JavaScript consistency score (0-100)
 */
function calculateJSScore(issues: AuditIssue[]): number {
  let score = 100;

  issues
    .filter((i) => i.category === "javascript")
    .forEach((issue) => {
      if (issue.severity === "critical") score -= 20;
      else if (issue.severity === "warning") score -= 10;
      else if (issue.severity === "info") score -= 5;
    });

  return Math.max(0, score);
}
