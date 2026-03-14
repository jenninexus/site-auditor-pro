export interface SecurityResult {
  score: number;
  https: boolean;
  headers: Record<string, { present: boolean; value: string | null; grade: 'good' | 'partial' | 'missing' }>;
  issues: SecurityIssue[];
}

export interface SecurityIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation: string;
}

interface HeaderCheck {
  key: string;
  label: string;
  severity: 'critical' | 'warning' | 'info';
  evaluate: (value: string | undefined) => { grade: 'good' | 'partial' | 'missing'; issue?: Omit<SecurityIssue, 'id'> };
}

function normalizeHeaders(headers: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

export function analyzeSecurity(headers: Record<string, string>, url: string): SecurityResult {
  const issues: SecurityIssue[] = [];
  const normalized = normalizeHeaders(headers);
  const isHttps = url.toLowerCase().startsWith('https');

  const headerResults: Record<string, { present: boolean; value: string | null; grade: 'good' | 'partial' | 'missing' }> = {};

  const checks: HeaderCheck[] = [
    {
      key: 'content-security-policy',
      label: 'Content-Security-Policy',
      severity: 'critical',
      evaluate: (value) => {
        if (!value) {
          return {
            grade: 'missing',
            issue: {
              severity: 'critical',
              title: 'Missing Content-Security-Policy header',
              description: 'The Content-Security-Policy header is not set. This leaves the site vulnerable to XSS and data injection attacks.',
              recommendation: 'Implement a Content-Security-Policy header to control which resources the browser is allowed to load.',
            },
          };
        }
        return { grade: 'good' };
      },
    },
    {
      key: 'strict-transport-security',
      label: 'Strict-Transport-Security',
      severity: 'warning',
      evaluate: (value) => {
        if (!value) {
          if (!isHttps) {
            return { grade: 'missing' };
          }
          return {
            grade: 'missing',
            issue: {
              severity: 'warning',
              title: 'Missing Strict-Transport-Security header',
              description: 'The HSTS header is not set on an HTTPS site. Browsers may still allow insecure HTTP connections.',
              recommendation: 'Add Strict-Transport-Security with max-age of at least 31536000 (1 year) and includeSubDomains.',
            },
          };
        }
        const maxAgeMatch = value.match(/max-age\s*=\s*(\d+)/i);
        const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
        if (maxAge < 31536000) {
          return {
            grade: 'partial',
            issue: {
              severity: 'warning',
              title: 'Weak Strict-Transport-Security max-age',
              description: `HSTS max-age is ${maxAge} seconds. The recommended minimum is 31536000 (1 year).`,
              recommendation: 'Increase the HSTS max-age to at least 31536000 seconds.',
            },
          };
        }
        return { grade: 'good' };
      },
    },
    {
      key: 'x-frame-options',
      label: 'X-Frame-Options',
      severity: 'warning',
      evaluate: (value) => {
        if (!value) {
          return {
            grade: 'missing',
            issue: {
              severity: 'warning',
              title: 'Missing X-Frame-Options header',
              description: 'The X-Frame-Options header is not set. The page may be vulnerable to clickjacking attacks.',
              recommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN to prevent clickjacking.',
            },
          };
        }
        const upper = value.toUpperCase().trim();
        if (upper === 'DENY' || upper === 'SAMEORIGIN') {
          return { grade: 'good' };
        }
        return {
          grade: 'partial',
          issue: {
            severity: 'warning',
            title: 'Weak X-Frame-Options value',
            description: `X-Frame-Options is set to "${value}" which may not provide adequate protection.`,
            recommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN.',
          },
        };
      },
    },
    {
      key: 'x-content-type-options',
      label: 'X-Content-Type-Options',
      severity: 'warning',
      evaluate: (value) => {
        if (!value) {
          return {
            grade: 'missing',
            issue: {
              severity: 'warning',
              title: 'Missing X-Content-Type-Options header',
              description: 'The X-Content-Type-Options header is not set. The browser may MIME-sniff responses, leading to security issues.',
              recommendation: 'Set X-Content-Type-Options to "nosniff".',
            },
          };
        }
        if (value.toLowerCase().trim() === 'nosniff') {
          return { grade: 'good' };
        }
        return {
          grade: 'partial',
          issue: {
            severity: 'warning',
            title: 'Invalid X-Content-Type-Options value',
            description: `X-Content-Type-Options is set to "${value}" instead of "nosniff".`,
            recommendation: 'Set X-Content-Type-Options to "nosniff".',
          },
        };
      },
    },
    {
      key: 'referrer-policy',
      label: 'Referrer-Policy',
      severity: 'info',
      evaluate: (value) => {
        if (!value) {
          return {
            grade: 'missing',
            issue: {
              severity: 'info',
              title: 'Missing Referrer-Policy header',
              description: 'The Referrer-Policy header is not set. The browser will use its default referrer behavior.',
              recommendation: 'Set a Referrer-Policy header (e.g., "strict-origin-when-cross-origin") to control referrer information.',
            },
          };
        }
        return { grade: 'good' };
      },
    },
    {
      key: 'permissions-policy',
      label: 'Permissions-Policy',
      severity: 'info',
      evaluate: (value) => {
        if (!value) {
          return {
            grade: 'missing',
            issue: {
              severity: 'info',
              title: 'Missing Permissions-Policy header',
              description: 'The Permissions-Policy header is not set. Browser features like camera, microphone, and geolocation are not explicitly restricted.',
              recommendation: 'Set a Permissions-Policy header to restrict browser features your site does not need.',
            },
          };
        }
        return { grade: 'good' };
      },
    },
  ];

  for (const check of checks) {
    const value = normalized[check.key];
    const result = check.evaluate(value);

    headerResults[check.label] = {
      present: value !== undefined,
      value: value ?? null,
      grade: result.grade,
    };

    if (result.issue) {
      issues.push({
        id: `header-${check.key}`,
        ...result.issue,
      });
    }
  }

  // HTTPS check
  if (!isHttps) {
    issues.push({
      id: 'no-https',
      severity: 'critical',
      title: 'Site is not using HTTPS',
      description: 'The URL uses HTTP instead of HTTPS. Data transmitted is not encrypted.',
      recommendation: 'Migrate the site to HTTPS and redirect all HTTP traffic to HTTPS.',
    });
  }

  // Calculate score
  let score = 100;
  for (const issue of issues) {
    switch (issue.severity) {
      case 'critical':
        score -= 20;
        break;
      case 'warning':
        score -= 10;
        break;
      case 'info':
        score -= 3;
        break;
    }
  }
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    https: isHttps,
    headers: headerResults,
    issues,
  };
}
