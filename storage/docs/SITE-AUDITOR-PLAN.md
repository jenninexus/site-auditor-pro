# Site Auditor Pro — Syna Workspace Overview

> **Cross-reference:** Full docs live in `C:\Github\site-auditor-pro\storage\docs\`
> **Type:** Standalone app + optional feature panel (adapter-first)
> **Stack:** Node.js / TypeScript / Express
> **Port:** `$SITE_AUDITOR_PORT` (see `C:\mcp\.config\mcp_portmap.json`)
> **Optional-features node:** `site-auditor` — `C:\Github\optional-features\docs\SITE-AUDITOR.md`
> **Status:** v2.0 redesign in progress (March 2026)

---

## What It Is

Site Auditor Pro is a developer utility: paste a URL, get a scored accessibility/SEO/security/performance report. It runs as a single Express server that serves both an HTML dashboard and a REST API.

It follows the same **standalone-first, adapter-second** pattern as fin-sig — run the app on its own, or embed it as a panel inside Synabrain/Synagen.

## How It Compares to fin-sig

|            | **site-auditor**       | **fin-sig**         |
| ---------- | ---------------------- | ------------------- |
| Language   | TypeScript / Node.js   | Python / FastAPI    |
| Model      | Stateless, on-demand   | Stateful pipeline   |
| Panel type | POST URL → result      | Iframe to live data |
| Port       | `$SITE_AUDITOR_PORT`   | `$FINSIG_API_PORT`  |
| History    | Host-side localStorage | EDGAR accumulation  |

Both apps have: a pitch page (`GET /pitch`), CSV export, a standalone dashboard, and an adapter model for Synabrain/Synagen panels.

## v2.0 Redesign (March 2026)

- **New analyzers:** SEO (meta tags, canonical, OG), security (CSP, HTTPS, cookies), performance (payload, render-blocking) in addition to existing accessibility
- **Pitch page:** `GET /pitch` — self-contained marketing HTML page served by the app
- **Optional-features integration:** `ENABLE_SITE_AUDITOR` panel for Synabrain/Synagen

## Key Files

| What                       | Where                                                            |
| -------------------------- | ---------------------------------------------------------------- |
| Server entry               | `src/server.ts`                                                  |
| Dashboard UI               | `src/dashboard.html`                                             |
| Pitch page                 | `src/pitch.html`                                                 |
| Pitch deck                 | `storage/docs/PITCH_DECK.md`                                     |
| Archived spec              | `storage/docs/archive/specs/2026-03-14-site-auditor-redesign.md` |
| Archived task list         | `storage/docs/archive/todo.md`                                   |
| Optional-features contract | `C:\Github\optional-features\docs\SITE-AUDITOR.md`               |

## Running It

```powershell
cd C:\Github\site-auditor-pro
npm install
npm run dev        # tsx watch src/server.ts

# Default: http://localhost:3847
# Pitch:   http://localhost:3847/pitch
# API:     http://localhost:3847/api
```

## Next Steps (v2.0)

1. Build SEO, security, performance analyzers (`src/analyzers/`)
2. Expand dashboard to 4-panel score grid
3. Wire Synabrain `ENABLE_SITE_AUDITOR` panel (see checklist in optional-features doc)
4. Ship pitch page fully styled and linked from dashboard footer
