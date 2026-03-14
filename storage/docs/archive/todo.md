# Site Auditor — Project TODO

> **v2.0** — Express server + single-file dashboard. Migrated from Expo/React Native.
> Architecture: `src/server.ts` → Express → serves `src/dashboard.html` + `/api/*`
> Port: `$SITE_AUDITOR_PORT` (default 3847)

---

## v2.0 Redesign — New Work

- [x] Express server (`src/server.ts`) — serves dashboard + API
- [x] Audit engine adapter (`src/analyzers/audit-engine.ts`) — orchestrates all analyzers
- [x] Rate limiter (IP-based, 10 req/min, no extra deps)
- [x] CSV + JSON export endpoints (`/api/export/csv`, `/api/export/json`)
- [x] Health endpoint (`/api/health`)
- [ ] SEO audit (`src/analyzers/seo.ts`) — title, meta, headings, OG, canonical
- [ ] Security headers audit (`src/analyzers/security.ts`) — CSP, HSTS, X-Frame-Options
- [ ] Performance audit (`src/analyzers/performance.ts`) — weight, render-blocking, cache
- [ ] Dashboard v2 (`src/dashboard.html`) — Syna design tokens, animated score ring
- [ ] Pitch page (`src/pitch.html`) — served at `/pitch`, linked from dashboard footer
- [ ] `/pitch` server route (`src/server.ts`) — `GET /pitch` serves `pitch.html`
- [ ] Optional feature panel — `GET /api/audit` used by Synabrain panel adapter
- [ ] Add `site-auditor` to `optional-features` registry (feature-nodes.yaml)

---

## Core Features

- [x] Home screen with URL input and audit button
- [x] Website analysis engine (fetch and parse CSS/JS)
- [x] CSS consistency analyzer (detect fragmentation, naming patterns)
- [x] JavaScript consistency analyzer (detect duplicates, patterns)
- [x] Audit results screen with categorized findings
- [x] Detail screen for individual issues
- [x] Recommendations screen with implementation guides
- [x] Recent audits list with caching (localStorage)
- [x] Refresh/re-audit functionality

## UI Components

- [x] URL input field with validation
- [x] Loading indicator with progress
- [x] Summary score cards
- [x] Issue category expandable sections
- [x] Severity badges (Critical, Warning, Info)
- [x] Difficulty indicators (Easy, Medium, Hard)
- [x] Impact indicators (High, Medium, Low)
- [x] Code snippet display component
- [x] Navigation between screens

## Data & Storage

- [x] Local audit history (localStorage)
- [x] Audit result data structure
- [x] Cache management for previous audits
- [ ] Export audit report (CSV, JSON download)

## Styling & Branding

- [x] Custom app logo
- [x] App name and branding
- [x] Theme colors — v2 uses Syna design tokens
- [x] Responsive layout
- [x] Dark mode (primary)

## Testing & Polish

- [x] Unit tests for audit engine (11 tests passing)
- [x] Unit tests for report generator (21 tests passing)
- [x] All navigation flows implemented
- [x] Loading states and error handling
- [ ] Test audit on multiple websites (manual testing)
- [ ] Performance optimization for large audits

---

## Color Contrast & Accessibility Analysis

- [x] Build contrast analysis engine with WCAG compliance checking
- [x] Extract text and background colors from HTML elements
- [x] Calculate contrast ratios and determine WCAG levels (AA, AAA)
- [x] Identify contrast violations per page
- [x] Create accessibility report
- [x] Add contrast visualization with color swatches
- [x] Generate contrast improvement recommendations
- [x] Integrate contrast analysis into audit engine
- [x] Unit tests for contrast calculation (34 tests passing)
- [x] Add accessibility report link to results screen

## Color Suggestion Feature

- [x] Build color suggestion algorithm for WCAG AAA compliance
- [x] Implement multiple suggestion strategies (darken, lighten, saturate)
- [x] Create color suggestion UI with live preview
- [x] Add before/after contrast ratio comparison
- [x] Integrate suggestions into accessibility report
- [x] Generate suggestion recommendations for each failing issue
- [x] Unit tests for color suggestion algorithm (41 tests passing)

## Brand Color Matching & Harmony

- [x] Extract brand color palette from audit results
- [x] Create brand color matcher to suggest from existing palette
- [x] Implement color harmony algorithm (complementary, analogous, triadic)
- [x] Add brand color preview section to suggestions
- [x] Unit tests for color harmony (47 tests passing)

## Copy-to-Clipboard & Batch Export

- [ ] Implement copy-to-clipboard for individual color pairs
- [ ] Add visual feedback (toast) on copy
- [x] Generate CSS snippet from suggestions
- [x] Generate design tokens JSON file
- [ ] Create batch export download button
- [x] Support multiple export formats (CSS, JSON, Figma tokens, SCSS, Tailwind, HTML)
- [x] Unit tests for export functionality (37 tests passing)

## GitHub Publishing & Documentation

- [x] Create comprehensive README.md
- [x] Add LICENSE file (MIT)
- [ ] Create CONTRIBUTING.md
- [x] Set up .gitignore properly
- [ ] Create GitHub Actions CI/CD workflow
- [ ] Deploy to public hosting (Railway or Fly.io, ~$5-7/mo)
- [ ] Create GitHub Releases with version tags

## jenninexus.com CSS Fixes

- [ ] Analyze current CSS structure and issues
- [ ] Consolidate CSS files into single bundle
- [ ] Implement BEM naming convention
- [ ] Fix color contrast issues
- [ ] Optimize CSS for performance
- [ ] Minify and bundle CSS
- [ ] Create migration guide for CSS changes

- [x] Website analysis engine (fetch and parse CSS/JS)
- [x] CSS consistency analyzer (detect fragmentation, naming patterns)
- [x] JavaScript consistency analyzer (detect duplicates, patterns)
- [x] Audit results screen with categorized findings
- [x] Detail screen for individual issues
- [x] Recommendations screen with implementation guides
- [x] Recent audits list with caching
- [x] Refresh/re-audit functionality

## UI Components

- [x] URL input field with validation
- [x] Loading indicator with progress
- [x] Summary score cards
- [x] Issue category expandable sections
- [x] Severity badges (Critical, Warning, Info)
- [x] Difficulty indicators (Easy, Medium, Hard)
- [x] Impact indicators (High, Medium, Low)
- [x] Code snippet display component
- [x] Navigation between screens

## Data & Storage

- [x] Local audit history storage (AsyncStorage)
- [x] Audit result data structure
- [x] Cache management for previous audits
- [ ] Export audit report functionality

## Styling & Branding

- [x] Custom app logo generation
- [x] App name and branding configuration
- [x] Theme colors applied to all screens
- [x] Responsive layout for different screen sizes
- [x] Dark mode support

## Testing & Polish

- [x] Unit tests for audit engine (11 tests passing)
- [x] Unit tests for report generator (21 tests passing)
- [x] All navigation flows implemented
- [x] Loading states and error handling
- [x] Dark/light mode support via theme provider
- [x] Responsive design for mobile
- [ ] Test audit on multiple websites (manual testing)
- [ ] Performance optimization for large audits

## Color Contrast & Accessibility Analysis (NEW)

- [x] Build contrast analysis engine with WCAG compliance checking
- [x] Extract text and background colors from HTML elements
- [x] Calculate contrast ratios and determine WCAG levels (AA, AAA)
- [x] Identify contrast violations per page
- [x] Create accessibility report screen
- [x] Add contrast visualization with color swatches
- [x] Generate contrast improvement recommendations
- [x] Integrate contrast analysis into audit engine
- [x] Unit tests for contrast calculation (34 tests passing)
- [x] Add accessibility report link to results screen

## Color Suggestion Feature (NEW)

- [x] Build color suggestion algorithm for WCAG AAA compliance
- [x] Implement multiple suggestion strategies (darken, lighten, saturate)
- [x] Create color suggestion UI component with live preview
- [x] Add before/after contrast ratio comparison
- [x] Integrate suggestions into accessibility report screen
- [x] Generate suggestion recommendations for each failing issue
- [x] Unit tests for color suggestion algorithm (41 tests passing)
- [x] Test color suggestions on real contrast failures

## Brand Color Matching & Harmony (NEW)

- [x] Extract brand color palette from audit results
- [x] Create brand color matcher to suggest from existing palette
- [x] Implement color harmony algorithm (complementary, analogous, triadic)
- [x] Add brand color preview section to suggestions
- [x] Unit tests for color harmony (47 tests passing)

## Copy-to-Clipboard & Batch Export (NEW)

- [ ] Implement copy-to-clipboard for individual color pairs
- [ ] Add visual feedback (toast notification) on copy
- [x] Generate CSS snippet from suggestions
- [x] Generate design tokens JSON file
- [ ] Create batch export download button
- [x] Support multiple export formats (CSS, JSON, Figma tokens, SCSS, Tailwind, HTML)
- [x] Unit tests for export functionality (37 tests passing)

## GitHub Publishing & Documentation (NEW)

- [x] Create comprehensive README.md
- [x] Add LICENSE file (MIT)
- [ ] Create CONTRIBUTING.md for contributors
- [x] Set up .gitignore properly
- [ ] Create GitHub Actions CI/CD workflow
- [x] Deploy web version to Vercel
- [ ] Create GitHub Releases with version tags
- [ ] Set up GitHub Pages documentation

## jenninexus.com CSS Fixes (NEW)

- [ ] Analyze current CSS structure and issues
- [ ] Consolidate CSS files into single bundle
- [ ] Implement BEM naming convention
- [ ] Fix color contrast issues
- [ ] Optimize CSS for performance
- [ ] Minify and bundle CSS
- [ ] Create migration guide for CSS changes
