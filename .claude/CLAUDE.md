# site-auditor — Web Auditing Platform

## Project Identity

- **What it is:** Accessibility, SEO, security and performance auditing tool for websites
- **Stack:** TypeScript/Express (ESM), Node.js ≥ 18, `src/`, HTML dashboard + pitch page
- **Port:** `$SITE_AUDITOR_PORT` (default 3847) — set via env var or `.env`
- **Entry:** `src/server.ts` — run directly with `tsx` (no compile step for dev)
- **Agent ID:** `site-auditor` — see `C:\pc-network\.claude\skills-registry.yaml → project_skills`
- **GitHub:** `jenninexus/site-auditor-pro` *(repo rename to `site-auditor` pending)*

## Dev Commands

```powershell
npm run dev      # tsx watch src/server.ts — hot-reload dev server
npm start        # tsx src/server.ts — one-shot start (same as start.bat)
npm run build    # tsc — compile to js (only needed for prod deploy check)
npm test         # vitest run — run all tests
npm run check    # tsc --noEmit — type-check only
```

> **Note on `/install <plugin>`:** This is a Claude Code **chat command** — type it in the
> Claude Code message box, not in a PowerShell terminal. PowerShell will reject it.
> Alternatively: add the plugin name to `C:\Users\Owner\.claude\settings.json → enabledPlugins`
> then restart Claude Code.

## Routes

```
GET  /              → src/dashboard.html  (main audit UI)
GET  /pitch         → src/pitch.html      (marketing pitch page)
GET  /api           → API index + capabilities
GET  /api/health    → uptime, version, server info
POST /api/audit     → runs full audit (body: { url: string })
POST /api/export/csv|json  → export last audit results
```

## Key Directories

```
src/
  server.ts          Express server — routes, rate limiter, static serving
  dashboard.html     Main audit UI (inline CSS + JS)
  pitch.html         Marketing pitch page (served at /pitch)
  analyzers/
    audit-engine.ts  Orchestrates all analyzers, aggregates scores
    accessibility.ts a11y — contrast, ARIA, keyboard nav
    seo.ts           SEO — meta, headings, structured data
    security.ts      Security headers, CSP, HTTPS checks
    performance.ts   Load hints, asset optimization signals
  utils/             Shared helpers (DOM, fetch, scoring)
storage/             Gitignored — local audit results, caches
tests/               Vitest tests (150+ tests)
```

## Plugins & Skills

### Installed (from knowledge-work-plugins marketplace)

| Plugin                                      | Use For                                     |
| ------------------------------------------- | ------------------------------------------- |
| `engineering@knowledge-work-plugins`        | TS patterns, Express, API design            |
| `enterprise-search@knowledge-work-plugins`  | SEO analysis, search engine behavior        |
| `data@knowledge-work-plugins`               | Audit scoring logic, aggregation patterns   |
| `marketing@knowledge-work-plugins`          | SEO recommendations, content audit features |
| `product-management@knowledge-work-plugins` | Feature roadmap, audit report UX            |

### Installed (claude-plugins-official)

| Plugin            | Use For                                      |
| ----------------- | -------------------------------------------- |
| `playground`      | Build interactive audit result explorers     |
| `superpowers`     | TDD, debugging, subagent-driven feature work |
| `frontend-design` | Dashboard and pitch page UI                  |
| `feature-dev`     | Full feature dev workflow                    |

### Pending install (type in Claude Code chat — NOT terminal)

| Plugin      | Install              | Use For                                       |
| ----------- | -------------------- | --------------------------------------------- |
| `firecrawl` | `/install firecrawl` | Crawl audit target URLs for pre-audit context |
| `postman`   | `/install postman`   | Publish REST API docs on Postman Network      |
| `railway`   | `/install railway`   | Deploy to production Railway (~$5-7/mo)       |

> Full plugin registry: `C:\pc-network\.claude\plugins.yaml`

### Skills (invoke in Claude Code chat)

- `/frontend-design` — Dashboard and audit report UI
- `/feature-dev` — Full feature dev workflow
- `/superpowers:systematic-debugging` — Debug analyzer edge cases
- `/superpowers:test-driven-development` — Before writing new analyzers
- `/docs` — Browse `storage/docs/` (PITCH_DECK.md, SITE-AUDITOR-PLAN.md)

## Architecture Notes

- Each analyzer in `src/analyzers/` handles one audit domain → returns typed result object
- `audit-engine.ts` calls all analyzers, aggregates into 0–100 score per category + overall
- Results are scored 0–100 and aggregated into an overall site score
- Rate limiter: 10 audits/min per IP (in-memory, resets on restart)
- Pitch page `src/pitch.html` is the standalone marketing page served at `/pitch`

## Key Docs

- `storage/docs/PITCH_DECK.md` — Product pitch, roadmap, competitive analysis
- `storage/docs/SITE-AUDITOR-PLAN.md` — Architecture, running it, next steps
- `C:\Github\optional-features\docs\SITE-AUDITOR.md` — Panel adapter contract (Synabrain integration)
- `C:\mcp\.config\mcp_claude.json` — Shared Claude config reference (skills, plugins, agents)
- `C:\pc-network\.claude\plugins.yaml` — Plugin registry (installed + pending)
- `C:\mcp\.config\mcp_portmap.json → node_services.3847` — Port assignment

## Rules

- Run `npm run dev` for development — no compile step needed (`tsx` handles TS directly)
- `storage/` is gitignored — audit results stay local
- `$SITE_AUDITOR_PORT` env var controls port; falls back to 3847
- No absolute paths — always use `import.meta.url` + `fileURLToPath` for `__dirname`
- Branch: `main` (no personal branch for this repo)
