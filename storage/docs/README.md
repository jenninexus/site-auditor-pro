# Site Auditor — Documentation Index

> **v2.0** — Express + single-file dashboard. Port: `$SITE_AUDITOR_PORT` (3847).

## Active Docs

| File                                         | Purpose                                             |
| -------------------------------------------- | --------------------------------------------------- |
| [PITCH_DECK.md](PITCH_DECK.md)               | Product pitch, competitive analysis, roadmap, costs |
| [SITE-AUDITOR-PLAN.md](SITE-AUDITOR-PLAN.md) | Architecture overview, running it, next steps       |

## Archive

| Path                               | Contents                                         |
| ---------------------------------- | ------------------------------------------------ |
| [archive/todo.md](archive/todo.md) | Full v1/v2 task tracker (Expo era + v2 redesign) |
| [archive/specs/](archive/specs/)   | 2026-03-14 redesign spec (API contract, layout)  |
| [archive/](archive/)               | Legacy: deployment, feature specs, design notes  |

## Quick Reference

```
src/server.ts       Express server — routes, rate limiter
src/dashboard.html  Main audit UI (served at /)
src/pitch.html      Marketing pitch page (served at /pitch)
src/analyzers/      Audit engine + individual analyzers
tests/              Vitest tests (150+ tests)
```

## Architecture Summary

```
Express (:$SITE_AUDITOR_PORT)
  GET  /              → dashboard.html
  GET  /pitch         → pitch.html
  GET  /api           → API index
  GET  /api/health    → uptime + version
  POST /api/audit     → runs full audit
  POST /api/export/csv|json → export
```

## Related Docs

- [optional-features/docs/SITE-AUDITOR.md](../../../optional-features/docs/SITE-AUDITOR.md) — panel adapter contract for Synabrain/Synagen
- [fin-sig/storage/docs/](../../../fin-sig/storage/docs/) — parallel standalone app (compare / contrast patterns)
- [www-cache/dockview/](../../www/cache/dockview/) — dockview CSS patterns (if multi-panel layout added)
- [www-cache/pitch-deck/](../../www/cache/pitch-deck/) — pitch deck template for new Syna projects
