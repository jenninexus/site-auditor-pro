import { describe, it, expect } from "vitest";
import {
  hexToHSL,
  hslToHex,
  getComplementary,
  getAnalogous,
  getTriadic,
  getSplitComplementary,
  getTetradic,
  getAllHarmony,
  findClosestBrandColor,
  getBrandAwareHarmony,
  extractBrandPalette,
  areHarmonious,
  getMonochromatic,
  type BrandPalette,
} from "./color-harmony";

describe("Color Harmony", () => {
  describe("hexToHSL", () => {
    it("should convert red to HSL", () => {
      const hsl = hexToHSL("#FF0000");
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it("should convert green to HSL", () => {
      const hsl = hexToHSL("#00FF00");
      expect(hsl.h).toBe(120);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it("should convert blue to HSL", () => {
      const hsl = hexToHSL("#0000FF");
      expect(hsl.h).toBe(240);
      expect(hsl.s).toBe(100);
      expect(hsl.l).toBe(50);
    });

    it("should convert white to HSL", () => {
      const hsl = hexToHSL("#FFFFFF");
      expect(hsl.l).toBe(100);
    });

    it("should convert black to HSL", () => {
      const hsl = hexToHSL("#000000");
      expect(hsl.l).toBe(0);
    });

    it("should handle lowercase hex", () => {
      const hsl1 = hexToHSL("#ff0000");
      const hsl2 = hexToHSL("#FF0000");
      expect(hsl1).toEqual(hsl2);
    });
  });

  describe("hslToHex", () => {
    it("should convert HSL red back to hex", () => {
      const hex = hslToHex({ h: 0, s: 100, l: 50 });
      expect(hex.toUpperCase()).toBe("#FF0000");
    });

    it("should convert HSL green back to hex", () => {
      const hex = hslToHex({ h: 120, s: 100, l: 50 });
      expect(hex.toUpperCase()).toBe("#00FF00");
    });

    it("should convert HSL blue back to hex", () => {
      const hex = hslToHex({ h: 240, s: 100, l: 50 });
      expect(hex.toUpperCase()).toBe("#0000FF");
    });

    it("should round-trip hex colors", () => {
      const original = "#3B82F6";
      const hsl = hexToHSL(original);
      const result = hslToHex(hsl);
      const resultHSL = hexToHSL(result);

      expect(Math.abs(hsl.h - resultHSL.h)).toBeLessThan(2);
      expect(Math.abs(hsl.s - resultHSL.s)).toBeLessThan(2);
      expect(Math.abs(hsl.l - resultHSL.l)).toBeLessThan(2);
    });
  });

  describe("getComplementary", () => {
    it("should return complementary color 180 degrees away", () => {
      const comp = getComplementary("#FF0000");
      expect(comp.harmony).toBe("complementary");
      expect(comp.distance).toBe(180);
    });

    it("should return valid hex color", () => {
      const comp = getComplementary("#3B82F6");
      expect(comp.hex).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("should have correct name", () => {
      const comp = getComplementary("#FF0000");
      expect(comp.name).toBe("Complementary");
    });
  });

  describe("getAnalogous", () => {
    it("should return two analogous colors", () => {
      const analogous = getAnalogous("#FF0000");
      expect(analogous).toHaveLength(2);
    });

    it("should return colors 30 degrees apart", () => {
      const analogous = getAnalogous("#FF0000");
      expect(analogous[0].distance).toBe(-30);
      expect(analogous[1].distance).toBe(30);
    });

    it("should mark as analogous harmony", () => {
      const analogous = getAnalogous("#FF0000");
      analogous.forEach((color) => {
        expect(color.harmony).toBe("analogous");
      });
    });
  });

  describe("getTriadic", () => {
    it("should return two triadic colors", () => {
      const triadic = getTriadic("#FF0000");
      expect(triadic).toHaveLength(2);
    });

    it("should return colors 120 degrees apart", () => {
      const triadic = getTriadic("#FF0000");
      expect(triadic[0].distance).toBe(120);
      expect(triadic[1].distance).toBe(240);
    });

    it("should mark as triadic harmony", () => {
      const triadic = getTriadic("#FF0000");
      triadic.forEach((color) => {
        expect(color.harmony).toBe("triadic");
      });
    });
  });

  describe("getSplitComplementary", () => {
    it("should return two split-complementary colors", () => {
      const split = getSplitComplementary("#FF0000");
      expect(split).toHaveLength(2);
    });

    it("should return colors 150 and 210 degrees away", () => {
      const split = getSplitComplementary("#FF0000");
      expect(split[0].distance).toBe(150);
      expect(split[1].distance).toBe(210);
    });
  });

  describe("getTetradic", () => {
    it("should return three tetradic colors", () => {
      const tetradic = getTetradic("#FF0000");
      expect(tetradic).toHaveLength(3);
    });

    it("should return colors 90, 180, 270 degrees away", () => {
      const tetradic = getTetradic("#FF0000");
      expect(tetradic[0].distance).toBe(90);
      expect(tetradic[1].distance).toBe(180);
      expect(tetradic[2].distance).toBe(270);
    });
  });

  describe("getAllHarmony", () => {
    it("should return all harmony colors", () => {
      const all = getAllHarmony("#FF0000");
      expect(all.length).toBeGreaterThan(5);
    });

    it("should include all harmony types", () => {
      const all = getAllHarmony("#FF0000");
      const types = new Set(all.map((c) => c.harmony));

      expect(types.has("complementary")).toBe(true);
      expect(types.has("analogous")).toBe(true);
      expect(types.has("triadic")).toBe(true);
      expect(types.has("split-complementary")).toBe(true);
      expect(types.has("tetradic")).toBe(true);
    });

    it("should return valid hex colors", () => {
      const all = getAllHarmony("#3B82F6");
      all.forEach((color) => {
        expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe("findClosestBrandColor", () => {
    const brandPalette: BrandPalette = {
      primary: "#0a7ea4",
      secondary: "#687076",
      accent: "#10B981",
      neutral: "#f5f5f5",
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#EF4444",
    };

    it("should find exact match in palette", () => {
      const closest = findClosestBrandColor("#0a7ea4", brandPalette);
      expect(closest.name).toBe("primary");
      expect(closest.distance).toBe(0);
    });

    it("should find closest color to similar hue", () => {
      const closest = findClosestBrandColor("#0b8eb4", brandPalette);
      expect(closest.name).toBe("primary");
      expect(closest.distance).toBeLessThan(10);
    });

    it("should return distance metric", () => {
      const closest = findClosestBrandColor("#FF0000", brandPalette);
      expect(closest.distance).toBeGreaterThan(0);
    });
  });

  describe("getBrandAwareHarmony", () => {
    const brandPalette: BrandPalette = {
      primary: "#0a7ea4",
      secondary: "#687076",
      accent: "#10B981",
      neutral: "#f5f5f5",
      success: "#22C55E",
      warning: "#F59E0B",
      error: "#EF4444",
    };

    it("should return harmony suggestions", () => {
      const suggestions = getBrandAwareHarmony("#0a7ea4", brandPalette);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it("should include brand flag", () => {
      const suggestions = getBrandAwareHarmony("#0a7ea4", brandPalette);
      suggestions.forEach((suggestion) => {
        expect(suggestion).toHaveProperty("fromBrand");
      });
    });

    it("should return valid hex colors", () => {
      const suggestions = getBrandAwareHarmony("#0a7ea4", brandPalette);
      suggestions.forEach((suggestion) => {
        expect(suggestion.color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe("extractBrandPalette", () => {
    it("should extract palette from color array", () => {
      const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF"];
      const palette = extractBrandPalette(colors);

      expect(palette.primary).toBe("#FF0000");
      expect(palette.secondary).toBe("#00FF00");
      expect(palette.accent).toBe("#0000FF");
    });

    it("should return default palette for empty array", () => {
      const palette = extractBrandPalette([]);

      expect(palette.primary).toBe("#0a7ea4");
      expect(palette.secondary).toBe("#687076");
    });

    it("should handle duplicate colors", () => {
      const colors = ["#FF0000", "#FF0000", "#00FF00"];
      const palette = extractBrandPalette(colors);

      expect(palette.primary).toBe("#FF0000");
      expect(palette.secondary).toBe("#00FF00");
    });
  });

  describe("areHarmonious", () => {
    it("should recognize complementary colors as harmonious", () => {
      const comp = getComplementary("#FF0000");
      expect(areHarmonious("#FF0000", comp.hex)).toBe(true);
    });

    it("should recognize analogous colors as harmonious", () => {
      const analogous = getAnalogous("#FF0000");
      expect(areHarmonious("#FF0000", analogous[0].hex)).toBe(true);
    });

    it("should recognize triadic colors as harmonious", () => {
      const triadic = getTriadic("#FF0000");
      expect(areHarmonious("#FF0000", triadic[0].hex)).toBe(true);
    });

    it("should recognize random colors as not harmonious", () => {
      // Colors that are 45 degrees apart are not harmonious (strict tolerance)
      expect(areHarmonious("#FF0000", "#FFB300", 5)).toBe(false);
    });

    it("should recognize identical colors as harmonious", () => {
      expect(areHarmonious("#FF0000", "#FF0000")).toBe(true);
    });
  });

  describe("getMonochromatic", () => {
    it("should return monochromatic palette", () => {
      const mono = getMonochromatic("#0a7ea4", 5);
      expect(mono).toHaveLength(5);
    });

    it("should vary lightness", () => {
      const mono = getMonochromatic("#0a7ea4", 5);
      const lightnesses = mono.map((c) => c.hsl.l);

      // Should have different lightness values
      const unique = new Set(lightnesses);
      expect(unique.size).toBeGreaterThan(1);
    });

    it("should keep hue constant", () => {
      const mono = getMonochromatic("#0a7ea4", 5);
      const hues = mono.map((c) => c.hsl.h);

      // All should have same hue
      hues.forEach((hue) => {
        expect(Math.abs(hue - hues[0])).toBeLessThan(2);
      });
    });

    it("should return valid hex colors", () => {
      const mono = getMonochromatic("#0a7ea4", 5);
      mono.forEach((color) => {
        expect(color.hex).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe("Real-world scenarios", () => {
    it("should work with jenninexus.com brand colors", () => {
      const brandColors = ["#0a7ea4", "#687076", "#f5f5f5"];
      const palette = extractBrandPalette(brandColors);

      expect(palette.primary).toBe("#0a7ea4");
      expect(palette.secondary).toBe("#687076");
    });

    it("should suggest harmonious alternatives for primary color", () => {
      const suggestions = getAllHarmony("#0a7ea4");
      expect(suggestions.length).toBeGreaterThan(5);

      suggestions.forEach((suggestion) => {
        expect(suggestion.hex).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should find brand-aware suggestions", () => {
      const brandPalette: BrandPalette = {
        primary: "#0a7ea4",
        secondary: "#687076",
        accent: "#10B981",
        neutral: "#f5f5f5",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
      };

      const suggestions = getBrandAwareHarmony("#0a7ea4", brandPalette);
      expect(suggestions.length).toBeGreaterThan(0);

      // Should have mix of brand and non-brand colors
      const hasBrand = suggestions.some((s) => s.fromBrand);
      expect(hasBrand).toBe(true);
    });
  });
});
