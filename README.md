# Site Auditor Pro

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)]()
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)]()

**Comprehensive website auditing tool for CSS consistency, JavaScript quality, accessibility, and performance optimization.**

Analyze any website and get actionable recommendations to improve code quality, accessibility (WCAG 2.1), and performance. Features dual-mode contrast analysis (light & dark), live preview with CSS variable editing, and framework-aware detection (Bootstrap, Tailwind).

🌐 **Live Demo:** [https://site-auditor-pro-nine.vercel.app](https://site-auditor-pro-nine.vercel.app)

---

## Features

- **Dual-Mode Accessibility** — Analyzes both light and dark modes for WCAG 2.1 AA/AAA compliance
- **Live Preview & Customization** — Edit CSS variables with real-time preview
- **Framework-Aware** — Detects Bootstrap, Tailwind, and CSS custom properties
- **Code Analyzer** — Paste CSS/JS directly for instant quality analysis
- **Comprehensive Auditing** — CSS consistency, JavaScript quality, performance metrics
- **Export Options** — CSS snippets, design tokens, Tailwind config, Bootstrap themes, HTML/PDF reports

---

## Quick Start

### Web (Recommended)
Visit [https://site-auditor-pro-nine.vercel.app](https://site-auditor-pro-nine.vercel.app)

### Local Development

```bash
# Clone and install
git clone https://github.com/jenninexus/site-auditor-pro.git
cd site-auditor-pro
pnpm install

# Start development server
pnpm start
# Press 'w' for web, or scan QR code for mobile

# Build for web
pnpm build:web
```

---

## Usage

### 1. Audit a Website
Enter any URL and click "Audit Website" — results in 3-5 seconds

### 2. View Results
- Overall score (CSS + JS + Performance)
- Categorized issues (Critical, Warning, Info)
- Accessibility score (WCAG 2.1 compliance)

### 3. Check Accessibility
- View dual-mode contrast analysis (light & dark)
- Get specific color suggestions with hex codes
- See WCAG AA/AAA compliance per mode

### 4. Customize & Preview
- Click "🎨 Preview & Customize Colors"
- Edit CSS variables with color pickers
- Toggle between light/dark mode editors
- Export modified CSS or Bootstrap themes

### 5. Analyze Code Directly
- Switch to "Analyze" tab
- Paste CSS or JavaScript code
- Get instant quality analysis

---

## Tech Stack

- **Framework:** Expo (React Native Web)
- **Language:** TypeScript
- **Styling:** TailwindCSS + NativeWind
- **Routing:** Expo Router
- **Storage:** AsyncStorage (client-side)
- **Deployment:** Vercel Edge Functions
- **Proxy:** Custom CORS proxy (privacy-first)

---

## Project Structure

```
site-auditor-pro/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   ├── preview.tsx        # Live preview & customization
│   └── privacy.tsx        # Privacy policy
├── components/            # React components
├── lib/                   # Core logic
│   ├── audit-engine.ts   # Website auditing
│   ├── contrast-analyzer.ts  # WCAG compliance
│   ├── css-variable-extractor.ts  # CSS parsing
│   └── bootstrap-fallback.ts  # Framework detection
├── api/                   # Vercel Edge Functions
│   └── proxy.js          # CORS proxy
└── hooks/                # Custom React hooks
```

---

## API

### Vercel Edge Function Proxy

**Endpoint:** `/api/proxy?url=<target_url>`

Fetches external websites with proper CORS headers. Used internally by the audit engine.

**Example:**
```bash
curl "https://site-auditor-pro-nine.vercel.app/api/proxy?url=https://example.com"
```

---

## Development

### Available Scripts

```bash
pnpm start          # Start Expo dev server
pnpm build:web      # Build for web production
pnpm lint           # Run ESLint
pnpm test           # Run tests (if configured)
```

### Environment

- Node.js 22+
- pnpm 9+
- Expo SDK 52

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Privacy

Site Auditor Pro uses a custom CORS proxy to fetch websites for analysis. All processing happens client-side. No user data is stored on servers. See [Privacy Policy](https://site-auditor-pro-nine.vercel.app/privacy) for details.

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Links

- **Live App:** https://site-auditor-pro-nine.vercel.app
- **GitHub:** https://github.com/jenninexus/site-auditor-pro
- **Privacy Policy:** https://site-auditor-pro-nine.vercel.app/privacy
- **Pitch Deck:** See [PITCH_DECK.md](docs/PITCH_DECK.md)

---

## Acknowledgments

Built with Expo, React Native, TypeScript, and TailwindCSS. Deployed on Vercel.

---

**Made with ❤️ for developers and accessibility advocates**
