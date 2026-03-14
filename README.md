# Site Auditor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)]()
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)]()

**Audit any website for accessibility, SEO, security, and code quality.**

Standalone Express server with an embedded glass-morphism dashboard. Analyzes 6 categories: CSS quality, JavaScript, WCAG accessibility (light + dark mode), SEO, security headers, and performance. Zero build step. 6 dependencies.

---

## Quick Start

```bash
# Clone and start
git clone https://github.com/jenninexus/site-auditor-pro.git
cd site-auditor-pro
npm install
npm run dev

# Open http://localhost:3847
```

Or on Windows:

```
start.bat
```

## Features

| Category          | What It Checks                                                           |
| ----------------- | ------------------------------------------------------------------------ |
| **CSS Quality**   | Fragmentation, naming consistency, framework conflicts, minification     |
| **JavaScript**    | Duplicate scripts, fragmentation, inline bloat, minification             |
| **Accessibility** | WCAG 2.1 AA/AAA contrast (light + dark mode), color fix suggestions      |
| **SEO**           | Title, meta description, headings, alt text, Open Graph, structured data |
| **Security**      | CSP, HSTS, X-Frame-Options, HTTPS, Content-Type-Options, Referrer-Policy |
| **Performance**   | Page weight, asset count, render-blocking, compression, lazy loading     |

## API

### `POST /api/audit`

```json
{ "url": "https://example.com" }
```

Returns scores (0-100) for all 6 categories, issues with severity/recommendations, and detailed reports.

### `GET /api/health`

Server status, version, uptime.

### `POST /api/export/csv`

Export audit results as CSV.

### `POST /api/export/json`

Export audit results as JSON download.

## Architecture

```
src/
├── server.ts              Express server ($SITE_AUDITOR_PORT, default 3847)
├── analyzers/
│   ├── audit-engine.ts    Orchestrator — fetches URL, runs all analyzers, aggregates scores
│   ├── contrast.ts        WCAG contrast (light + dark mode)
│   ├── seo.ts             SEO audit
│   ├── security.ts        Security headers
│   └── performance.ts     Performance analysis
├── dashboard.html         Single-file embedded dashboard (Syna design tokens)
└── pitch.html             Marketing pitch page (served at /pitch)
```

**Design:** Dark theme with glass morphism, Outfit + Space Mono fonts, purple/cyan accent palette. Based on the Syna design token system.

## Dependencies

| Package      | Purpose                    |
| ------------ | -------------------------- |
| `express`    | HTTP server                |
| `tsx`        | TypeScript execution (dev) |
| `typescript` | Type checking (dev)        |
| `vitest`     | Testing (dev)              |

That's it. 6 total (including types). Was 68 in v1.

## Scripts

```bash
npm run dev        # Start dev server with hot reload
npm run start      # Start production server
npm run check      # TypeScript type check
npm run lint       # ESLint (src/ + tests/)
npm run test       # Run tests
npm run build      # Compile TypeScript
```

## Configuration

| Env Variable        | Default | Description |
| ------------------- | ------- | ----------- |
| `SITE_AUDITOR_PORT` | `3847`  | Server port |

## v2.0 Migration

Site Auditor v2 is a complete rewrite:

- **Before:** Expo/React Native Web, 68 deps, Vercel-dependent, 3 styling systems
- **After:** Express + embedded HTML, 6 deps, standalone, Syna design tokens

Core analysis algorithms preserved with 150+ tests. New: SEO, security headers, and performance analyzers.

## License

MIT
