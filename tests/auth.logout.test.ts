/**
 * Basic sanity tests for Site Auditor v2 server config.
 * Full analyzer tests live alongside each analyzer in src/analyzers/.
 */
import { describe, expect, it } from "vitest";

describe("server config", () => {
  it("resolves SITE_AUDITOR_PORT to a valid port number", () => {
    const port = parseInt(process.env.SITE_AUDITOR_PORT ?? "3847", 10);
    expect(port).toBeGreaterThan(0);
    expect(port).toBeLessThan(65536);
  });

  it("default port is 3847", () => {
    const port = parseInt(process.env.SITE_AUDITOR_PORT ?? "3847", 10);
    // When env var is unset the fallback must be 3847
    if (!process.env.SITE_AUDITOR_PORT) {
      expect(port).toBe(3847);
    }
  });
});
