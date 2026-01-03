import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  auditWebsite,
  type AuditResult,
  type AuditIssue,
} from "./audit-engine";

// Mock fetch for testing
global.fetch = vi.fn();

describe("Audit Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("auditWebsite", () => {
    it("should successfully audit a website and return results", async () => {
      const mockHtml = `
        <html>
          <head>
            <link rel="stylesheet" href="https://example.com/resources/css/main.min.css">
            <link rel="stylesheet" href="https://example.com/resources/css/theme.min.css">
            <link rel="stylesheet" href="https://example.com/resources/css/custom.css">
            <script src="https://example.com/resources/js/app.min.js"></script>
            <script src="https://example.com/resources/js/theme.min.js"></script>
          </head>
          <body>
            <div class="container">
              <h1 class="main-title">Test</h1>
              <p class="description">Test content</p>
            </div>
          </body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: async () => mockHtml,
      });

      const result = await auditWebsite("https://example.com");

      expect(result).toBeDefined();
      expect(result.url).toBe("https://example.com");
      expect(result.cssScore).toBeGreaterThanOrEqual(0);
      expect(result.cssScore).toBeLessThanOrEqual(100);
      expect(result.jsScore).toBeGreaterThanOrEqual(0);
      expect(result.jsScore).toBeLessThanOrEqual(100);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.summary).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it("should detect unminified CSS files", async () => {
      const mockHtml = `
        <html>
          <head>
            <link rel="stylesheet" href="https://example.com/styles/main.css">
            <link rel="stylesheet" href="https://example.com/styles/theme.css">
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: async () => mockHtml,
      });

      const result = await auditWebsite("https://example.com");

      const unminifiedIssue = result.issues.find((i) => i.id === "unminified-css");
      expect(unminifiedIssue).toBeDefined();
      expect(unminifiedIssue?.severity).toBe("info");
    });

    it("should detect duplicate scripts", async () => {
      const mockHtml = `
        <html>
          <head>
            <script src="https://example.com/js/app.js"></script>
            <script src="https://example.com/js/app.js"></script>
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: async () => mockHtml,
      });

      const result = await auditWebsite("https://example.com");

      const duplicateIssue = result.issues.find((i) => i.id === "duplicate-scripts");
      expect(duplicateIssue).toBeDefined();
      expect(duplicateIssue?.severity).toBe("critical");
    });

    it("should detect CSS fragmentation", async () => {
      const mockHtml = `
        <html>
          <head>
            <link rel="stylesheet" href="https://example.com/css/main.min.css">
            <link rel="stylesheet" href="https://example.com/css/theme.min.css">
            <link rel="stylesheet" href="https://example.com/css/custom.min.css">
            <link rel="stylesheet" href="https://example.com/css/layout.min.css">
            <link rel="stylesheet" href="https://example.com/css/responsive.min.css">
            <link rel="stylesheet" href="https://example.com/css/animations.min.css">
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: async () => mockHtml,
      });

      const result = await auditWebsite("https://example.com");

      const fragmentationIssue = result.issues.find((i) => i.id === "css-fragmentation");
      expect(fragmentationIssue).toBeDefined();
      expect(fragmentationIssue?.severity).toBe("warning");
    });

    it("should detect inline styles", async () => {
      const mockHtml = `
        <html>
          <head>
            <style>
              body { margin: 0; }
            </style>
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: async () => mockHtml,
      });

      const result = await auditWebsite("https://example.com");

      const inlineStylesIssue = result.issues.find((i) => i.id === "inline-styles");
      expect(inlineStylesIssue).toBeDefined();
      expect(inlineStylesIssue?.severity).toBe("info");
    });

    it("should calculate summary correctly", async () => {
      const mockHtml = `
        <html>
          <head>
            <link rel="stylesheet" href="https://example.com/css/main.css">
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: async () => mockHtml,
      });

      const result = await auditWebsite("https://example.com");

      expect(result.summary.totalIssues).toBe(result.issues.length);
      expect(result.summary.criticalCount).toBe(
        result.issues.filter((i) => i.severity === "critical").length
      );
      expect(result.summary.warningCount).toBe(
        result.issues.filter((i) => i.severity === "warning").length
      );
      expect(result.summary.infoCount).toBe(
        result.issues.filter((i) => i.severity === "info").length
      );
    });

    it("should handle fetch errors gracefully", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      await expect(auditWebsite("https://example.com")).rejects.toThrow("Failed to audit website");
    });

    it("should handle URLs without protocol", async () => {
      const mockHtml = `<html><head></head><body></body></html>`;

      (global.fetch as any).mockResolvedValueOnce({
        text: async () => mockHtml,
      });

      const result = await auditWebsite("example.com");

      expect(result).toBeDefined();
      expect(result.url).toBe("https://example.com");
    });

    it("should detect many external scripts", async () => {
      const mockHtml = `
        <html>
          <head>
            ${Array.from({ length: 10 }, (_, i) => `<script src="https://example.com/js/lib${i}.min.js"></script>`).join("\n")}
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: async () => mockHtml,
      });

      const result = await auditWebsite("https://example.com");

      const scriptFragmentationIssue = result.issues.find((i) => i.id === "script-fragmentation");
      expect(scriptFragmentationIssue).toBeDefined();
      expect(scriptFragmentationIssue?.severity).toBe("warning");
    });
  });

  describe("Score Calculation", () => {
    it("should return high scores for websites with no issues", async () => {
      const mockHtml = `
        <html>
          <head>
            <link rel="stylesheet" href="https://example.com/css/main.min.css">
            <script src="https://example.com/js/app.min.js"></script>
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: async () => mockHtml,
      });

      const result = await auditWebsite("https://example.com");

      expect(result.cssScore).toBeGreaterThan(80);
      expect(result.jsScore).toBeGreaterThan(80);
    });

    it("should return lower scores for websites with critical issues", async () => {
      const mockHtml = `
        <html>
          <head>
            <script src="https://example.com/js/app.js"></script>
            <script src="https://example.com/js/app.js"></script>
            <script src="https://example.com/js/app.js"></script>
          </head>
          <body></body>
        </html>
      `;

      (global.fetch as any).mockResolvedValueOnce({
        text: async () => mockHtml,
      });

      const result = await auditWebsite("https://example.com");

      expect(result.jsScore).toBeLessThanOrEqual(80);
    });
  });
});
