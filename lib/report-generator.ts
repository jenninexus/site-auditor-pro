/**
 * Audit Report Generator
 * Generates comprehensive reports and recommendations from audit results
 */

import { type AuditResult, type AuditIssue } from "./audit-engine";

export interface RecommendationStep {
  step: number;
  title: string;
  description: string;
  code?: string;
  resources?: string[];
}

export interface DetailedRecommendation {
  issueId: string;
  title: string;
  priority: "high" | "medium" | "low";
  estimatedEffort: "1-2 hours" | "2-4 hours" | "4-8 hours" | "1-2 days" | "2+ days";
  expectedBenefit: string;
  steps: RecommendationStep[];
  relatedIssues: string[];
  tools: string[];
}

export interface AuditReport {
  auditResult: AuditResult;
  executiveSummary: string;
  recommendations: DetailedRecommendation[];
  implementationPriority: string[];
  estimatedTotalEffort: string;
  keyMetrics: {
    issuesByCategory: Record<string, number>;
    issuesBySeverity: Record<string, number>;
    improvementPotential: number;
  };
}

/**
 * Generate a comprehensive audit report
 */
export function generateAuditReport(auditResult: AuditResult): AuditReport {
  const recommendations = generateRecommendations(auditResult.issues);
  const priority = determinePriority(auditResult.issues);
  const metrics = calculateMetrics(auditResult);

  const executiveSummary = generateExecutiveSummary(auditResult, metrics);

  return {
    auditResult,
    executiveSummary,
    recommendations,
    implementationPriority: priority,
    estimatedTotalEffort: estimateTotalEffort(recommendations),
    keyMetrics: metrics,
  };
}

/**
 * Generate detailed recommendations for each issue
 */
function generateRecommendations(issues: AuditIssue[]): DetailedRecommendation[] {
  const recommendations: DetailedRecommendation[] = [];

  // Group issues by ID to avoid duplicates
  const issueMap = new Map<string, AuditIssue>();
  issues.forEach((issue) => {
    if (!issueMap.has(issue.id)) {
      issueMap.set(issue.id, issue);
    }
  });

  issueMap.forEach((issue) => {
    const recommendation = createRecommendation(issue);
    recommendations.push(recommendation);
  });

  // Sort by priority
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return recommendations;
}

/**
 * Create a detailed recommendation for a specific issue
 */
function createRecommendation(issue: AuditIssue): DetailedRecommendation {
  const baseRecommendation: DetailedRecommendation = {
    issueId: issue.id,
    title: issue.title,
    priority: issue.severity === "critical" ? "high" : issue.severity === "warning" ? "medium" : "low",
    estimatedEffort: "1-2 hours",
    expectedBenefit: "",
    steps: [],
    relatedIssues: [],
    tools: [],
  };

  // Customize recommendations based on issue type
  switch (issue.id) {
    case "css-fragmentation":
      return {
        ...baseRecommendation,
        estimatedEffort: "2-4 hours",
        expectedBenefit: "Reduce HTTP requests by 60-80%, improve page load time by 15-30%",
        steps: [
          {
            step: 1,
            title: "Audit Current CSS Files",
            description:
              "List all CSS files and identify what each one contains. Look for overlaps and unused styles.",
          },
          {
            step: 2,
            title: "Set Up a Build Tool",
            description:
              "Install and configure a bundler like Webpack, Vite, or Parcel. This will merge and minify CSS automatically.",
            code: "npm install --save-dev vite",
          },
          {
            step: 3,
            title: "Organize CSS Structure",
            description:
              "Create a main CSS file that imports all component styles using @import or a CSS preprocessor.",
            code: "@import 'components/header.css';\n@import 'components/footer.css';\n@import 'pages/home.css';",
          },
          {
            step: 4,
            title: "Merge and Minify",
            description:
              "Run your build tool to merge all CSS into a single minified file. Update HTML to reference only the main CSS file.",
          },
          {
            step: 5,
            title: "Test and Deploy",
            description:
              "Test all pages to ensure styles load correctly. Monitor performance improvements using browser DevTools.",
          },
        ],
        relatedIssues: ["unminified-css"],
        tools: ["Vite", "Webpack", "Parcel", "PostCSS"],
      };

    case "unminified-css":
      return {
        ...baseRecommendation,
        estimatedEffort: "1-2 hours",
        expectedBenefit: "Reduce CSS file size by 20-30%",
        steps: [
          {
            step: 1,
            title: "Install a Build Tool",
            description: "Use a tool that automatically minifies CSS in production.",
            code: "npm install --save-dev cssnano postcss",
          },
          {
            step: 2,
            title: "Configure Build Process",
            description:
              "Add minification to your build pipeline. Most modern tools do this by default.",
          },
          {
            step: 3,
            title: "Build for Production",
            description: "Run your build command to generate minified CSS files.",
            code: "npm run build",
          },
          {
            step: 4,
            title: "Verify Minification",
            description: "Check that .min.css files are generated and are significantly smaller.",
          },
        ],
        relatedIssues: ["css-fragmentation"],
        tools: ["cssnano", "PostCSS", "Vite", "Webpack"],
      };

    case "duplicate-scripts":
      return {
        ...baseRecommendation,
        priority: "high",
        estimatedEffort: "1-2 hours",
        expectedBenefit: "Eliminate wasted bandwidth and prevent script conflicts",
        steps: [
          {
            step: 1,
            title: "Identify Duplicates",
            description:
              "Use browser DevTools (Network tab) to find which scripts are loaded multiple times.",
          },
          {
            step: 2,
            title: "Remove Duplicate Tags",
            description: "Delete duplicate <script> tags from your HTML. Keep only one instance of each script.",
          },
          {
            step: 3,
            title: "Consolidate Script Loading",
            description:
              "If scripts are loaded from multiple places (header, footer, inline), consolidate them into one location.",
          },
          {
            step: 4,
            title: "Use a Module Bundler",
            description:
              "Implement a bundler to automatically prevent duplicate module loading.",
            code: "npm install --save-dev webpack webpack-cli",
          },
          {
            step: 5,
            title: "Test Functionality",
            description: "Verify that all page functionality works correctly after removing duplicates.",
          },
        ],
        relatedIssues: ["script-fragmentation"],
        tools: ["Webpack", "Vite", "Rollup"],
      };

    case "script-fragmentation":
      return {
        ...baseRecommendation,
        estimatedEffort: "4-8 hours",
        expectedBenefit: "Reduce HTTP requests by 70-90%, improve page load time by 20-40%",
        steps: [
          {
            step: 1,
            title: "Analyze Script Dependencies",
            description:
              "Document which scripts depend on each other and in what order they need to load.",
          },
          {
            step: 2,
            title: "Set Up a Module Bundler",
            description:
              "Install and configure Webpack, Vite, or Rollup to bundle JavaScript files.",
            code: "npm install --save-dev vite",
          },
          {
            step: 3,
            title: "Create Entry Points",
            description:
              "Define main entry files for different parts of your application (e.g., main.js, admin.js).",
          },
          {
            step: 4,
            title: "Bundle and Minify",
            description:
              "Run your bundler to create optimized bundles. Most tools minify by default in production mode.",
          },
          {
            step: 5,
            title: "Update HTML References",
            description:
              "Update your HTML to reference the bundled files instead of individual scripts.",
          },
          {
            step: 6,
            title: "Test and Monitor",
            description: "Test all functionality and monitor performance improvements.",
          },
        ],
        relatedIssues: ["unminified-js"],
        tools: ["Webpack", "Vite", "Rollup", "esbuild"],
      };

    case "inline-styles":
      return {
        ...baseRecommendation,
        estimatedEffort: "2-4 hours",
        expectedBenefit: "Improve CSS maintainability and enable better caching",
        steps: [
          {
            step: 1,
            title: "Find Inline Styles",
            description:
              "Search your codebase for style= attributes. Use your editor's find feature.",
          },
          {
            step: 2,
            title: "Extract to CSS Classes",
            description:
              "Create CSS classes for each inline style and apply them via className instead.",
            code: "/* Before */\n<div style=\"color: blue; font-size: 16px;\">Text</div>\n\n/* After */\n<div class=\"text-primary\">Text</div>\n\n/* CSS */\n.text-primary { color: blue; font-size: 16px; }",
          },
          {
            step: 3,
            title: "Use CSS Variables for Dynamic Styles",
            description:
              "If styles need to be dynamic, use CSS variables instead of inline styles.",
            code: "<div style=\"--color: blue;\">Text</div>\n\n/* CSS */\ndiv { color: var(--color); }",
          },
          {
            step: 4,
            title: "Test and Verify",
            description: "Ensure all styles are applied correctly after moving to CSS.",
          },
        ],
        relatedIssues: [],
        tools: ["CSS Variables", "CSS-in-JS libraries"],
      };

    case "inline-scripts":
      return {
        ...baseRecommendation,
        estimatedEffort: "2-4 hours",
        expectedBenefit: "Improve code organization and enable better caching",
        steps: [
          {
            step: 1,
            title: "Identify Inline Scripts",
            description: "Find all <script> tags with inline code (not src attribute).",
          },
          {
            step: 2,
            title: "Extract to External Files",
            description:
              "Move inline script code to separate .js files and reference them with src attribute.",
            code: "<!-- Before -->\n<script>\n  console.log('Hello');\n</script>\n\n<!-- After -->\n<script src=\"app.js\"></script>\n\n// app.js\nconsole.log('Hello');",
          },
          {
            step: 3,
            title: "Organize by Functionality",
            description:
              "Group related scripts into logical files (e.g., utils.js, analytics.js, interactions.js).",
          },
          {
            step: 4,
            title: "Update References",
            description: "Ensure all HTML files reference the correct external scripts.",
          },
          {
            step: 5,
            title: "Test All Pages",
            description: "Verify that all functionality works correctly with external scripts.",
          },
        ],
        relatedIssues: [],
        tools: ["Module bundlers", "Linters"],
      };

    case "unminified-js":
      return {
        ...baseRecommendation,
        estimatedEffort: "1-2 hours",
        expectedBenefit: "Reduce JavaScript file size by 30-50%",
        steps: [
          {
            step: 1,
            title: "Install a Minifier",
            description: "Use a tool like Terser or UglifyJS to minify JavaScript.",
            code: "npm install --save-dev terser",
          },
          {
            step: 2,
            title: "Configure Build Process",
            description:
              "Add minification to your build pipeline. Most bundlers do this automatically.",
          },
          {
            step: 3,
            title: "Build for Production",
            description: "Run your build command to generate minified JavaScript files.",
            code: "npm run build",
          },
          {
            step: 4,
            title: "Verify Minification",
            description: "Check that .min.js files are generated and are significantly smaller.",
          },
        ],
        relatedIssues: ["script-fragmentation"],
        tools: ["Terser", "UglifyJS", "Webpack", "Vite"],
      };

    case "too-many-assets":
      return {
        ...baseRecommendation,
        priority: "high",
        estimatedEffort: "1-2 days",
        expectedBenefit: "Reduce HTTP requests by 80-90%, significantly improve page load time",
        steps: [
          {
            step: 1,
            title: "Audit All Assets",
            description:
              "List all CSS and JavaScript files. Identify which are essential and which can be removed.",
          },
          {
            step: 2,
            title: "Remove Unused Assets",
            description:
              "Delete CSS and JavaScript files that are no longer used. Use tools like PurgeCSS to find unused styles.",
          },
          {
            step: 3,
            title: "Consolidate Similar Files",
            description:
              "Merge files that serve similar purposes. For example, combine multiple utility CSS files.",
          },
          {
            step: 4,
            title: "Implement Code Splitting",
            description:
              "Use a bundler to split code into chunks that load only when needed.",
            code: "// Webpack example\nimport(/* webpackChunkName: \"admin\" */ './admin.js');",
          },
          {
            step: 5,
            title: "Lazy Load Non-Critical Assets",
            description:
              "Load non-critical CSS and JavaScript asynchronously or on-demand.",
          },
          {
            step: 6,
            title: "Monitor Performance",
            description:
              "Use Lighthouse and WebPageTest to measure improvements in page load time.",
          },
        ],
        relatedIssues: ["css-fragmentation", "script-fragmentation"],
        tools: ["Webpack", "Vite", "PurgeCSS", "Lighthouse"],
      };

    case "inconsistent-naming":
      return {
        ...baseRecommendation,
        estimatedEffort: "2-4 hours",
        expectedBenefit: "Improve code maintainability and reduce bugs",
        steps: [
          {
            step: 1,
            title: "Choose a Naming Convention",
            description:
              "Select a convention like BEM (Block Element Modifier), SMACSS, or utility-first (Tailwind).",
            code: "/* BEM Example */\n.card { }\n.card__header { }\n.card__header--active { }\n\n/* SMACSS Example */\n.l-container { }\n.mod-card { }\n.is-active { }",
          },
          {
            step: 2,
            title: "Document the Convention",
            description:
              "Create a style guide documenting your chosen convention. Share it with your team.",
          },
          {
            step: 3,
            title: "Refactor Existing Classes",
            description: "Gradually update existing class names to follow the convention.",
          },
          {
            step: 4,
            title: "Set Up Linting",
            description:
              "Use a linter like stylelint to enforce naming conventions automatically.",
            code: "npm install --save-dev stylelint",
          },
          {
            step: 5,
            title: "Train Your Team",
            description: "Ensure all team members understand and follow the new convention.",
          },
        ],
        relatedIssues: [],
        tools: ["stylelint", "ESLint", "CSS-in-JS libraries"],
      };

    default:
      return baseRecommendation;
  }
}

/**
 * Determine implementation priority
 */
function determinePriority(issues: AuditIssue[]): string[] {
  const criticalIssues = issues
    .filter((i) => i.severity === "critical")
    .map((i) => i.id);

  const warningIssues = issues
    .filter((i) => i.severity === "warning")
    .map((i) => i.id);

  const infoIssues = issues
    .filter((i) => i.severity === "info")
    .map((i) => i.id);

  return [...criticalIssues, ...warningIssues, ...infoIssues];
}

/**
 * Calculate key metrics
 */
function calculateMetrics(auditResult: AuditResult) {
  const issuesByCategory: Record<string, number> = {};
  const issuesBySeverity: Record<string, number> = {};

  auditResult.issues.forEach((issue) => {
    issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1;
    issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
  });

  // Calculate improvement potential (0-100)
  const maxPossibleScore = 100;
  const currentScore = auditResult.overallScore;
  const improvementPotential = Math.round(((maxPossibleScore - currentScore) / maxPossibleScore) * 100);

  return {
    issuesByCategory,
    issuesBySeverity,
    improvementPotential,
  };
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(auditResult: AuditResult, metrics: any): string {
  const { improvementPotential } = metrics;
  const { totalIssues, criticalCount } = auditResult.summary;

  let summary = `Website Audit Summary for ${auditResult.url}\n\n`;
  summary += `Overall Score: ${Math.round(auditResult.overallScore)}/100\n`;
  summary += `CSS Score: ${Math.round(auditResult.cssScore)}/100\n`;
  summary += `JavaScript Score: ${Math.round(auditResult.jsScore)}/100\n\n`;

  summary += `Issues Found: ${totalIssues}\n`;
  summary += `- Critical: ${criticalCount}\n`;
  summary += `- Warnings: ${auditResult.summary.warningCount}\n`;
  summary += `- Info: ${auditResult.summary.infoCount}\n\n`;

  summary += `Improvement Potential: ${improvementPotential}%\n`;

  if (criticalCount > 0) {
    summary += `\n⚠️ Critical Issues Detected: Address these immediately to improve performance and maintainability.`;
  }

  if (improvementPotential > 50) {
    summary += `\n✓ Significant improvement opportunities available. Implementing the recommended fixes will substantially improve your site.`;
  } else if (improvementPotential > 20) {
    summary += `\n✓ Moderate improvement opportunities available. Focus on high-priority items first.`;
  } else {
    summary += `\n✓ Your site is in good shape. Continue maintaining these standards.`;
  }

  return summary;
}

/**
 * Estimate total implementation effort
 */
function estimateTotalEffort(recommendations: DetailedRecommendation[]): string {
  const effortMap = {
    "1-2 hours": 1.5,
    "2-4 hours": 3,
    "4-8 hours": 6,
    "1-2 days": 12,
    "2+ days": 20,
  };

  const totalHours = recommendations.reduce((sum, rec) => {
    return sum + (effortMap[rec.estimatedEffort as keyof typeof effortMap] || 0);
  }, 0);

  if (totalHours < 4) {
    return "Less than half a day";
  } else if (totalHours < 8) {
    return "Half a day to 1 day";
  } else if (totalHours < 16) {
    return "1-2 days";
  } else if (totalHours < 40) {
    return "2-5 days";
  } else {
    return "1-2 weeks";
  }
}
