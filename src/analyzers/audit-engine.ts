/**
 * Site Auditor — Audit Engine (Server-Side)
 * Orchestrates all analyzers: CSS, JS, Accessibility, SEO, Security, Performance
 * Fetches URLs directly from the server (no CORS proxy needed)
 */

import { analyzePageContrast } from "./contrast.js";
import { analyzeSEO } from "./seo.js";
import { analyzeSecurity } from "./security.js";
import { analyzePerformance } from "./performance.js";

// ── Types ────────────────────────────────────────────────

export interface AuditIssue {
  id: string;
  category:
    | "css"
    | "javascript"
    | "accessibility"
    | "seo"
    | "security"
    | "performance";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  examples?: string[];
  recommendation: string;
  difficulty?: "easy" | "medium" | "hard";
  impact?: "high" | "medium" | "low";
}

export interface FullAuditResult {
  url: string;
  timestamp: number;
  scores: {
    overall: number;
    css: number;
    javascript: number;
    accessibility: number;
    seo: number;
    security: number;
    performance: number;
  };
  issues: AuditIssue[];
  accessibility: any;
  seo: any;
  security: any;
  performance: any;
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

// ── Main Audit ───────────────────────────────────────────

export async function runFullAudit(url: string): Promise<FullAuditResult> {
  // Normalize URL
  let auditUrl = url.trim();
  if (!auditUrl.startsWith("http://") && !auditUrl.startsWith("https://")) {
    auditUrl = "https://" + auditUrl;
  }

  // SSRF protection: block private/internal URLs
  const parsed = new URL(auditUrl);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }
  const hostname = parsed.hostname;
  if (
    /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|::1|\[::1\])/.test(
      hostname,
    ) ||
    hostname === "0.0.0.0"
  ) {
    throw new Error("Private or internal URLs are not allowed");
  }

  // Fetch the page directly from server (no CORS issues)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html: string;
  const responseHeaders: Record<string, string> = {};

  try {
    const response = await fetch(auditUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "SiteAuditor/2.0 (https://github.com/jenninexus/site-auditor-pro)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);
    html = await response.text();

    // Cap HTML size for safety (prevent ReDoS on very large pages)
    if (html.length > 2_000_000) {
      html = html.substring(0, 2_000_000);
    }

    // Collect response headers
    response.headers.forEach((value, key) => {
      responseHeaders[key.toLowerCase()] = value;
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Request timed out after 15 seconds");
    }
    // Sanitize error — don't leak internal network details
    throw new Error("Unable to reach the requested URL");
  }

  // ── Run all analyzers ──────────────────────────────────

  const allIssues: AuditIssue[] = [];

  // CSS Analysis
  const cssInfo = extractStylesheetInfo(html);
  const classNames = extractClassNames(html);
  const cssIssues = analyzeCSSConsistency(cssInfo, classNames);
  allIssues.push(...cssIssues);

  // JavaScript Analysis
  const jsInfo = extractScriptInfo(html);
  const jsIssues = analyzeJSConsistency(jsInfo);
  allIssues.push(...jsIssues);

  // Accessibility (Contrast)
  let accessibilityData: any = null;
  let accessibilityScore = 100;
  try {
    accessibilityData = await analyzePageContrast(html, auditUrl);
    // Score based on issue count rather than broken percentage field
    const contrastIssueCount =
      (accessibilityData.lightMode?.contrastIssues?.length || 0) +
      (accessibilityData.darkMode?.contrastIssues?.length || 0);
    accessibilityScore = Math.max(0, 100 - contrastIssueCount * 12);

    // Add accessibility issues
    const contrastIssues = [
      ...(accessibilityData.lightMode?.contrastIssues || []),
      ...(accessibilityData.darkMode?.contrastIssues || []),
    ];
    if (contrastIssues.length > 0) {
      allIssues.push({
        id: "contrast-issues",
        category: "accessibility",
        severity: contrastIssues.length > 3 ? "critical" : "warning",
        title: `${contrastIssues.length} Color Contrast Issues`,
        description: `Found ${contrastIssues.length} elements that don't meet WCAG AA contrast requirements.`,
        recommendation:
          "Increase contrast ratios to at least 4.5:1 for normal text and 3:1 for large text.",
        difficulty: "easy",
        impact: "high",
      });
    }
  } catch (err) {
    console.warn("Accessibility analysis failed:", err);
  }

  // SEO Analysis
  let seoData: any = null;
  let seoScore = 100;
  try {
    seoData = analyzeSEO(html, auditUrl);
    seoScore = seoData.score;
    allIssues.push(
      ...seoData.issues.map((i: any) => ({ ...i, category: "seo" as const })),
    );
  } catch (err) {
    console.warn("SEO analysis failed:", err);
  }

  // Security Analysis
  let securityData: any = null;
  let securityScore = 100;
  try {
    securityData = analyzeSecurity(responseHeaders, auditUrl);
    securityScore = securityData.score;
    allIssues.push(
      ...securityData.issues.map((i: any) => ({
        ...i,
        category: "security" as const,
      })),
    );
  } catch (err) {
    console.warn("Security analysis failed:", err);
  }

  // Performance Analysis
  let performanceData: any = null;
  let performanceScore = 100;
  try {
    performanceData = analyzePerformance(html, responseHeaders);
    performanceScore = performanceData.score;
    allIssues.push(
      ...performanceData.issues.map((i: any) => ({
        ...i,
        category: "performance" as const,
      })),
    );
  } catch (err) {
    console.warn("Performance analysis failed:", err);
  }

  // ── Calculate Scores ───────────────────────────────────

  const cssScore = calculateCategoryScore(allIssues, "css");
  const jsScore = calculateCategoryScore(allIssues, "javascript");

  const scores = {
    css: cssScore,
    javascript: jsScore,
    accessibility: accessibilityScore,
    seo: seoScore,
    security: securityScore,
    performance: performanceScore,
    overall: Math.round(
      (cssScore +
        jsScore +
        accessibilityScore +
        seoScore +
        securityScore +
        performanceScore) /
        6,
    ),
  };

  return {
    url: auditUrl,
    timestamp: Date.now(),
    scores,
    issues: allIssues,
    accessibility: accessibilityData,
    seo: seoData,
    security: securityData,
    performance: performanceData,
    summary: {
      totalIssues: allIssues.length,
      criticalCount: allIssues.filter((i) => i.severity === "critical").length,
      warningCount: allIssues.filter((i) => i.severity === "warning").length,
      infoCount: allIssues.filter((i) => i.severity === "info").length,
    },
  };
}

// ── CSS Analysis ─────────────────────────────────────────

function extractStylesheetInfo(html: string): StylesheetInfo[] {
  const stylesheets: StylesheetInfo[] = [];
  const linkRegex =
    /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>|<link[^>]*href=["']([^"']+\.css[^"']*)["'][^>]*>/gi;
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1] || match[2];
    if (!href) continue;
    stylesheets.push({
      url: href,
      size: href.length,
      isMinified: href.includes(".min.css"),
      isExternal: href.startsWith("http") || href.startsWith("//"),
    });
  }

  while ((match = styleRegex.exec(html)) !== null) {
    stylesheets.push({
      url: "inline-style",
      size: match[1].length,
      isMinified: false,
      isExternal: false,
    });
  }

  return stylesheets;
}

function extractScriptInfo(html: string): ScriptInfo[] {
  const scripts: ScriptInfo[] = [];
  const scriptSrcRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const inlineRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
  const seenUrls = new Set<string>();

  let match;
  while ((match = scriptSrcRegex.exec(html)) !== null) {
    const src = match[1];
    const isDuplicate = seenUrls.has(src);
    seenUrls.add(src);
    scripts.push({
      url: src,
      size: src.length,
      isMinified: src.includes(".min.js"),
      isExternal: src.startsWith("http") || src.startsWith("//"),
      isDuplicate,
    });
  }

  while ((match = inlineRegex.exec(html)) !== null) {
    const content = match[1].trim();
    if (content.length > 0) {
      scripts.push({
        url: "inline-script",
        size: content.length,
        isMinified: false,
        isExternal: false,
      });
    }
  }

  return scripts;
}

function extractClassNames(html: string): string[] {
  const classRegex = /class=["']([^"']+)["']/gi;
  const classes = new Set<string>();
  let match;
  while ((match = classRegex.exec(html)) !== null) {
    match[1].split(/\s+/).forEach((cls) => {
      if (cls.trim()) classes.add(cls.trim());
    });
  }
  return Array.from(classes);
}

function analyzeCSSConsistency(
  stylesheets: StylesheetInfo[],
  classNames: string[],
): AuditIssue[] {
  const issues: AuditIssue[] = [];

  const externalCss = stylesheets.filter((s) => s.isExternal);
  if (externalCss.length > 5) {
    issues.push({
      id: "css-fragmentation",
      category: "css",
      severity: "warning",
      title: "CSS Fragmentation",
      description: `Your site loads ${externalCss.length} external CSS files, creating unnecessary HTTP requests.`,
      recommendation:
        "Consolidate CSS files into a single bundle using a build tool.",
      difficulty: "medium",
      impact: "high",
    });
  }

  const unminified = stylesheets.filter((s) => s.isExternal && !s.isMinified);
  if (unminified.length > 0) {
    issues.push({
      id: "unminified-css",
      category: "css",
      severity: "info",
      title: "Unminified CSS Files",
      description: `${unminified.length} CSS file(s) are not minified.`,
      recommendation: "Use a build tool to minify CSS files for production.",
      difficulty: "easy",
      impact: "medium",
    });
  }

  const inlineStyles = stylesheets.filter((s) => s.url === "inline-style");
  if (inlineStyles.length > 3) {
    issues.push({
      id: "excessive-inline-styles",
      category: "css",
      severity: "warning",
      title: "Excessive Inline Styles",
      description: `Found ${inlineStyles.length} inline <style> blocks. Consider consolidating.`,
      recommendation:
        "Extract inline styles to external CSS files for better caching and organization.",
      difficulty: "easy",
      impact: "medium",
    });
  }

  // Naming convention analysis
  let hasKebab = false,
    hasCamel = false,
    hasSnake = false,
    hasBEM = false;
  for (const cls of classNames) {
    if (cls.includes("-") && !cls.includes("__") && !cls.includes("--"))
      hasKebab = true;
    if (/[a-z][A-Z]/.test(cls)) hasCamel = true;
    if (cls.includes("_") && !cls.includes("__")) hasSnake = true;
    if (cls.includes("__") || cls.includes("--")) hasBEM = true;
  }
  const conventions = [hasKebab, hasCamel, hasSnake, hasBEM].filter(
    Boolean,
  ).length;
  if (conventions > 2) {
    issues.push({
      id: "inconsistent-naming",
      category: "css",
      severity: "warning",
      title: "Inconsistent CSS Naming Conventions",
      description: `Found ${conventions} different naming conventions (kebab-case, camelCase, snake_case, BEM) across ${classNames.length} classes.`,
      recommendation:
        "Adopt a consistent naming convention like BEM or kebab-case.",
      difficulty: "medium",
      impact: "medium",
    });
  }

  // Detect CSS frameworks
  const frameworks: string[] = [];
  if (
    classNames.some(
      (c) => c.startsWith("btn-") || c.startsWith("col-") || c === "container",
    )
  ) {
    frameworks.push("Bootstrap");
  }
  if (classNames.some((c) => /^(flex|grid|text-|bg-|p-|m-|w-|h-)/.test(c))) {
    frameworks.push("Tailwind CSS");
  }
  if (frameworks.length > 1) {
    issues.push({
      id: "multiple-frameworks",
      category: "css",
      severity: "warning",
      title: "Multiple CSS Frameworks Detected",
      description: `Detected ${frameworks.join(" and ")}. Using multiple frameworks increases page weight and causes style conflicts.`,
      recommendation:
        "Standardize on a single CSS framework to reduce bundle size and complexity.",
      difficulty: "hard",
      impact: "high",
    });
  }

  return issues;
}

function analyzeJSConsistency(scripts: ScriptInfo[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  const duplicates = scripts.filter((s) => s.isDuplicate);
  if (duplicates.length > 0) {
    const urls = [...new Set(duplicates.map((s) => s.url))];
    issues.push({
      id: "duplicate-scripts",
      category: "javascript",
      severity: "critical",
      title: "Duplicate Script Files",
      description: `${duplicates.length} script(s) loaded multiple times.`,
      examples: urls,
      recommendation: "Remove duplicate <script> tags: " + urls.join(", "),
      difficulty: "easy",
      impact: "high",
    });
  }

  const external = scripts.filter((s) => s.isExternal);
  if (external.length > 8) {
    issues.push({
      id: "script-fragmentation",
      category: "javascript",
      severity: "warning",
      title: "Script Fragmentation",
      description: `Your site loads ${external.length} external JavaScript files.`,
      recommendation:
        "Bundle JavaScript files using a module bundler like Vite, esbuild, or webpack.",
      difficulty: "hard",
      impact: "high",
    });
  }

  const unminified = scripts.filter((s) => s.isExternal && !s.isMinified);
  if (unminified.length > 0) {
    issues.push({
      id: "unminified-js",
      category: "javascript",
      severity: "info",
      title: "Unminified JavaScript Files",
      description: `${unminified.length} JavaScript file(s) are not minified.`,
      recommendation:
        "Minify JavaScript files for production to reduce payload.",
      difficulty: "easy",
      impact: "medium",
    });
  }

  const inline = scripts.filter((s) => s.url === "inline-script");
  const largeInline = inline.filter((s) => s.size > 5000);
  if (largeInline.length > 0) {
    issues.push({
      id: "large-inline-scripts",
      category: "javascript",
      severity: "warning",
      title: "Large Inline Scripts",
      description: `Found ${largeInline.length} inline script(s) over 5KB. These block rendering and can't be cached.`,
      recommendation:
        "Move large inline scripts to external files for caching and parallel loading.",
      difficulty: "medium",
      impact: "high",
    });
  }

  return issues;
}

// ── Score Calculation ────────────────────────────────────

function calculateCategoryScore(
  issues: AuditIssue[],
  category: string,
): number {
  const catIssues = issues.filter((i) => i.category === category);
  let score = 100;
  for (const issue of catIssues) {
    if (issue.severity === "critical") score -= 20;
    else if (issue.severity === "warning") score -= 10;
    else score -= 3;
  }
  return Math.max(0, Math.min(100, score));
}
