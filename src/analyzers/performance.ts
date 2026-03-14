export interface PerformanceResult {
  score: number;
  pageWeight: { html: number; css: number; js: number; total: number; grade: string };
  assetCount: { stylesheets: number; scripts: number; images: number; total: number };
  compression: boolean;
  caching: { hasCacheHeaders: boolean };
  renderBlocking: { blockingCSS: number; blockingJS: number };
  images: { total: number; lazy: number; large: number; modernFormat: number };
  issues: PerformanceIssue[];
}

export interface PerformanceIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
}

function sumInlineContent(html: string, tagRegex: RegExp): number {
  let total = 0;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(html)) !== null) {
    total += match[1].length;
  }
  return total;
}

function normalizeHeaders(headers: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

export function analyzePerformance(html: string, headers: Record<string, string>): PerformanceResult {
  const issues: PerformanceIssue[] = [];
  const normalized = normalizeHeaders(headers);

  // --- Page Weight ---
  const htmlSize = html.length;

  // Inline CSS: content of <style> tags
  const inlineCSSRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const cssSize = sumInlineContent(html, inlineCSSRegex);

  // Inline JS: content of <script> tags WITHOUT a src attribute
  const inlineJSRegex = /<script(?![^>]*\ssrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
  const jsSize = sumInlineContent(html, inlineJSRegex);

  // htmlSize already includes inline CSS/JS, so don't double-count
  const totalWeight = htmlSize;

  let grade: string;
  if (totalWeight < 500_000) {
    grade = 'good';
  } else if (totalWeight < 1_000_000) {
    grade = 'warning';
  } else {
    grade = 'critical';
  }

  if (totalWeight >= 1_000_000) {
    issues.push({
      id: 'page-weight-critical',
      severity: 'critical',
      title: 'Page weight exceeds 1MB',
      description: `Total inline page weight is ${(totalWeight / 1024).toFixed(0)}KB (HTML: ${(htmlSize / 1024).toFixed(0)}KB, CSS: ${(cssSize / 1024).toFixed(0)}KB, JS: ${(jsSize / 1024).toFixed(0)}KB).`,
      recommendation: 'Reduce inline CSS and JavaScript. Move large scripts and styles to external files and minify them.',
    });
  } else if (totalWeight >= 500_000) {
    issues.push({
      id: 'page-weight-warning',
      severity: 'warning',
      title: 'Page weight exceeds 500KB',
      description: `Total inline page weight is ${(totalWeight / 1024).toFixed(0)}KB.`,
      recommendation: 'Consider reducing inline content and minifying assets for faster page loads.',
    });
  }

  // --- Asset Counts ---
  const externalCSSRegex = /<link\s[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi;
  let stylesheetCount = 0;
  while (externalCSSRegex.exec(html) !== null) {
    stylesheetCount++;
  }

  const externalJSRegex = /<script\s[^>]*src\s*=\s*["'][^"']+["'][^>]*>/gi;
  let scriptCount = 0;
  while (externalJSRegex.exec(html) !== null) {
    scriptCount++;
  }

  const imgRegex = /<img\s[^>]*>/gi;
  const imgTags: string[] = [];
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    imgTags.push(imgMatch[0]);
  }
  const imageCount = imgTags.length;

  const totalAssets = stylesheetCount + scriptCount + imageCount;

  if (totalAssets > 50) {
    issues.push({
      id: 'too-many-assets',
      severity: 'warning',
      title: 'High number of page assets',
      description: `The page references ${totalAssets} assets (${stylesheetCount} CSS, ${scriptCount} JS, ${imageCount} images).`,
      recommendation: 'Reduce the number of requests by bundling CSS/JS files and using image sprites or lazy loading.',
    });
  }

  // --- Compression ---
  const contentEncoding = normalized['content-encoding'] ?? '';
  const hasCompression = /gzip|br|deflate/i.test(contentEncoding);

  if (!hasCompression) {
    issues.push({
      id: 'no-compression',
      severity: 'warning',
      title: 'No content compression detected',
      description: 'The Content-Encoding header does not indicate gzip, Brotli, or deflate compression.',
      recommendation: 'Enable gzip or Brotli compression on your server to reduce transfer sizes.',
    });
  }

  // --- Caching ---
  const hasCacheControl = 'cache-control' in normalized;
  const hasExpires = 'expires' in normalized;
  const hasCacheHeaders = hasCacheControl || hasExpires;

  if (!hasCacheHeaders) {
    issues.push({
      id: 'no-cache-headers',
      severity: 'info',
      title: 'No caching headers detected',
      description: 'Neither Cache-Control nor Expires headers are present.',
      recommendation: 'Set appropriate Cache-Control headers to leverage browser caching for static assets.',
    });
  }

  // --- Render-Blocking Resources ---
  // Extract <head> content using indexOf (safe against backtracking on malformed HTML)
  let headContent = '';
  const headStart = html.indexOf('<head');
  const headEnd = html.indexOf('</head');
  if (headStart !== -1 && headEnd !== -1 && headEnd > headStart) {
    const innerStart = html.indexOf('>', headStart) + 1;
    headContent = html.substring(innerStart, headEnd);
  }

  // Blocking CSS: <link rel="stylesheet"> in <head> without media attribute (or media="all"/"screen")
  const headCSSRegex = /<link\s[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi;
  let blockingCSS = 0;
  let cssMatch: RegExpExecArray | null;
  while ((cssMatch = headCSSRegex.exec(headContent)) !== null) {
    const tag = cssMatch[0];
    const mediaMatch = tag.match(/media\s*=\s*["']([^"']*)["']/i);
    // No media attribute, or media="all"/"screen" are render-blocking
    if (!mediaMatch || mediaMatch[1] === 'all' || mediaMatch[1] === 'screen') {
      blockingCSS++;
    }
  }

  // Blocking JS: <script src="..."> in <head> without async or defer
  const headJSRegex = /<script\s[^>]*src\s*=\s*["'][^"']+["'][^>]*>/gi;
  let blockingJS = 0;
  let jsMatch: RegExpExecArray | null;
  while ((jsMatch = headJSRegex.exec(headContent)) !== null) {
    const tag = jsMatch[0];
    const hasAsync = /\basync\b/i.test(tag);
    const hasDefer = /\bdefer\b/i.test(tag);
    if (!hasAsync && !hasDefer) {
      blockingJS++;
    }
  }

  if (blockingCSS > 3) {
    issues.push({
      id: 'render-blocking-css',
      severity: 'warning',
      title: 'Multiple render-blocking stylesheets',
      description: `${blockingCSS} render-blocking CSS files found in <head>.`,
      recommendation: 'Inline critical CSS and load non-critical stylesheets asynchronously or with media queries.',
    });
  }

  if (blockingJS > 0) {
    issues.push({
      id: 'render-blocking-js',
      severity: 'warning',
      title: 'Render-blocking JavaScript in <head>',
      description: `${blockingJS} JavaScript file(s) in <head> without async or defer attributes.`,
      recommendation: 'Add async or defer attributes to script tags, or move them to the end of <body>.',
    });
  }

  // --- Images ---
  const lazyImages = imgTags.filter((tag) => /loading\s*=\s*["']lazy["']/i.test(tag)).length;

  // Check for modern formats (WebP, AVIF) in <picture> sources and img src
  const modernFormatRegex = /\.(webp|avif)/i;
  let modernFormatCount = 0;

  // Check <source> tags inside <picture>
  const sourceRegex = /<source\s[^>]*srcset\s*=\s*["']([^"']*)["'][^>]*>/gi;
  const modernSources = new Set<string>();
  let sourceMatch: RegExpExecArray | null;
  while ((sourceMatch = sourceRegex.exec(html)) !== null) {
    if (modernFormatRegex.test(sourceMatch[1])) {
      modernSources.add(sourceMatch[1]);
    }
  }
  modernFormatCount += modernSources.size;

  // Check img src for modern formats
  for (const tag of imgTags) {
    const srcMatch = tag.match(/src\s*=\s*["']([^"']*)["']/i);
    if (srcMatch && modernFormatRegex.test(srcMatch[1])) {
      modernFormatCount++;
    }
  }

  // Estimate "large" images by checking for width/height attributes > 1000
  let largeImages = 0;
  for (const tag of imgTags) {
    const widthMatch = tag.match(/width\s*=\s*["']?(\d+)/i);
    const heightMatch = tag.match(/height\s*=\s*["']?(\d+)/i);
    const width = widthMatch ? parseInt(widthMatch[1], 10) : 0;
    const height = heightMatch ? parseInt(heightMatch[1], 10) : 0;
    if (width > 1000 || height > 1000) {
      largeImages++;
    }
  }

  if (imageCount > 5 && lazyImages === 0) {
    issues.push({
      id: 'no-lazy-loading',
      severity: 'warning',
      title: 'No lazy-loaded images',
      description: `The page has ${imageCount} images but none use loading="lazy".`,
      recommendation: 'Add loading="lazy" to below-the-fold images to improve initial page load.',
    });
  }

  if (imageCount > 0 && modernFormatCount === 0) {
    issues.push({
      id: 'no-modern-image-formats',
      severity: 'info',
      title: 'No modern image formats detected',
      description: 'No WebP or AVIF images were found. These formats offer better compression than JPEG/PNG.',
      recommendation: 'Convert images to WebP or AVIF format and use <picture> elements for fallback support.',
    });
  }

  if (largeImages > 0) {
    issues.push({
      id: 'large-images',
      severity: 'info',
      title: 'Large dimension images detected',
      description: `${largeImages} image(s) have width or height exceeding 1000px.`,
      recommendation: 'Serve appropriately sized images using srcset or resize images to match their display dimensions.',
    });
  }

  // --- Calculate Score ---
  let score = 100;
  for (const issue of issues) {
    switch (issue.severity) {
      case 'critical':
        score -= 15;
        break;
      case 'warning':
        score -= 8;
        break;
      case 'info':
        score -= 2;
        break;
    }
  }
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    pageWeight: { html: htmlSize, css: cssSize, js: jsSize, total: totalWeight, grade },
    assetCount: { stylesheets: stylesheetCount, scripts: scriptCount, images: imageCount, total: totalAssets },
    compression: hasCompression,
    caching: { hasCacheHeaders },
    renderBlocking: { blockingCSS, blockingJS },
    images: { total: imageCount, lazy: lazyImages, large: largeImages, modernFormat: modernFormatCount },
    issues,
  };
}
