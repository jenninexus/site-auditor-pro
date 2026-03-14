/**
 * Site Auditor — Express Server
 * Standalone server: serves dashboard + API endpoints
 * No CORS proxy needed — server fetches URLs directly
 */

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { runFullAudit } from "./analyzers/audit-engine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = parseInt(process.env.SITE_AUDITOR_PORT || "3847", 10);
const startTime = Date.now();

app.use(express.json());

// ── Simple Rate Limiter (no extra deps) ──────────────────
const auditRateMap = new Map<string, number[]>();
const RATE_WINDOW = 60_000; // 1 minute
const RATE_LIMIT = 10; // max audits per window per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = auditRateMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  auditRateMap.set(ip, recent);
  return true;
}

// Clean up rate map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of auditRateMap) {
    const recent = timestamps.filter((t) => now - t < RATE_WINDOW);
    if (recent.length === 0) auditRateMap.delete(ip);
    else auditRateMap.set(ip, recent);
  }
}, 5 * 60_000);

// ── Dashboard ────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.sendFile(join(__dirname, "dashboard.html"));
});

app.get("/dashboard", (_req, res) => {
  res.sendFile(join(__dirname, "dashboard.html"));
});

// ── Pitch Page ───────────────────────────────────────────
app.get("/pitch", (_req, res) => {
  res.sendFile(join(__dirname, "pitch.html"));
});

// ── API Index ────────────────────────────────────────────
app.get("/api", (_req, res) => {
  res.json({
    name: "Site Auditor API",
    version: "2.0.0",
    endpoints: {
      "GET  /api/health": "Server status and uptime",
      "POST /api/audit": "Audit a website — body: { url: string }",
      "POST /api/export/csv":
        "Export audit as CSV — body: { data: AuditResult }",
      "POST /api/export/json":
        "Export audit as JSON — body: { data: AuditResult }",
    },
    dashboard: "/",
    pitch: "/pitch",
  });
});

// ── Health ───────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    version: "2.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    port: PORT,
  });
});

// ── Audit ────────────────────────────────────────────────
app.post("/api/audit", async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(clientIp)) {
    res
      .status(429)
      .json({ error: "Too many requests. Try again in a minute." });
    return;
  }

  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing or invalid 'url' field" });
    return;
  }

  try {
    const result = await runFullAudit(url.trim());
    res.json(result);
  } catch (err: any) {
    console.error(`Audit failed for ${url}:`, err.message);
    res.status(502).json({ error: `Audit failed: ${err.message}` });
  }
});

// ── Export CSV ───────────────────────────────────────────
app.post("/api/export/csv", (req, res) => {
  const { data } = req.body;
  if (!data) {
    res.status(400).json({ error: "No audit data provided" });
    return;
  }

  const rows: string[] = [];
  rows.push(
    "Category,Severity,Title,Description,Recommendation,Difficulty,Impact",
  );

  const issues = data.issues || [];
  for (const issue of issues) {
    const row = [
      issue.category,
      issue.severity,
      `"${(issue.title || "").replace(/"/g, '""')}"`,
      `"${(issue.description || "").replace(/"/g, '""')}"`,
      `"${(issue.recommendation || "").replace(/"/g, '""')}"`,
      issue.difficulty || "",
      issue.impact || "",
    ].join(",");
    rows.push(row);
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="site-audit-${Date.now()}.csv"`,
  );
  res.send(rows.join("\n"));
});

// ── Export JSON ──────────────────────────────────────────
app.post("/api/export/json", (req, res) => {
  const { data } = req.body;
  if (!data) {
    res.status(400).json({ error: "No audit data provided" });
    return;
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="site-audit-${Date.now()}.json"`,
  );
  res.json(data);
});

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ┌─────────────────────────────────────┐`);
  console.log(`  │  site auditor  v2.0.0               │`);
  console.log(`  │  http://localhost:${PORT}              │`);
  console.log(`  │  API: http://localhost:${PORT}/api     │`);
  console.log(`  └─────────────────────────────────────┘\n`);
});
