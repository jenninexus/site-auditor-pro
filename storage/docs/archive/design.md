# Site Auditor Pro - Mobile App Design

## App Overview

Site Auditor Pro is a mobile application that analyzes websites for CSS and JavaScript consistency issues. Users can input a website URL and receive a detailed audit report with actionable recommendations for improving code consistency and maintainability.

## Screen List

1. **Home Screen** — URL input and quick audit launcher
2. **Audit Results Screen** — Displays audit findings organized by category
3. **Detail Screen** — Deep dive into specific consistency issues
4. **Recommendations Screen** — Actionable fixes and best practices

## Primary Content and Functionality

### Home Screen
- Large text input field for website URL
- "Audit Website" button (primary action)
- Recent audits list (quick access to previous scans)
- Information card explaining what the app does
- Theme toggle in header

### Audit Results Screen
- Progress indicator during analysis
- Summary cards showing overall scores (CSS Consistency, JS Consistency, Overall Health)
- Categorized findings:
  - CSS Issues (file fragmentation, missing globals, inconsistent naming)
  - JavaScript Issues (duplicate scripts, inconsistent patterns)
  - Performance Issues (HTTP requests, file sizes)
  - Best Practices (recommendations for improvement)
- Tap to expand each category for details

### Detail Screen
- Issue title and severity badge (Critical, Warning, Info)
- Detailed description of the problem
- Code examples or affected pages
- Recommended fix with code snippet
- Link to relevant documentation

### Recommendations Screen
- Prioritized list of actionable improvements
- Implementation difficulty (Easy, Medium, Hard)
- Estimated impact (High, Medium, Low)
- Step-by-step implementation guide
- Related issues that would be resolved

## Key User Flows

**Primary Flow: Website Audit**
1. User opens app → Home Screen
2. User enters website URL (e.g., jenninexus.com)
3. User taps "Audit Website" button
4. App displays loading state with progress
5. Results appear on Audit Results Screen
6. User taps on category to expand and see issues
7. User taps on specific issue to view Detail Screen
8. User can navigate to Recommendations Screen for implementation guidance

**Secondary Flow: View Previous Audits**
1. User opens app → Home Screen
2. User taps on a recent audit from the list
3. App displays cached results on Audit Results Screen
4. User can re-audit the same site with a refresh button

## Color Choices

The app uses a modern, tech-forward color scheme that reflects the auditing/analysis nature:

- **Primary**: `#0a7ea4` (Professional blue) — Used for primary actions, highlights
- **Background**: `#ffffff` (light) / `#151718` (dark) — Screen backgrounds
- **Surface**: `#f5f5f5` (light) / `#1e2022` (dark) — Cards and elevated surfaces
- **Foreground**: `#11181C` (light) / `#ECEDEE` (dark) — Primary text
- **Muted**: `#687076` (light) / `#9BA1A6` (dark) — Secondary text
- **Success**: `#22C55E` — Good audit results
- **Warning**: `#F59E0B` — Issues requiring attention
- **Error**: `#EF4444` — Critical issues

## Layout Principles

- **One-handed usage**: All interactive elements positioned within thumb reach on portrait orientation (9:16)
- **Consistent spacing**: 16px base unit for padding and margins
- **Clear hierarchy**: Larger text for titles, smaller for details
- **Accessible contrast**: All text meets WCAG AA standards
- **Mobile-first**: Designed for portrait orientation with proper SafeArea handling
