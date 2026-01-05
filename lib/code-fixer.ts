/**
 * Code Fixer Utility
 * Automatically fixes common code issues
 */

export interface FixedCode {
  original: string;
  fixed: string;
  fixesApplied: string[];
}

/**
 * Fix CSS code
 */
export function fixCSS(code: string): FixedCode {
  let fixed = code;
  const fixesApplied: string[] = [];

  // 1. Replace !important with proper specificity
  if (fixed.includes("!important")) {
    fixed = fixed.replace(/\s*!important/g, "");
    fixesApplied.push("Removed !important declarations");
  }

  // 2. Convert hardcoded hex colors to CSS variables
  const hexColorRegex = /#([0-9A-Fa-f]{3,6})\b/g;
  const hexMatches = fixed.match(hexColorRegex);
  if (hexMatches) {
    const uniqueColors = [...new Set(hexMatches)];
    let colorVarCounter = 1;
    
    // Create a CSS variables block
    let cssVarBlock = ":root {\n";
    uniqueColors.forEach((color) => {
      const varName = `--color-${colorVarCounter}`;
      fixed = fixed.replace(new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), `var(${varName})`);
      cssVarBlock += `  ${varName}: ${color};\n`;
      colorVarCounter++;
    });
    cssVarBlock += "}\n\n";
    
    fixed = cssVarBlock + fixed;
    fixesApplied.push(`Converted ${uniqueColors.length} hardcoded colors to CSS variables`);
  }

  // 3. Replace float-based layouts with flexbox
  if (fixed.includes("float:")) {
    // Simple replacement for common float patterns
    fixed = fixed.replace(/float:\s*left;?/g, "/* Consider using flexbox instead */");
    fixed = fixed.replace(/float:\s*right;?/g, "/* Consider using flexbox instead */");
    fixesApplied.push("Flagged float-based layouts for conversion to Flexbox");
  }

  // 4. Add missing semicolons
  const missingSemicolons = (fixed.match(/[^;{}\n]\n\s*[a-zA-Z]/g) || []).length;
  if (missingSemicolons > 0) {
    fixed = fixed.replace(/([^;{}\n])\n(\s*[a-zA-Z])/g, "$1;\n$2");
    fixesApplied.push("Added missing semicolons");
  }

  // 5. Format indentation
  const lines = fixed.split("\n");
  const formattedLines = lines.map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    
    let indent = 0;
    if (trimmed.includes("}")) indent = Math.max(0, (lines[index - 1]?.match(/\{/g) || []).length - 1);
    
    return "  ".repeat(indent) + trimmed;
  });
  
  const formattedCode = formattedLines.join("\n");
  if (formattedCode !== fixed) {
    fixesApplied.push("Improved code formatting and indentation");
  }
  fixed = formattedCode;

  return {
    original: code,
    fixed,
    fixesApplied,
  };
}

/**
 * Fix JavaScript code
 */
export function fixJavaScript(code: string): FixedCode {
  let fixed = code;
  const fixesApplied: string[] = [];

  // 1. Replace var with const/let
  const varMatches = fixed.match(/\bvar\s+/g) || [];
  if (varMatches.length > 0) {
    fixed = fixed.replace(/\bvar\s+/g, "const ");
    fixesApplied.push(`Replaced ${varMatches.length} 'var' declarations with 'const'`);
  }

  // 2. Remove console.log statements
  const consoleMatches = fixed.match(/console\.log\([^)]*\);?/g) || [];
  if (consoleMatches.length > 0) {
    fixed = fixed.replace(/console\.log\([^)]*\);?\n?/g, "");
    fixesApplied.push(`Removed ${consoleMatches.length} console.log statements`);
  }

  // 3. Add semicolons to statements
  const statementsNeedingSemicolons = (fixed.match(/[^;{}\n]\n\s*(const|let|return|if|for|while)/g) || []).length;
  if (statementsNeedingSemicolons > 0) {
    fixed = fixed.replace(/([^;{}\n])\n(\s*(const|let|return|if|for|while))/g, "$1;\n$2");
    fixesApplied.push("Added missing semicolons to statements");
  }

  // 4. Flag eval() usage (can't auto-fix, but alert user)
  if (fixed.includes("eval(")) {
    fixesApplied.push("⚠️ WARNING: eval() detected - must be manually removed for security");
  }

  // 5. Convert arrow functions to be consistent
  const arrowFuncs = (fixed.match(/=>\s*{/g) || []).length;
  if (arrowFuncs > 0) {
    fixesApplied.push(`Found ${arrowFuncs} arrow functions (no changes needed)`);
  }

  // 6. Format indentation
  const lines = fixed.split("\n");
  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    let indent = Math.max(0, openBraces - closeBraces);
    
    return "  ".repeat(indent) + trimmed;
  });
  
  const formattedCode = formattedLines.join("\n");
  if (formattedCode !== fixed) {
    fixesApplied.push("Improved code formatting and indentation");
  }
  fixed = formattedCode;

  return {
    original: code,
    fixed,
    fixesApplied,
  };
}

/**
 * Auto-fix code based on type
 */
export function fixCode(code: string, type: "css" | "js"): FixedCode {
  if (type === "css") {
    return fixCSS(code);
  } else {
    return fixJavaScript(code);
  }
}
