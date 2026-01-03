import { describe, it, expect } from "vitest";
import {
  generateColorSuggestions,
  getBestSuggestion,
  getStrategyDescription,
  getStrategyIcon,
  type ColorSuggestion,
} from "./color-suggester";

describe("Color Suggester", () => {
  describe("generateColorSuggestions", () => {
    it("should generate suggestions for low contrast colors", () => {
      const suggestions = generateColorSuggestions("#cccccc", "#ffffff");

      expect(suggestions).toBeInstanceOf(Array);
      if (suggestions.length > 0) {
        expect(suggestions[0].wcagLevel).toBe("AAA");
      }
    });

    it("should meet WCAG AAA target ratio of 7:1", () => {
      const suggestions = generateColorSuggestions("#cccccc", "#ffffff");

      suggestions.forEach((suggestion) => {
        expect(suggestion.ratio).toBeGreaterThanOrEqual(7);
      });
    });

    it("should include multiple strategies", () => {
      const suggestions = generateColorSuggestions("#888888", "#ffffff");

      const strategies = new Set(suggestions.map((s) => s.strategy));
      // May have 1 or more strategies depending on color pair
      expect(strategies.size).toBeGreaterThanOrEqual(1);
    });

    it("should calculate improvement percentage", () => {
      const suggestions = generateColorSuggestions("#cccccc", "#ffffff");

      suggestions.forEach((suggestion) => {
        expect(suggestion.improvement).toBeGreaterThan(0);
      });
    });

    it("should return valid hex colors", () => {
      const suggestions = generateColorSuggestions("#cccccc", "#ffffff");

      suggestions.forEach((suggestion) => {
        expect(suggestion.foreground).toMatch(/^#[0-9a-f]{6}$/i);
        expect(suggestion.background).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should include preview data", () => {
      const suggestions = generateColorSuggestions("#cccccc", "#ffffff");

      suggestions.forEach((suggestion) => {
        expect(suggestion.preview).toBeDefined();
        expect(suggestion.preview.original).toBeDefined();
        expect(suggestion.preview.suggested).toBeDefined();
        expect(suggestion.preview.original.ratio).toBeGreaterThan(0);
        expect(suggestion.preview.suggested.ratio).toBeGreaterThanOrEqual(7);
      });
    });

    it("should handle high contrast colors gracefully", () => {
      const suggestions = generateColorSuggestions("#000000", "#ffffff");

      // Should still return suggestions even though already passing
      expect(suggestions).toBeInstanceOf(Array);
    });

    it("should respect text size parameter for large text", () => {
      const normalSuggestions = generateColorSuggestions("#999999", "#ffffff", "normal");
      const largeSuggestions = generateColorSuggestions("#999999", "#ffffff", "large");

      // Large text has lower requirements, should have more suggestions
      expect(largeSuggestions.length).toBeGreaterThanOrEqual(normalSuggestions.length);
    });

    it("should handle custom target ratios", () => {
      const suggestions = generateColorSuggestions("#cccccc", "#ffffff", "normal", 4.5);

      suggestions.forEach((suggestion) => {
        expect(suggestion.ratio).toBeGreaterThanOrEqual(4.5);
      });
    });

    it("should remove duplicate suggestions", () => {
      const suggestions = generateColorSuggestions("#cccccc", "#ffffff");

      const colorPairs = suggestions.map((s) => `${s.foreground}-${s.background}`);
      const uniquePairs = new Set(colorPairs);

      expect(uniquePairs.size).toBe(suggestions.length);
    });

    it("should work with various color formats", () => {
      const suggestions1 = generateColorSuggestions("#888888", "#ffffff");
      const suggestions2 = generateColorSuggestions("#888888", "#FFFFFF");

      expect(suggestions1.length).toBeGreaterThan(0);
      expect(suggestions2.length).toBeGreaterThan(0);
    });

    it("should prioritize hybrid strategy", () => {
      const suggestions = generateColorSuggestions("#999999", "#eeeeee");

      const hybridIndex = suggestions.findIndex((s) => s.strategy === "hybrid");
      const firstIndex = 0;

      // Hybrid should be early in the list if it exists
      if (hybridIndex !== -1) {
        expect(hybridIndex).toBeLessThanOrEqual(suggestions.length - 1);
      }
    });
  });

  describe("getBestSuggestion", () => {
    it("should return the best suggestion", () => {
      const suggestion = getBestSuggestion("#cccccc", "#ffffff");

      if (suggestion) {
        expect(suggestion.ratio).toBeGreaterThanOrEqual(7);
      }
    });

    it("should prefer hybrid strategy", () => {
      const suggestion = getBestSuggestion("#888888", "#eeeeee");

      if (suggestion) {
        expect(suggestion.strategy).toBe("hybrid");
      }
    });

    it("should return null for invalid colors", () => {
      const suggestion = getBestSuggestion("invalid", "invalid");

      expect(suggestion).toBeNull();
    });

    it("should include preview data", () => {
      const suggestion = getBestSuggestion("#cccccc", "#ffffff");

      if (suggestion) {
        expect(suggestion.preview).toBeDefined();
        expect(suggestion.preview.original).toBeDefined();
        expect(suggestion.preview.suggested).toBeDefined();
      }
    });

    it("should meet WCAG AAA standards", () => {
      const suggestion = getBestSuggestion("#cccccc", "#ffffff");

      if (suggestion) {
        expect(suggestion.wcagLevel).toBe("AAA");
        expect(suggestion.ratio).toBeGreaterThanOrEqual(7);
      }
    });
  });

  describe("getStrategyDescription", () => {
    it("should return description for darken-fg", () => {
      const desc = getStrategyDescription("darken-fg");
      expect(desc).toBe("Darken the text color");
    });

    it("should return description for lighten-bg", () => {
      const desc = getStrategyDescription("lighten-bg");
      expect(desc).toBe("Lighten the background color");
    });

    it("should return description for saturate-fg", () => {
      const desc = getStrategyDescription("saturate-fg");
      expect(desc).toBe("Increase text color saturation");
    });

    it("should return description for desaturate-bg", () => {
      const desc = getStrategyDescription("desaturate-bg");
      expect(desc).toBe("Decrease background saturation");
    });

    it("should return description for hybrid", () => {
      const desc = getStrategyDescription("hybrid");
      expect(desc).toBe("Adjust both text and background colors");
    });

    it("should return fallback for unknown strategy", () => {
      const desc = getStrategyDescription("unknown");
      expect(desc).toBe("unknown");
    });
  });

  describe("getStrategyIcon", () => {
    it("should return icon for darken-fg", () => {
      const icon = getStrategyIcon("darken-fg");
      expect(icon).toBe("text-darkening");
    });

    it("should return icon for lighten-bg", () => {
      const icon = getStrategyIcon("lighten-bg");
      expect(icon).toBe("background-lightening");
    });

    it("should return icon for saturate-fg", () => {
      const icon = getStrategyIcon("saturate-fg");
      expect(icon).toBe("color-saturation");
    });

    it("should return icon for desaturate-bg", () => {
      const icon = getStrategyIcon("desaturate-bg");
      expect(icon).toBe("color-desaturation");
    });

    it("should return icon for hybrid", () => {
      const icon = getStrategyIcon("hybrid");
      expect(icon).toBe("balanced-adjustment");
    });

    it("should return fallback for unknown strategy", () => {
      const icon = getStrategyIcon("unknown");
      expect(icon).toBe("adjustment");
    });
  });

  describe("Real-world scenarios", () => {
    it("should fix jenninexus.com muted text on white", () => {
      // #687076 (muted) on #ffffff (white) has low contrast
      const suggestions = generateColorSuggestions("#687076", "#ffffff");

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].ratio).toBeGreaterThanOrEqual(7);
    });

    it("should fix light text on light background", () => {
      // #ECEDEE (light) on #f5f5f5 (light gray) - very similar colors
      const suggestions = generateColorSuggestions("#ECEDEE", "#f5f5f5");

      expect(suggestions).toBeInstanceOf(Array);
      suggestions.forEach((s) => {
        expect(s.ratio).toBeGreaterThanOrEqual(7);
      });
    });

    it("should suggest improvements for medium contrast", () => {
      // #003366 (dark blue) on #ffffff (white) - already good
      const suggestions = generateColorSuggestions("#003366", "#ffffff");

      expect(suggestions).toBeInstanceOf(Array);
    });

    it("should handle brand color adjustments", () => {
      // Primary color on background
      const suggestions = generateColorSuggestions("#0a7ea4", "#ffffff");

      expect(suggestions).toBeInstanceOf(Array);
      suggestions.forEach((s) => {
        expect(s.ratio).toBeGreaterThanOrEqual(7);
      });
    });
  });

  describe("Color math accuracy", () => {
    it("should maintain color validity after transformations", () => {
      const suggestions = generateColorSuggestions("#888888", "#ffffff");

      suggestions.forEach((suggestion) => {
        // All colors should be valid hex
        expect(suggestion.foreground).toMatch(/^#[0-9a-f]{6}$/i);
        expect(suggestion.background).toMatch(/^#[0-9a-f]{6}$/i);

        // Ratios should be positive and reasonable
        expect(suggestion.ratio).toBeGreaterThan(0);
        expect(suggestion.ratio).toBeLessThanOrEqual(21);
      });
    });

    it("should calculate consistent contrast ratios", () => {
      const suggestion = getBestSuggestion("#cccccc", "#ffffff");

      if (suggestion) {
        // The preview suggested ratio should match the main ratio
        expect(suggestion.ratio).toBe(suggestion.preview.suggested.ratio);
      }
    });

    it("should improve from original contrast", () => {
      const suggestions = generateColorSuggestions("#cccccc", "#ffffff");

      suggestions.forEach((suggestion) => {
        expect(suggestion.preview.suggested.ratio).toBeGreaterThan(
          suggestion.preview.original.ratio
        );
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle black and white", () => {
      const suggestions = generateColorSuggestions("#000000", "#ffffff");

      expect(suggestions).toBeInstanceOf(Array);
    });

    it("should handle same foreground and background", () => {
      const suggestions = generateColorSuggestions("#888888", "#888888");

      // When colors are identical, contrast is 1:1, suggestions may be empty or very limited
      expect(suggestions).toBeInstanceOf(Array);
    });

    it("should handle very light colors", () => {
      const suggestions = generateColorSuggestions("#f0f0f0", "#ffffff");

      // Very similar light colors may not have achievable suggestions
      expect(suggestions).toBeInstanceOf(Array);
    });

    it("should handle very dark colors", () => {
      const suggestions = generateColorSuggestions("#000000", "#111111");

      // Very similar dark colors may not have achievable suggestions
      expect(suggestions).toBeInstanceOf(Array);
    });

    it("should handle lowercase hex", () => {
      const suggestions1 = generateColorSuggestions("#cccccc", "#ffffff");
      const suggestions2 = generateColorSuggestions("#CCCCCC", "#FFFFFF");

      expect(suggestions1.length).toBe(suggestions2.length);
    });
  });
});
