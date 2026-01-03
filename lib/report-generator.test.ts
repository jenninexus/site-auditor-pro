import { describe, it, expect } from "vitest";
import { generateAuditReport, type AuditReport } from "./report-generator";
import { type AuditResult } from "./audit-engine";

describe("Report Generator", () => {
  const mockAuditResult: AuditResult = {
    url: "https://example.com",
    timestamp: Date.now(),
    cssScore: 70,
    jsScore: 75,
    overallScore: 72.5,
    issues: [
      {
        id: "css-fragmentation",
        category: "css",
        severity: "warning",
        title: "CSS Fragmentation",
        description: "Your site loads 6 external CSS files.",
        recommendation: "Consolidate CSS files into fewer bundles.",
        difficulty: "medium",
        impact: "high",
      },
      {
        id: "duplicate-scripts",
        category: "javascript",
        severity: "critical",
        title: "Duplicate Script Files",
        description: "2 script files are loaded multiple times.",
        recommendation: "Remove duplicate script tags.",
        difficulty: "easy",
        impact: "high",
      },
      {
        id: "unminified-css",
        category: "performance",
        severity: "info",
        title: "Unminified CSS Files",
        description: "2 CSS files are not minified.",
        recommendation: "Use a build tool to minify CSS files.",
        difficulty: "easy",
        impact: "medium",
      },
    ],
    summary: {
      totalIssues: 3,
      criticalCount: 1,
      warningCount: 1,
      infoCount: 1,
    },
  };

  describe("generateAuditReport", () => {
    it("should generate a complete audit report", () => {
      const report = generateAuditReport(mockAuditResult);

      expect(report).toBeDefined();
      expect(report.auditResult).toEqual(mockAuditResult);
      expect(report.executiveSummary).toBeDefined();
      expect(report.recommendations).toBeInstanceOf(Array);
      expect(report.implementationPriority).toBeInstanceOf(Array);
      expect(report.estimatedTotalEffort).toBeDefined();
      expect(report.keyMetrics).toBeDefined();
    });

    it("should include all issues as recommendations", () => {
      const report = generateAuditReport(mockAuditResult);

      expect(report.recommendations.length).toBe(mockAuditResult.issues.length);
      const recommendationIds = report.recommendations.map((r) => r.issueId);
      mockAuditResult.issues.forEach((issue) => {
        expect(recommendationIds).toContain(issue.id);
      });
    });

    it("should prioritize critical issues first", () => {
      const report = generateAuditReport(mockAuditResult);

      const criticalRecommendations = report.recommendations.filter((r) => r.priority === "high");
      expect(criticalRecommendations.length).toBeGreaterThan(0);
      expect(report.recommendations[0].priority).toBe("high");
    });

    it("should generate executive summary", () => {
      const report = generateAuditReport(mockAuditResult);

      expect(report.executiveSummary).toContain("example.com");
      expect(report.executiveSummary).toContain("73");
      expect(report.executiveSummary).toContain("3");
    });

    it("should calculate key metrics", () => {
      const report = generateAuditReport(mockAuditResult);

      expect(report.keyMetrics.issuesByCategory).toBeDefined();
      expect(report.keyMetrics.issuesBySeverity).toBeDefined();
      expect(report.keyMetrics.improvementPotential).toBeGreaterThanOrEqual(0);
      expect(report.keyMetrics.improvementPotential).toBeLessThanOrEqual(100);

      expect(report.keyMetrics.issuesByCategory["css"]).toBe(1);
      expect(report.keyMetrics.issuesByCategory["javascript"]).toBe(1);
      expect(report.keyMetrics.issuesByCategory["performance"]).toBe(1);

      expect(report.keyMetrics.issuesBySeverity["critical"]).toBe(1);
      expect(report.keyMetrics.issuesBySeverity["warning"]).toBe(1);
      expect(report.keyMetrics.issuesBySeverity["info"]).toBe(1);
    });

    it("should set implementation priority with critical issues first", () => {
      const report = generateAuditReport(mockAuditResult);

      expect(report.implementationPriority).toContain("duplicate-scripts");
      expect(report.implementationPriority[0]).toBe("duplicate-scripts");
    });

    it("should estimate total effort", () => {
      const report = generateAuditReport(mockAuditResult);

      expect(report.estimatedTotalEffort).toBeDefined();
      expect(
        [
          "Less than half a day",
          "Half a day to 1 day",
          "1-2 days",
          "2-5 days",
          "1-2 weeks",
        ].includes(report.estimatedTotalEffort)
      ).toBe(true);
    });

    it("should generate detailed recommendations for CSS fragmentation", () => {
      const report = generateAuditReport(mockAuditResult);

      const cssFragRec = report.recommendations.find((r) => r.issueId === "css-fragmentation");
      expect(cssFragRec).toBeDefined();
      expect(cssFragRec?.steps.length).toBeGreaterThan(0);
      expect(cssFragRec?.tools.length).toBeGreaterThan(0);
      expect(cssFragRec?.expectedBenefit).toBeDefined();
    });

    it("should generate detailed recommendations for duplicate scripts", () => {
      const report = generateAuditReport(mockAuditResult);

      const dupScriptRec = report.recommendations.find((r) => r.issueId === "duplicate-scripts");
      expect(dupScriptRec).toBeDefined();
      expect(dupScriptRec?.priority).toBe("high");
      expect(dupScriptRec?.steps.length).toBeGreaterThan(0);
      expect(dupScriptRec?.steps.some((s) => s.code)).toBe(true);
    });

    it("should include code examples in recommendations", () => {
      const report = generateAuditReport(mockAuditResult);

      const recommendationsWithCode = report.recommendations.filter((r) =>
        r.steps.some((s) => s.code)
      );
      expect(recommendationsWithCode.length).toBeGreaterThan(0);
    });

    it("should include tools in recommendations", () => {
      const report = generateAuditReport(mockAuditResult);

      const recommendationsWithTools = report.recommendations.filter((r) => r.tools.length > 0);
      expect(recommendationsWithTools.length).toBeGreaterThan(0);
    });

    it("should handle reports with no issues", () => {
      const emptyResult: AuditResult = {
        ...mockAuditResult,
        cssScore: 100,
        jsScore: 100,
        overallScore: 100,
        issues: [],
        summary: {
          totalIssues: 0,
          criticalCount: 0,
          warningCount: 0,
          infoCount: 0,
        },
      };

      const report = generateAuditReport(emptyResult);

      expect(report.recommendations.length).toBe(0);
      expect(report.keyMetrics.improvementPotential).toBeLessThanOrEqual(10);
    });

    it("should calculate improvement potential correctly", () => {
      const report = generateAuditReport(mockAuditResult);

      // With score of 72.5, improvement potential should be around 27-28%
      expect(report.keyMetrics.improvementPotential).toBeGreaterThan(20);
      expect(report.keyMetrics.improvementPotential).toBeLessThan(35);
    });

    it("should include related issues in recommendations", () => {
      const report = generateAuditReport(mockAuditResult);

      const cssFragRec = report.recommendations.find((r) => r.issueId === "css-fragmentation");
      expect(cssFragRec?.relatedIssues).toBeDefined();
      expect(Array.isArray(cssFragRec?.relatedIssues)).toBe(true);
    });
  });

  describe("Recommendation Details", () => {
    it("should provide step-by-step guidance", () => {
      const report = generateAuditReport(mockAuditResult);

      report.recommendations.forEach((rec) => {
        expect(rec.steps.length).toBeGreaterThan(0);
        rec.steps.forEach((step, index) => {
          expect(step.step).toBe(index + 1);
          expect(step.title).toBeDefined();
          expect(step.description).toBeDefined();
        });
      });
    });

    it("should include expected benefits", () => {
      const report = generateAuditReport(mockAuditResult);

      report.recommendations.forEach((rec) => {
        expect(rec.expectedBenefit).toBeDefined();
        expect(rec.expectedBenefit.length).toBeGreaterThan(0);
      });
    });

    it("should estimate effort accurately", () => {
      const report = generateAuditReport(mockAuditResult);

      report.recommendations.forEach((rec) => {
        const validEfforts = [
          "1-2 hours",
          "2-4 hours",
          "4-8 hours",
          "1-2 days",
          "2+ days",
        ];
        expect(validEfforts).toContain(rec.estimatedEffort);
      });
    });
  });

  describe("Executive Summary", () => {
    it("should include URL in summary", () => {
      const report = generateAuditReport(mockAuditResult);

      expect(report.executiveSummary).toContain("example.com");
    });

    it("should include scores in summary", () => {
      const report = generateAuditReport(mockAuditResult);

      expect(report.executiveSummary).toContain("73");
      expect(report.executiveSummary).toContain("70");
      expect(report.executiveSummary).toContain("75");
    });

    it("should include issue counts in summary", () => {
      const report = generateAuditReport(mockAuditResult);

      expect(report.executiveSummary).toContain("3");
      expect(report.executiveSummary).toContain("1");
    });

    it("should warn about critical issues", () => {
      const report = generateAuditReport(mockAuditResult);

      expect(report.executiveSummary).toContain("Critical");
    });
  });
});
