/**
 * PDF Report Generator
 * Generates professional PDF reports from audit results
 */

import { AuditResult } from "./audit-engine";

export interface PDFReportOptions {
  companyName?: string;
  companyLogo?: string;
  includeRecommendations?: boolean;
}

/**
 * Generate a PDF report as HTML (for web export)
 */
export function generatePDFReportHTML(
  result: AuditResult,
  options: PDFReportOptions = {}
): string {
  const {
    companyName = "Site Auditor Pro",
    includeRecommendations = true,
  } = options;

  const date = new Date(result.timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "#ef4444";
      case "warning":
        return "#f59e0b";
      case "info":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const criticalIssues = result.issues.filter((i) => i.severity === "critical");
  const warningIssues = result.issues.filter((i) => i.severity === "warning");
  const infoIssues = result.issues.filter((i) => i.severity === "info");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Audit Report - ${result.url}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      background: #f9fafb;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 60px 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 30px;
    }
    
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
      color: #111827;
    }
    
    .header p {
      color: #6b7280;
      font-size: 14px;
    }
    
    .company-name {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 20px;
    }
    
    .url-section {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
      word-break: break-all;
    }
    
    .url-section label {
      font-weight: 600;
      color: #6b7280;
      font-size: 12px;
      display: block;
      margin-bottom: 5px;
    }
    
    .url-section p {
      color: #1f2937;
      font-size: 14px;
    }
    
    .scores-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .score-card {
      background: #f9fafb;
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    
    .score-card h3 {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .score-value {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .score-label {
      font-size: 12px;
      color: #9ca3af;
    }
    
    .summary-section {
      background: #f0f9ff;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
      margin-bottom: 30px;
    }
    
    .summary-section h2 {
      font-size: 16px;
      margin-bottom: 12px;
      color: #1e40af;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    
    .summary-item {
      text-align: center;
    }
    
    .summary-item .number {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
    }
    
    .summary-item .label {
      font-size: 12px;
      color: #6b7280;
    }
    
    .issues-section {
      margin-bottom: 30px;
    }
    
    .issues-section h2 {
      font-size: 18px;
      margin-bottom: 20px;
      color: #111827;
    }
    
    .issue-group {
      margin-bottom: 25px;
    }
    
    .issue-group-title {
      font-size: 14px;
      font-weight: 600;
      padding: 10px 15px;
      border-radius: 6px;
      margin-bottom: 12px;
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .issue-group-title.critical {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .issue-group-title.warning {
      background: #fef3c7;
      color: #92400e;
    }
    
    .issue-group-title.info {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .issue-item {
      background: #f9fafb;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 6px;
      border-left: 4px solid;
    }
    
    .issue-item.critical {
      border-left-color: #ef4444;
    }
    
    .issue-item.warning {
      border-left-color: #f59e0b;
    }
    
    .issue-item.info {
      border-left-color: #3b82f6;
    }
    
    .issue-title {
      font-weight: 600;
      color: #111827;
      margin-bottom: 5px;
    }
    
    .issue-description {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    
    .issue-meta {
      display: flex;
      gap: 15px;
      font-size: 12px;
      color: #9ca3af;
    }
    
    .issue-meta span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .recommendation {
      background: #ecfdf5;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      color: #065f46;
      border-left: 3px solid #10b981;
      margin-top: 8px;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    
    .page-break {
      page-break-after: always;
      margin: 40px 0;
    }
    
    @media print {
      body {
        background: white;
      }
      .container {
        padding: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-name">${companyName}</div>
      <h1>Site Audit Report</h1>
      <p>Generated on ${date}</p>
    </div>
    
    <div class="url-section">
      <label>Website URL</label>
      <p>${result.url}</p>
    </div>
    
    <div class="scores-grid">
      <div class="score-card">
        <h3>Overall Score</h3>
        <div class="score-value" style="color: ${getScoreColor(result.overallScore)}">
          ${Math.round(result.overallScore)}
        </div>
        <div class="score-label">out of 100</div>
      </div>
      <div class="score-card">
        <h3>CSS Score</h3>
        <div class="score-value" style="color: ${getScoreColor(result.cssScore)}">
          ${Math.round(result.cssScore)}
        </div>
        <div class="score-label">CSS Quality</div>
      </div>
      <div class="score-card">
        <h3>JavaScript Score</h3>
        <div class="score-value" style="color: ${getScoreColor(result.jsScore)}">
          ${Math.round(result.jsScore)}
        </div>
        <div class="score-label">JS Quality</div>
      </div>
    </div>
    
    <div class="summary-section">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="number">${result.summary.totalIssues}</div>
          <div class="label">Total Issues</div>
        </div>
        <div class="summary-item">
          <div class="number" style="color: #ef4444">${result.summary.criticalCount}</div>
          <div class="label">Critical</div>
        </div>
        <div class="summary-item">
          <div class="number" style="color: #f59e0b">${result.summary.warningCount}</div>
          <div class="label">Warnings</div>
        </div>
        <div class="summary-item">
          <div class="number" style="color: #3b82f6">${result.summary.infoCount}</div>
          <div class="label">Info</div>
        </div>
      </div>
    </div>
    
    ${
      result.issues.length > 0
        ? `
    <div class="issues-section">
      <h2>Issues Found</h2>
      
      ${
        criticalIssues.length > 0
          ? `
      <div class="issue-group">
        <div class="issue-group-title critical">
          <span>🔴</span> Critical Issues (${criticalIssues.length})
        </div>
        ${criticalIssues
          .map(
            (issue) => `
        <div class="issue-item critical">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-description">${issue.description}</div>
          <div class="issue-meta">
            <span>Difficulty: ${issue.difficulty}</span>
            <span>Impact: ${issue.impact}</span>
          </div>
          ${includeRecommendations ? `<div class="recommendation">✓ ${issue.recommendation}</div>` : ""}
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }
      
      ${
        warningIssues.length > 0
          ? `
      <div class="issue-group">
        <div class="issue-group-title warning">
          <span>⚠️</span> Warnings (${warningIssues.length})
        </div>
        ${warningIssues
          .map(
            (issue) => `
        <div class="issue-item warning">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-description">${issue.description}</div>
          <div class="issue-meta">
            <span>Difficulty: ${issue.difficulty}</span>
            <span>Impact: ${issue.impact}</span>
          </div>
          ${includeRecommendations ? `<div class="recommendation">✓ ${issue.recommendation}</div>` : ""}
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }
      
      ${
        infoIssues.length > 0
          ? `
      <div class="issue-group">
        <div class="issue-group-title info">
          <span>ℹ️</span> Info (${infoIssues.length})
        </div>
        ${infoIssues
          .map(
            (issue) => `
        <div class="issue-item info">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-description">${issue.description}</div>
          <div class="issue-meta">
            <span>Difficulty: ${issue.difficulty}</span>
            <span>Impact: ${issue.impact}</span>
          </div>
          ${includeRecommendations ? `<div class="recommendation">✓ ${issue.recommendation}</div>` : ""}
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }
    </div>
    `
        : `
    <div class="summary-section">
      <h2>✓ No Issues Found</h2>
      <p>Your website passed all audits with flying colors!</p>
    </div>
    `
    }
    
    <div class="footer">
      <p>Generated by ${companyName} | ${new Date().toLocaleString()}</p>
      <p>This report is confidential and intended for authorized use only.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Export PDF report as HTML file
 */
export function exportPDFReport(
  result: AuditResult,
  options: PDFReportOptions = {}
): void {
  const html = generatePDFReportHTML(result, options);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit-report-${new Date().getTime()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Print PDF report
 */
export function printPDFReport(
  result: AuditResult,
  options: PDFReportOptions = {}
): void {
  const html = generatePDFReportHTML(result, options);
  const printWindow = window.open("", "", "width=900,height=600");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
