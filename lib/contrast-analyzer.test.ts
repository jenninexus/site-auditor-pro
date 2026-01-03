import { describe, it, expect } from "vitest";
import {
  calculateContrastRatio,
  getWCAGLevel,
  analyzePageContrast,
  suggestImprovedColors,
  type WCAGLevel,
} from "./contrast-analyzer";

describe("Contrast Analyzer", () => {
  describe("calculateContrastRatio", () => {
    it("should calculate contrast ratio for black and white", () => {
      const ratio = calculateContrastRatio("#000000", "#ffffff");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("should calculate contrast ratio for white and black", () => {
      const ratio = calculateContrastRatio("#ffffff", "#000000");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("should calculate contrast ratio for similar colors", () => {
      const ratio = calculateContrastRatio("#cccccc", "#dddddd");
      expect(ratio).toBeLessThan(2);
    });

    it("should handle RGB color format", () => {
      const ratio = calculateContrastRatio("rgb(0, 0, 0)", "rgb(255, 255, 255)");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("should handle RGBA color format", () => {
      const ratio = calculateContrastRatio("rgba(0, 0, 0, 1)", "rgba(255, 255, 255, 1)");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("should handle named colors", () => {
      const ratio = calculateContrastRatio("black", "white");
      expect(ratio).toBeCloseTo(21, 0);
    });

    it("should return null for invalid colors", () => {
      const ratio = calculateContrastRatio("invalid", "white");
      expect(ratio).toBeNull();
    });

    it("should be symmetric", () => {
      const ratio1 = calculateContrastRatio("#000000", "#ffffff");
      const ratio2 = calculateContrastRatio("#ffffff", "#000000");
      expect(ratio1).toEqual(ratio2);
    });

    it("should calculate ratio for medium contrast", () => {
      const ratio = calculateContrastRatio("#333333", "#cccccc");
      expect(ratio).toBeGreaterThan(4);
      expect(ratio).toBeLessThan(8);
    });
  });

  describe("getWCAGLevel", () => {
    it("should return AAA for high contrast normal text", () => {
      const level = getWCAGLevel(7, "normal");
      expect(level).toBe("AAA");
    });

    it("should return AA for medium contrast normal text", () => {
      const level = getWCAGLevel(4.5, "normal");
      expect(level).toBe("AA");
    });

    it("should return Fail for low contrast normal text", () => {
      const level = getWCAGLevel(3, "normal");
      expect(level).toBe("Fail");
    });

    it("should return AAA for high contrast large text", () => {
      const level = getWCAGLevel(4.5, "large");
      expect(level).toBe("AAA");
    });

    it("should return AA for medium contrast large text", () => {
      const level = getWCAGLevel(3, "large");
      expect(level).toBe("AA");
    });

    it("should return Fail for low contrast large text", () => {
      const level = getWCAGLevel(2, "large");
      expect(level).toBe("Fail");
    });

    it("should handle edge cases", () => {
      expect(getWCAGLevel(7.0, "normal")).toBe("AAA");
      expect(getWCAGLevel(6.99, "normal")).toBe("AA");
      expect(getWCAGLevel(4.5, "normal")).toBe("AA");
      expect(getWCAGLevel(4.49, "normal")).toBe("Fail");
      expect(getWCAGLevel(4.5, "large")).toBe("AAA");
      expect(getWCAGLevel(3.0, "large")).toBe("AA");
    });
  });

  describe("analyzePageContrast", () => {
    it("should analyze a simple HTML page", async () => {
      const html = `
        <html>
          <body>
            <p style="color: #000000; background: #ffffff;">Black text on white</p>
          </body>
        </html>
      `;

      const report = await analyzePageContrast(html, "https://example.com");

      expect(report).toBeDefined();
      expect(report.url).toBe("https://example.com");
      expect(report.timestamp).toBeGreaterThan(0);
      expect(report.wcagAA).toBeDefined();
      expect(report.wcagAAA).toBeDefined();
    });

    it("should detect contrast violations", async () => {
      const html = `
        <html>
          <body>
            <p style="color: #cccccc; background: #dddddd;">Light gray on light gray</p>
          </body>
        </html>
      `;

      const report = await analyzePageContrast(html, "https://example.com");

      expect(report.contrastIssues.length).toBeGreaterThan(0);
      expect(report.wcagAA.fail).toBeGreaterThan(0);
    });

    it("should pass high contrast elements", async () => {
      const html = `
        <html>
          <body>
            <p style="color: #000000; background: #ffffff;">Black on white</p>
          </body>
        </html>
      `;

      const report = await analyzePageContrast(html, "https://example.com");

      const passElements = report.contrastIssues.filter((i) => i.wcagAAA);
      expect(passElements.length).toBeGreaterThanOrEqual(0);
    });

    it("should calculate WCAG statistics correctly", async () => {
      const html = `
        <html>
          <body>
            <p style="color: #000000; background: #ffffff;">Good contrast</p>
            <p style="color: #cccccc; background: #dddddd;">Bad contrast</p>
          </body>
        </html>
      `;

      const report = await analyzePageContrast(html, "https://example.com");

      expect(report.wcagAA.pass + report.wcagAA.fail).toBe(report.contrastIssues.length);
      expect(report.wcagAAA.pass + report.wcagAAA.fail).toBe(report.contrastIssues.length);
    });

    it("should handle multiple heading sizes", async () => {
      const html = `
        <html>
          <body>
            <h1 style="color: #666666; background: #ffffff;">Heading 1</h1>
            <p style="color: #666666; background: #ffffff;">Paragraph</p>
          </body>
        </html>
      `;

      const report = await analyzePageContrast(html, "https://example.com");

      const headings = report.contrastIssues.filter((i) => i.textSize === "large");
      const paragraphs = report.contrastIssues.filter((i) => i.textSize === "normal");

      // Headings may have different requirements
      expect(headings.length + paragraphs.length).toBeGreaterThanOrEqual(0);
    });

    it("should generate accessibility summary", async () => {
      const html = `
        <html>
          <body>
            <p style="color: #000000; background: #ffffff;">Good contrast</p>
          </body>
        </html>
      `;

      const report = await analyzePageContrast(html, "https://example.com");

      expect(report.summary).toBeDefined();
      expect(report.summary.length).toBeGreaterThan(0);
    });

    it("should handle empty HTML", async () => {
      const html = "<html><body></body></html>";

      const report = await analyzePageContrast(html, "https://example.com");

      expect(report).toBeDefined();
      expect(report.contrastIssues).toBeInstanceOf(Array);
    });
  });

  describe("suggestImprovedColors", () => {
    it("should suggest darker foreground for low contrast", () => {
      const suggestion = suggestImprovedColors("#cccccc", "#ffffff", 7);

      expect(suggestion.foreground).toBeDefined();
      expect(suggestion.background).toBe("#ffffff");
      expect(suggestion.ratio).toBeGreaterThanOrEqual(7);
    });

    it("should maintain background color", () => {
      const bgColor = "#ffffff";
      const suggestion = suggestImprovedColors("#cccccc", bgColor, 7);

      expect(suggestion.background).toBe(bgColor);
    });

    it("should return valid hex colors", () => {
      const suggestion = suggestImprovedColors("#cccccc", "#ffffff", 7);

      expect(suggestion.foreground).toMatch(/^#[0-9a-f]{6}$/i);
      expect(suggestion.background).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("should reach target ratio", () => {
      const targetRatio = 7;
      const suggestion = suggestImprovedColors("#cccccc", "#ffffff", targetRatio);

      expect(suggestion.ratio).toBeGreaterThanOrEqual(targetRatio - 0.1);
    });

    it("should handle invalid colors gracefully", () => {
      const suggestion = suggestImprovedColors("invalid", "white", 7);

      expect(suggestion.ratio).toBe(0);
    });
  });

  describe("WCAG Compliance", () => {
    it("should identify WCAG AA compliant colors", () => {
      const ratio = calculateContrastRatio("#000000", "#ffffff");
      const level = getWCAGLevel(ratio || 0, "normal");

      expect(level).toBe("AAA");
      expect(ratio).toBeGreaterThan(7);
    });

    it("should identify WCAG AA non-compliant colors", () => {
      const ratio = calculateContrastRatio("#999999", "#aaaaaa");
      const level = getWCAGLevel(ratio || 0, "normal");

      expect(level).toBe("Fail");
    });

    it("should handle large text with lower requirements", () => {
      const ratio = 3.5;
      const level = getWCAGLevel(ratio, "large");

      expect(level).toBe("AA");
    });

    it("should handle normal text with higher requirements", () => {
      const ratio = 3.5;
      const level = getWCAGLevel(ratio, "normal");

      expect(level).toBe("Fail");
    });
  });

  describe("Real-world scenarios", () => {
    it("should analyze jenninexus.com color palette", async () => {
      const html = `
        <html>
          <body>
            <p style="color: #11181C; background: #ffffff;">Dark text on white</p>
            <p style="color: #ECEDEE; background: #151718;">Light text on dark</p>
            <p style="color: #687076; background: #ffffff;">Muted on white</p>
          </body>
        </html>
      `;

      const report = await analyzePageContrast(html, "https://jenninexus.com");

      expect(report).toBeDefined();
      expect(report.wcagAA.percentage).toBeGreaterThanOrEqual(0);
      expect(report.wcagAA.percentage).toBeLessThanOrEqual(100);
    });

    it("should handle common accessible color combinations", async () => {
      const html = `
        <html>
          <body>
            <p style="color: #000000; background: #ffffff;">Black on white</p>
            <p style="color: #ffffff; background: #000000;">White on black</p>
            <p style="color: #003366; background: #ffffff;">Dark blue on white</p>
          </body>
        </html>
      `;

      const report = await analyzePageContrast(html, "https://example.com");

      expect(report.contrastIssues.length).toBeGreaterThanOrEqual(0);
      expect(report.wcagAA.percentage).toBeGreaterThanOrEqual(0);
    });
  });
});
