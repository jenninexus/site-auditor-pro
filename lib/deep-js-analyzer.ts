/**
 * Deep JavaScript Analyzer
 * Advanced linting and code quality checks inspired by ESLint
 */

export interface JSAnalysisIssue {
  line: number;
  column: number;
  severity: "error" | "warning";
  rule: string;
  message: string;
  suggestion?: string;
}

export interface DeepJSAnalysisResult {
  issues: JSAnalysisIssue[];
  score: number; // 0-100
  summary: {
    errors: number;
    warnings: number;
    totalIssues: number;
  };
}

/**
 * Analyze JavaScript code with deep linting rules
 */
export function analyzeJavaScriptDeep(code: string): DeepJSAnalysisResult {
  const issues: JSAnalysisIssue[] = [];
  const lines = code.split("\n");

  // Rule 1: Detect console statements in production code
  lines.forEach((line, index) => {
    const consoleMatch = line.match(/console\.(log|warn|error|info|debug)\s*\(/);
    if (consoleMatch) {
      issues.push({
        line: index + 1,
        column: line.indexOf(consoleMatch[0]),
        severity: "warning",
        rule: "no-console",
        message: `Unexpected console statement (${consoleMatch[1]})`,
        suggestion: "Remove console statements before deploying to production",
      });
    }
  });

  // Rule 2: Detect debugger statements
  lines.forEach((line, index) => {
    if (/\bdebugger\b/.test(line)) {
      issues.push({
        line: index + 1,
        column: line.indexOf("debugger"),
        severity: "error",
        rule: "no-debugger",
        message: "Unexpected debugger statement",
        suggestion: "Remove debugger statements before deploying",
      });
    }
  });

  // Rule 3: Detect eval() usage
  lines.forEach((line, index) => {
    if (/\beval\s*\(/.test(line)) {
      issues.push({
        line: index + 1,
        column: line.indexOf("eval"),
        severity: "error",
        rule: "no-eval",
        message: "eval() is a security risk and should be avoided",
        suggestion: "Use JSON.parse() or other safe alternatives",
      });
    }
  });

  // Rule 4: Detect var usage
  lines.forEach((line, index) => {
    const varMatch = line.match(/\bvar\s+/);
    if (varMatch) {
      issues.push({
        line: index + 1,
        column: line.indexOf(varMatch[0]),
        severity: "warning",
        rule: "no-var",
        message: "var is not recommended. Use let or const instead",
        suggestion: "Replace var with const or let for better scoping",
      });
    }
  });

  // Rule 5: Detect missing semicolons
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (
      trimmed &&
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.endsWith(",") &&
      !trimmed.endsWith(":") &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("*") &&
      !/^(if|for|while|function|class|const|let|var|return|case|default)\b/.test(trimmed)
    ) {
      // Only flag if it looks like a statement that should end with semicolon
      if (/[a-zA-Z0-9_\)\]\}]$/.test(trimmed)) {
        issues.push({
          line: index + 1,
          column: trimmed.length,
          severity: "warning",
          rule: "semi",
          message: "Missing semicolon",
          suggestion: "Add a semicolon at the end of the statement",
        });
      }
    }
  });

  // Rule 6: Detect unused variables (simple heuristic)
  const variableRegex = /\b(const|let|var)\s+(\w+)\s*=/g;
  const variables = new Map<string, number>();
  
  code.replace(variableRegex, (match, keyword, varName) => {
    variables.set(varName, 0);
    return match;
  });

  variables.forEach((count, varName) => {
    const usageRegex = new RegExp(`\\b${varName}\\b`, "g");
    const usages = (code.match(usageRegex) || []).length;
    
    if (usages === 1) {
      // Only declared, never used
      lines.forEach((line, index) => {
        if (line.includes(varName) && /\b(const|let|var)\s+/.test(line)) {
          issues.push({
            line: index + 1,
            column: line.indexOf(varName),
            severity: "warning",
            rule: "no-unused-vars",
            message: `'${varName}' is declared but never used`,
            suggestion: "Remove the variable or use it in your code",
          });
        }
      });
    }
  });

  // Rule 7: Detect potential null/undefined access
  lines.forEach((line, index) => {
    const nullCheck = line.match(/\w+\.\w+\s*(?:=|==|===)/);
    if (nullCheck && !line.includes("if") && !line.includes("?")) {
      // Potential unsafe property access
      if (/\w+\.\w+\s*\[/.test(line) || /\w+\.\w+\s*\./.test(line)) {
        issues.push({
          line: index + 1,
          column: line.indexOf(nullCheck[0]),
          severity: "warning",
          rule: "no-unsafe-optional-chaining",
          message: "Potential unsafe property access without null check",
          suggestion: "Use optional chaining (?.) or add a null check",
        });
      }
    }
  });

  // Rule 8: Detect loose equality (== instead of ===)
  lines.forEach((line, index) => {
    const looseEqMatch = line.match(/([^=!<>]|^)==([^=]|$)/);
    if (looseEqMatch) {
      issues.push({
        line: index + 1,
        column: line.indexOf("=="),
        severity: "warning",
        rule: "eqeqeq",
        message: "Use === instead of == for comparison",
        suggestion: "Replace == with === to avoid type coercion issues",
      });
    }
  });

  // Rule 9: Detect function complexity (too many parameters)
  const functionRegex = /function\s+\w+\s*\(([^)]*)\)/g;
  let funcMatch;
  while ((funcMatch = functionRegex.exec(code)) !== null) {
    const params = funcMatch[1].split(",").filter((p) => p.trim());
    if (params.length > 5) {
      const lineNum = code.substring(0, funcMatch.index).split("\n").length;
      issues.push({
        line: lineNum,
        column: funcMatch.index,
        severity: "warning",
        rule: "max-params",
        message: `Function has ${params.length} parameters (max recommended: 5)`,
        suggestion: "Consider using an object parameter to reduce complexity",
      });
    }
  }

  // Rule 10: Detect nested callbacks (callback hell)
  const callbackNestRegex = /\(\s*function\s*\([^)]*\)\s*\{\s*\(\s*function/g;
  if (callbackNestRegex.test(code)) {
    issues.push({
      line: 1,
      column: 0,
      severity: "warning",
      rule: "callback-hell",
      message: "Deeply nested callbacks detected (callback hell)",
      suggestion: "Consider using Promises or async/await instead",
    });
  }

  // Calculate score
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, 100 - errorCount * 10 - warningCount * 3);

  return {
    issues,
    score,
    summary: {
      errors: errorCount,
      warnings: warningCount,
      totalIssues: issues.length,
    },
  };
}

/**
 * Get a severity-based score multiplier
 */
export function getJSQualityScore(result: DeepJSAnalysisResult): number {
  return result.score;
}
