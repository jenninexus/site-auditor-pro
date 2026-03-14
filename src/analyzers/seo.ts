export interface SEOResult {
  score: number;
  title: { exists: boolean; length: number; value: string; optimal: boolean };
  metaDescription: {
    exists: boolean;
    length: number;
    value: string;
    optimal: boolean;
  };
  headings: {
    h1Count: number;
    hierarchy: string[];
    hasProperStructure: boolean;
  };
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    altCoverage: number;
  };
  openGraph: {
    hasOgTitle: boolean;
    hasOgDescription: boolean;
    hasOgImage: boolean;
    hasOgUrl: boolean;
  };
  canonical: { exists: boolean; value: string | null };
  robots: { hasMetaRobots: boolean; isIndexable: boolean };
  structuredData: {
    hasJsonLd: boolean;
    hasMicrodata: boolean;
    types: string[];
  };
  issues: SEOIssue[];
}

export interface SEOIssue {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  recommendation: string;
}

function extractTitle(html: string): {
  exists: boolean;
  length: number;
  value: string;
  optimal: boolean;
} {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) {
    return { exists: false, length: 0, value: "", optimal: false };
  }
  const value = match[1].trim();
  const length = value.length;
  const optimal = length >= 50 && length <= 60;
  return { exists: true, length, value, optimal };
}

function extractMetaDescription(html: string): {
  exists: boolean;
  length: number;
  value: string;
  optimal: boolean;
} {
  const match = html.match(
    /<meta\s+[^>]*name\s*=\s*["']description["'][^>]*>/i,
  );
  if (!match) {
    return { exists: false, length: 0, value: "", optimal: false };
  }
  const contentMatch = match[0].match(/content\s*=\s*["']([\s\S]*?)["']/i);
  if (!contentMatch) {
    return { exists: true, length: 0, value: "", optimal: false };
  }
  const value = contentMatch[1].trim();
  const length = value.length;
  const optimal = length >= 150 && length <= 160;
  return { exists: true, length, value, optimal };
}

function extractHeadings(html: string): {
  h1Count: number;
  hierarchy: string[];
  hasProperStructure: boolean;
} {
  const headingRegex = /<(h[1-6])[^>]*>[\s\S]*?<\/\1>/gi;
  const hierarchy: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null) {
    hierarchy.push(match[1].toLowerCase());
  }

  const h1Count = hierarchy.filter((h) => h === "h1").length;

  // Check proper nesting: no skipping levels (e.g., h1 -> h3 without h2)
  let hasProperStructure = true;
  let lastLevel = 0;
  for (const tag of hierarchy) {
    const level = parseInt(tag[1], 10);
    if (lastLevel > 0 && level > lastLevel + 1) {
      hasProperStructure = false;
      break;
    }
    lastLevel = level;
  }

  return { h1Count, hierarchy, hasProperStructure };
}

function extractImages(html: string): {
  total: number;
  withAlt: number;
  withoutAlt: number;
  altCoverage: number;
} {
  const imgRegex = /<img\s[^>]*>/gi;
  const images: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[0]);
  }

  const total = images.length;
  if (total === 0) {
    return { total: 0, withAlt: 0, withoutAlt: 0, altCoverage: 100 };
  }

  const withAlt = images.filter((img) =>
    /\salt\s*=\s*["'][^"']*["']/i.test(img),
  ).length;
  const withoutAlt = total - withAlt;
  const altCoverage = Math.round((withAlt / total) * 100);

  return { total, withAlt, withoutAlt, altCoverage };
}

function extractOpenGraph(html: string): {
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  hasOgImage: boolean;
  hasOgUrl: boolean;
} {
  const hasTag = (property: string): boolean => {
    const regex = new RegExp(
      `<meta\\s+[^>]*property\\s*=\\s*["']${property}["'][^>]*>`,
      "i",
    );
    return regex.test(html);
  };

  return {
    hasOgTitle: hasTag("og:title"),
    hasOgDescription: hasTag("og:description"),
    hasOgImage: hasTag("og:image"),
    hasOgUrl: hasTag("og:url"),
  };
}

function extractCanonical(html: string): {
  exists: boolean;
  value: string | null;
} {
  const match = html.match(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*>/i);
  if (!match) {
    return { exists: false, value: null };
  }
  const hrefMatch = match[0].match(/href\s*=\s*["']([^"']*)["']/i);
  return { exists: true, value: hrefMatch ? hrefMatch[1] : null };
}

function extractRobots(html: string): {
  hasMetaRobots: boolean;
  isIndexable: boolean;
} {
  const match = html.match(/<meta\s+[^>]*name\s*=\s*["']robots["'][^>]*>/i);
  if (!match) {
    return { hasMetaRobots: false, isIndexable: true };
  }
  const contentMatch = match[0].match(/content\s*=\s*["']([^"']*)["']/i);
  const content = contentMatch ? contentMatch[1].toLowerCase() : "";
  const isIndexable = !content.includes("noindex");
  return { hasMetaRobots: true, isIndexable };
}

function extractStructuredData(html: string): {
  hasJsonLd: boolean;
  hasMicrodata: boolean;
  types: string[];
} {
  const hasJsonLd =
    /<script\s+[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>/i.test(html);
  const hasMicrodata = /itemscope/i.test(html) && /itemtype/i.test(html);
  const types: string[] = [];

  // Extract JSON-LD types
  const jsonLdRegex =
    /<script\s+[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      if (data["@type"]) {
        types.push(String(data["@type"]));
      }
    } catch {
      // Ignore malformed JSON-LD
    }
  }

  // Extract microdata types
  const microdataRegex = /itemtype\s*=\s*["']([^"']*)["']/gi;
  while ((match = microdataRegex.exec(html)) !== null) {
    types.push(match[1]);
  }

  return { hasJsonLd, hasMicrodata, types };
}

export function analyzeSEO(html: string, _url: string): SEOResult {
  const issues: SEOIssue[] = [];

  const title = extractTitle(html);
  const metaDescription = extractMetaDescription(html);
  const headings = extractHeadings(html);
  const images = extractImages(html);
  const openGraph = extractOpenGraph(html);
  const canonical = extractCanonical(html);
  const robots = extractRobots(html);
  const structuredData = extractStructuredData(html);

  // Title issues
  if (!title.exists) {
    issues.push({
      id: "title-missing",
      severity: "critical",
      title: "Missing page title",
      description: "The page does not have a <title> tag.",
      recommendation:
        "Add a descriptive <title> tag between 50 and 60 characters.",
    });
  } else {
    if (title.length < 30) {
      issues.push({
        id: "title-too-short",
        severity: "warning",
        title: "Page title too short",
        description: `The title is ${title.length} characters. Titles under 30 characters may not be descriptive enough.`,
        recommendation:
          "Expand the title to 50-60 characters for optimal display in search results.",
      });
    }
    if (title.length > 60) {
      issues.push({
        id: "title-too-long",
        severity: "warning",
        title: "Page title too long",
        description: `The title is ${title.length} characters. Titles over 60 characters may be truncated in search results.`,
        recommendation:
          "Shorten the title to 50-60 characters for optimal display.",
      });
    }
  }

  // Meta description issues
  if (!metaDescription.exists) {
    issues.push({
      id: "meta-description-missing",
      severity: "critical",
      title: "Missing meta description",
      description: "The page does not have a meta description tag.",
      recommendation:
        'Add a <meta name="description"> tag with 150-160 characters summarizing the page content.',
    });
  } else if (!metaDescription.optimal) {
    issues.push({
      id: "meta-description-length",
      severity: "warning",
      title: "Meta description length not optimal",
      description: `The meta description is ${metaDescription.length} characters. The optimal range is 150-160.`,
      recommendation: "Adjust the meta description to 150-160 characters.",
    });
  }

  // Heading issues
  if (headings.h1Count === 0) {
    issues.push({
      id: "h1-missing",
      severity: "critical",
      title: "Missing H1 heading",
      description: "The page does not contain an H1 heading.",
      recommendation:
        "Add a single H1 heading that describes the main topic of the page.",
    });
  } else if (headings.h1Count > 1) {
    issues.push({
      id: "multiple-h1",
      severity: "warning",
      title: "Multiple H1 headings",
      description: `The page has ${headings.h1Count} H1 headings. Best practice is to use only one.`,
      recommendation:
        "Use a single H1 heading per page and use H2-H6 for subsections.",
    });
  }

  if (!headings.hasProperStructure) {
    issues.push({
      id: "heading-hierarchy",
      severity: "warning",
      title: "Improper heading hierarchy",
      description: "Heading levels are skipped (e.g., H1 to H3 without H2).",
      recommendation:
        "Use headings in sequential order without skipping levels.",
    });
  }

  // Image alt issues
  if (images.total > 0) {
    if (images.altCoverage < 50) {
      issues.push({
        id: "images-alt-critical",
        severity: "critical",
        title: "Most images missing alt text",
        description: `Only ${images.altCoverage}% of images have alt attributes (${images.withAlt}/${images.total}).`,
        recommendation:
          "Add descriptive alt text to all images for accessibility and SEO.",
      });
    } else if (images.altCoverage < 80) {
      issues.push({
        id: "images-alt-warning",
        severity: "warning",
        title: "Some images missing alt text",
        description: `${images.altCoverage}% of images have alt attributes (${images.withAlt}/${images.total}).`,
        recommendation: "Add descriptive alt text to all remaining images.",
      });
    }
  }

  // Open Graph issues
  const ogMissing: string[] = [];
  if (!openGraph.hasOgTitle) ogMissing.push("og:title");
  if (!openGraph.hasOgDescription) ogMissing.push("og:description");
  if (!openGraph.hasOgImage) ogMissing.push("og:image");
  if (!openGraph.hasOgUrl) ogMissing.push("og:url");

  if (ogMissing.length > 0) {
    issues.push({
      id: "og-tags-missing",
      severity: "warning",
      title: "Missing Open Graph tags",
      description: `The following OG tags are missing: ${ogMissing.join(", ")}.`,
      recommendation:
        "Add Open Graph meta tags for better social media sharing previews.",
    });
  }

  // Canonical issues
  if (!canonical.exists) {
    issues.push({
      id: "canonical-missing",
      severity: "info",
      title: "No canonical URL specified",
      description: "The page does not have a canonical link tag.",
      recommendation:
        'Add <link rel="canonical"> to specify the preferred URL for this page.',
    });
  }

  // Robots issues
  if (robots.hasMetaRobots && !robots.isIndexable) {
    issues.push({
      id: "noindex-detected",
      severity: "warning",
      title: "Page set to noindex",
      description:
        'The robots meta tag includes "noindex", which prevents search engines from indexing this page.',
      recommendation:
        "Remove noindex if you want this page to appear in search results.",
    });
  }

  // Structured data issues
  if (!structuredData.hasJsonLd && !structuredData.hasMicrodata) {
    issues.push({
      id: "no-structured-data",
      severity: "info",
      title: "No structured data found",
      description:
        "The page does not contain JSON-LD or Microdata structured data.",
      recommendation:
        "Add structured data (JSON-LD recommended) to enhance search result appearance.",
    });
  }

  // Calculate score
  let score = 100;
  for (const issue of issues) {
    switch (issue.severity) {
      case "critical":
        score -= 15;
        break;
      case "warning":
        score -= 8;
        break;
      case "info":
        score -= 2;
        break;
    }
  }
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    title,
    metaDescription,
    headings,
    images,
    openGraph,
    canonical,
    robots,
    structuredData,
    issues,
  };
}
