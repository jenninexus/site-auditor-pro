<div align="center">

# Site Auditor

![MIT](https://img.shields.io/badge/license-MIT-00e879?style=flat-square)
![Runtime](https://img.shields.io/badge/runtime-Node%2018%2B-42f4c8?style=flat-square)
![Stack](https://img.shields.io/badge/stack-TypeScript%20%2B%20Express-39ff8c?style=flat-square)
![Dependencies](https://img.shields.io/badge/dependencies-6%20runtime/dev-00e5ff?style=flat-square)
![Mode](https://img.shields.io/badge/mode-zero%20build%20dashboard-8bffcc?style=flat-square)

## Audit the page.
## See what needs fixing.

`site-auditor` checks websites for accessibility, SEO, security headers, performance, CSS quality, and JavaScript quality from a standalone local dashboard.

[Live page](https://jenninexus.com/site-auditor) · [GitHub repo](https://github.com/jenninexus/site-auditor)

</div>

- Run a local Express auditor with an embedded glass dashboard.
- Score six practical categories from one URL.
- Export reports as JSON or CSV.
- Keep the tool small: no frontend build step, no hosted service required.

---

## Quick Start

```bash
git clone https://github.com/jenninexus/site-auditor.git
cd site-auditor
npm install
npm run dev
```

Open:

```text
http://localhost:3847
```

On Windows:

```powershell
start.bat
```

---

## What It Checks

| Category | What It Checks |
|----------|----------------|
| **CSS Quality** | Fragmentation, naming consistency, framework conflicts, minification |
| **JavaScript** | Duplicate scripts, fragmentation, inline bloat, minification |
| **Accessibility** | WCAG 2.1 AA/AAA contrast in light and dark mode, color fix suggestions |
| **SEO** | Title, meta description, headings, alt text, Open Graph, structured data |
| **Security** | CSP, HSTS, X-Frame-Options, HTTPS, Content-Type-Options, Referrer-Policy |
| **Performance** | Page weight, asset count, render-blocking, compression, lazy loading |

---

## API

### `POST /api/audit`

```json
{ "url": "https://example.com" }
```

Returns scores from 0-100 for all six categories, issues with severity/recommendations, and detailed reports.

### `GET /api/health`

Server status, version, and uptime.

### `POST /api/export/csv`

Export audit results as CSV.

### `POST /api/export/json`

Export audit results as JSON.

---

## Architecture

```text
src/
├── server.ts              Express server ($SITE_AUDITOR_PORT, default 3847)
├── analyzers/
│   ├── audit-engine.ts    Orchestrator: fetches URL, runs analyzers, aggregates scores
│   ├── contrast.ts        WCAG contrast in light and dark mode
│   ├── seo.ts             SEO audit
│   ├── security.ts        Security headers
│   └── performance.ts     Performance analysis
├── dashboard.html         Single-file embedded dashboard
└── pitch.html             Marketing page served at /pitch
```

Design direction: dark glass dashboard with Syna design tokens, fast scanning, and practical remediation notes.

---

## Scripts

```bash
npm run dev        # Start dev server with hot reload
npm run start      # Start production server
npm run check      # TypeScript type check
npm run lint       # ESLint (src/ + tests/)
npm run test       # Run tests
npm run build      # Compile TypeScript
```

---

## Configuration

| Env Variable | Default | Description |
|--------------|---------|-------------|
| `SITE_AUDITOR_PORT` | `3847` | Server port |

---

## v2.0 Notes

Site Auditor v2 is a focused rewrite:

- **Before:** Expo/React Native Web, Vercel-dependent, 68 dependencies, three styling systems.
- **After:** Express + embedded HTML, standalone local dashboard, six total dependencies.

Core analysis algorithms were preserved with 150+ tests. SEO, security headers, and performance analyzers were added.

---

## Contributing

Useful improvements:

- New analyzers with clear recommendations.
- Better report exports.
- Accessibility fixes and contrast rule refinements.
- More dashboard states for comparing multiple audits.

MIT — use, fork, customize

---

<div align="center">

If this helps you ship a cleaner website:

[Star this repo](https://github.com/jenninexus/site-auditor) · [Links](https://jenninexus.com/links) · [Patreon](https://www.patreon.com/c/JenniNexus) · [Paypal](https://paypal.me/jenninexus)

Published by [Jenni](https://github.com/jenninexus) at [Monofinity Studio](https://github.com/monofinitystudio).

</div>
