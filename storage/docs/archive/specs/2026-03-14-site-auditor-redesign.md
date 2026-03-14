# Site Auditor — Full Redesign Spec

**Date:** 2026-03-14
**Status:** Approved (user said "go ahead")

## Summary

Redesign Site Auditor Pro → **Site Auditor**: standalone Node.js Express server + single-file HTML dashboard. Same fin-sig architecture pattern. Keep all core analysis algorithms (150+ tests), delete Expo/React Native framework, add 3 new audit categories.

## Architecture

```
Express server (port 3847) → serves dashboard.html at GET /
                            → API routes at /api/*
                            → server-side URL fetching (no CORS proxy needed)
```

**Why Node.js, not Python?** Core analysis code is already TypeScript with 150+ passing tests. Rewriting in Python loses validated business logic.

## Target Structure

```
src/
├── server.ts              # Express entry, serves dashboard + API
├── analyzers/
│   ├── audit-engine.ts    # Orchestrator (adapted from lib/)
│   ├── contrast.ts        # WCAG contrast (from lib/)
│   ├── css.ts             # CSS consistency (from lib/)
│   ├── javascript.ts      # JS quality (from lib/)
│   ├── seo.ts             # NEW: SEO audit
│   ├── security.ts        # NEW: Security headers
│   └── performance.ts     # NEW: Performance hints
├── utils/
│   ├── color.ts           # Color utilities (from lib/)
│   └── scoring.ts         # Score calculation
└── dashboard.html         # Single-file embedded dashboard (Syna design tokens)
tests/                     # Vitest tests (keep existing + new)
package.json               # ~6 dependencies (was 68)
tsconfig.json
start.bat / start.sh
```

## New Features (Easy Wins)

### 1. SEO Audit

- `<title>` presence + length (50-60 chars ideal)
- `<meta description>` presence + length (150-160 chars)
- Heading hierarchy (single H1, proper nesting)
- Image alt text coverage
- Open Graph tags (og:title, og:description, og:image)
- Canonical URL
- Robots meta / robots.txt hints
- Structured data detection (JSON-LD, microdata)

### 2. Security Headers Audit

- Content-Security-Policy
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- HTTPS enforcement

### 3. Performance Audit (Enhanced)

- Total page weight (HTML + inline CSS/JS)
- Asset count and fragmentation
- Render-blocking resource detection
- Image optimization hints (size, format, lazy loading)
- Compression detection (Content-Encoding)
- Cache header analysis

## API Contract

### POST /api/audit

```json
Request:  { "url": "https://example.com" }
Response: {
  "url": "https://example.com",
  "timestamp": 1710000000000,
  "scores": {
    "overall": 78,
    "css": 85,
    "javascript": 90,
    "accessibility": 72,
    "seo": 65,
    "security": 80,
    "performance": 70
  },
  "issues": [...],
  "accessibility": { "lightMode": {...}, "darkMode": {...} },
  "seo": { "title": {...}, "meta": {...}, ... },
  "security": { "headers": {...} },
  "summary": { "total": 12, "critical": 2, "warning": 5, "info": 5 }
}
```

### GET /api/health

```json
{ "status": "ok", "version": "2.0.0", "uptime": 12345 }
```

### GET /api/export/csv?url=...

Returns CSV of latest audit results.

## Design System

**Based on Syna Design Tokens + fin-sig patterns:**

- Background: `#06060d` → `#0d0d18` → `#111120` (3-tier depth)
- Accent: `#b4a8ff` (purple) + `#4de8ff` (cyan)
- Text: `#f0eff8` (primary), `#cbc8de` (secondary), `#8e8aaa` (tertiary)
- Glass: `backdrop-filter: blur(18px)`, `rgba(6,6,13,0.7)` panels
- Typography: Outfit (display/body) + Space Mono (mono/data)
- Radius: 18px (panels), 12px (cards), 8px (buttons)
- Shadows: panel + lift + glow (3 tiers)
- Motion: snappy (0.15s), bouncy (0.25s), gentle (0.4s)
- Status: `#5ee89c` (pass), `#fcd34d` (warning), `#ff9494` (fail)

## Dashboard Layout

```
┌─────────────────────────────────────────────┐
│  Hero: "site auditor" + tagline + status    │
├─────────────────────────────────────────────┤
│  URL Input Bar + [Audit] Button             │
├──────────────────────┬──────────────────────┤
│  Overall Score       │  Category Scores     │
│  (big animated ring) │  (6 mini gauges)     │
├──────────────────────┴──────────────────────┤
│  Filter Bar: All | Critical | Warning | ... │
├─────────────────────────────────────────────┤
│  Issues List (expandable cards)             │
│  └─ Each: severity badge, title, desc,     │
│     recommendation, effort tag              │
├─────────────────────────────────────────────┤
│  Recent Audits (localStorage history)       │
├─────────────────────────────────────────────┤
│  Footer: version, API docs link, export     │
└─────────────────────────────────────────────┘
```

## Pitch Deck Page (`/pitch`)

A second route served by the same Express process — a self-contained marketing/pitch page showing what the tool does, who it's for, and how it compares with competitor tools. Linked from the main dashboard footer.

### Route

```
GET /pitch    → serves pitch.html (standalone page, same design tokens)
```

### Page Structure

```
┌─────────────────────────────────────────────┐
│  Hero: logo + "Site Auditor" + tagline      │
│  "Catch more. Fix faster. Ship better."     │
├─────────────────────────────────────────────┤
│  The Problem (3 cards with icons)           │
│  ├─ Only light mode audited                 │
│  ├─ Vague advice, no specifics              │
│  └─ No preview before you ship             │
├─────────────────────────────────────────────┤
│  Our Solution (feature highlight strip)     │
│  ├─ Dual-mode contrast (light + dark)       │
│  ├─ Exact hex code fixes                   │
│  ├─ SEO + Security + Performance           │
│  └─ Export-ready CSS/JSON/SCSS             │
├─────────────────────────────────────────────┤
│  How It Works (3-step visual)               │
│  [Enter URL] → [Server Audits] → [Fix It]  │
├─────────────────────────────────────────────┤
│  Competitive Comparison (feature table)     │
├─────────────────────────────────────────────┤
│  Live Demo (CTA → /)                        │
├─────────────────────────────────────────────┤
│  Open Source + Free (GitHub link)           │
├─────────────────────────────────────────────┤
│  Footer: links → dashboard, GitHub, API     │
└─────────────────────────────────────────────┘
```

### Design Notes

- Same CSS tokens as dashboard (single `<link>` tag or inline the design-tokens block)
- Animated gradient hero similar to fin-sig editorial style
- Dark glass panel cards with glow accents
- `← Back to Audit Dashboard` link in top-left

---

## Site Auditor vs fin-sig — Standalone App Comparison

Both tools follow the **same architecture pattern**: standalone Node/Python server + single-file embedded dashboard served from the same process. Both can expose optional-feature panels to Synabrain/Synagen.

| Dimension                | **Site Auditor**                 | **fin-sig**                               |
| ------------------------ | -------------------------------- | ----------------------------------------- |
| **Language**             | Node.js / TypeScript             | Python / FastAPI                          |
| **Port**                 | `$SITE_AUDITOR_PORT` (3847)      | `$FINSIG_API_PORT` (8013)                 |
| **Start**                | `tsx src/server.ts`              | `uvicorn src.api.main:app`                |
| **Dashboard**            | `dashboard.html` (embedded)      | `dashboard.html` (embedded)               |
| **Pitch page**           | `/pitch` route (new)             | Landing page (future, Phase 2.5)          |
| **Persistence**          | localStorage audit history       | localStorage watchlists + file-backed API |
| **Export**               | CSS / JSON / SCSS / Tailwind     | CSV signals + funders                     |
| **Core value**           | On-demand website auditing       | Ongoing financial signal tracking         |
| **Data source**          | User-submitted URLs (stateless)  | SEC EDGAR 13F filings (data pipeline)     |
| **Tone**                 | Developer utility, practical     | Research-grade, editorial                 |
| **Optional panel model** | Audit trigger → results in panel | Iframe adapter → read-only research view  |
| **Panel host ownership** | Sends URL, renders score cards   | Wraps iframe or polls `/api/signals`      |
| **Panel fallback**       | "Paste URL to audit" state       | "fin-sig server offline" message          |
| **Multi-page app**       | No (single dashboard + `/pitch`) | No (single dashboard, landing page later) |
| **Auth**                 | None (rate-limited by IP)        | None now, email+OAuth planned             |
| **Monetization plan**    | Open source, donation/SaaS       | Freemium ($29/$99 tiers)                  |
| **Cost to run**          | $0 local / $6-8/mo hosted        | $0 local / $5-7/mo hosted                 |

### Key Differences

**Site Auditor is stateless** — every audit is an isolated HTTP fetch. No DB, no persistent user data. The tool lives and dies on the quality of each audit result.

**fin-sig is data-pipeline-dependent** — the value accumulates over time as more filings are ingested and quarters are compared. The longer it runs, the better the diff signals.

**Panel integration complexity**: Site Auditor panels are simpler to host — they only need to POST a URL and render a score. fin-sig panels need the standalone server running continuously and rely on its accumulated data state.

### Shared Patterns (from www-cache assets)

Both projects benefit from the cached shared patterns:

| Asset                                 | Repo      | Applies To                                               |
| ------------------------------------- | --------- | -------------------------------------------------------- |
| `dockview/shared/dockview-shared.css` | www-cache | If site-auditor grows into a tabbed panel layout         |
| `dockview/shared/dockview-tips.md`    | www-cache | Popout/float patterns for multi-view mode                |
| `react/hooks/useLocalStorage.ts`      | www-cache | Dashboard audit history persistence (if React migration) |
| `react/patterns/error-boundary.tsx`   | www-cache | Fallback UI for panel adapter                            |
| `react/components/GlassCard.tsx`      | www-cache | Glass card component already matches design tokens       |

For the current single-file HTML dashboard, apply:

- `dockview-shared.css` sash sizing and tab patterns to the filter bar
- `GlassCard` CSS variables and shadow tiers directly in `dashboard.html` styles

---

## Dependencies (Target: 6)

```json
{
  "express": "^4.22.0",
  "typescript": "~5.9.0",
  "tsx": "^4.21.0",
  "vitest": "^2.1.0",
  "@types/express": "^4.17.0",
  "@types/node": "^22.0.0"
}
```

## Migration Path

1. Delete all Expo/React Native/NativeWind files
2. Keep lib/ analysis algorithms, move to src/analyzers/
3. Adapt audit-engine for server-side fetch
4. Build Express server + API routes
5. Build dashboard.html with Syna design tokens
6. Add new analyzers (SEO, security, performance)
7. Update package.json, tsconfig.json
8. Add launcher scripts
9. Update README
10. Keep Vitest tests, adapt imports
