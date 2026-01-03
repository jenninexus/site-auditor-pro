# Site Auditor Pro

**Comprehensive website auditing tool for CSS consistency, JavaScript quality, color contrast, and performance optimization.**

Analyze any website and get actionable recommendations to improve code quality, accessibility, and performance. Built with React Native, TypeScript, and Expo.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests Passing](https://img.shields.io/badge/tests-191%20passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)]()

---

## 🚀 Quick Start

### Web Browser (Recommended - No Installation)

Visit: **[site-auditor-pro.vercel.app](https://site-auditor-pro.vercel.app)** ← Just click and use!

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/site-auditor-pro.git
cd site-auditor-pro

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser to http://localhost:8081
```

### Mobile Testing (Expo Go)

```bash
# Start dev server
pnpm dev

# Scan QR code with Expo Go app (iOS/Android)
# App loads on your phone instantly
```

---

## ✨ Features

### 🎨 Color Contrast Analysis
- **WCAG 2.1 Compliance** — Detects AA and AAA violations
- **Automatic Suggestions** — Generates WCAG AAA-compliant color pairs
- **Live Preview** — See before/after contrast ratios
- **Brand-Aware** — Suggests colors matching your existing palette
- **Color Harmony** — Complementary, analogous, triadic suggestions

### 🔍 CSS Consistency Audit
- **Fragmentation Detection** — Identifies CSS file splits and redundancy
- **Naming Pattern Analysis** — Checks for consistent class naming
- **Minification Status** — Detects unminified assets
- **Performance Metrics** — HTTP request optimization

### 📊 JavaScript Quality
- **Duplicate Detection** — Finds redundant scripts
- **Bundle Analysis** — Identifies oversized dependencies
- **Best Practices** — Checks for common anti-patterns
- **Performance Profiling** — Suggests optimization opportunities

### 📈 Performance Metrics
- **Asset Optimization** — Analyzes images, fonts, scripts
- **HTTP Requests** — Identifies excessive requests
- **Load Time Estimates** — Predicts performance improvements
- **Caching Recommendations** — Suggests cache strategies

### 📥 Export & Integration
- **CSS Snippets** — Copy-paste ready fixes
- **Design Tokens** — JSON for design systems
- **Tailwind Config** — Pre-built Tailwind classes
- **Figma Tokens** — Import into Figma
- **SCSS Variables** — For Sass projects
- **HTML Reports** — Shareable audit reports

---

## 📱 Deployment Options

### Option 1: Web Browser (Easiest)
```bash
# Deploy to Vercel (free, 1-click)
pnpm build
# Push to GitHub, connect to Vercel
# Your app is live at vercel.app URL
```

### Option 2: GitHub Pages
```bash
# Deploy static web version
pnpm build:web
git add dist/
git commit -m "Deploy to GitHub Pages"
git push origin main
# Enable GitHub Pages in repo settings
```

### Option 3: Docker
```bash
# Build and run with Docker
docker build -t site-auditor-pro .
docker run -p 8081:8081 site-auditor-pro
```

### Option 4: Mobile Apps (iOS/Android)
```bash
# Build with Expo EAS
eas build --platform ios
eas build --platform android
# Distribute via App Store / Google Play
```

---

## 🛠️ Architecture

### Tech Stack
- **Frontend**: React Native 0.81, React 19, Expo SDK 54
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Language**: TypeScript 5.9
- **State**: React Context + AsyncStorage
- **Testing**: Vitest (191 tests)
- **Build**: Metro Bundler, Expo Router

### Project Structure
```
site-auditor-app/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx            # Home screen
│   │   └── _layout.tsx          # Tab navigation
│   ├── results.tsx              # Audit results
│   ├── accessibility.tsx        # Color contrast report
│   ├── recommendations.tsx      # Implementation guide
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable components
│   ├── screen-container.tsx     # SafeArea wrapper
│   ├── color-suggestion-card.tsx # Suggestion UI
│   └── ui/
│       └── icon-symbol.tsx      # Icon mapping
├── lib/                          # Core logic
│   ├── audit-engine.ts          # Main audit orchestrator
│   ├── contrast-analyzer.ts     # WCAG compliance
│   ├── color-suggester.ts       # Color fix suggestions
│   ├── color-harmony.ts         # Color theory
│   ├── report-generator.ts      # Report formatting
│   ├── batch-export.ts          # Export generators
│   └── *.test.ts                # 191 unit tests
├── hooks/                        # React hooks
├── constants/                    # App constants
├── assets/                       # Images, icons
├── app.config.ts                # Expo configuration
├── tailwind.config.js           # Tailwind theme
└── package.json
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test lib/audit-engine.test.ts

# Watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage
```

**Test Coverage:**
- Audit Engine: 11 tests
- Contrast Analyzer: 34 tests
- Color Suggester: 41 tests
- Color Harmony: 47 tests
- Report Generator: 21 tests
- Batch Export: 37 tests
- **Total: 191 passing tests**

---

## 📖 Usage Guide

### Audit a Website

1. **Enter URL** — Type or paste website URL
2. **Start Audit** — Click "Audit Website" button
3. **Wait for Results** — Analysis completes in 5-10 seconds
4. **Review Findings** — See categorized issues with severity

### Fix Color Contrast Issues

1. **Go to Accessibility Report** — Click "Color Contrast Report"
2. **Expand Issue** — View original vs suggested colors
3. **Review Suggestions** — See multiple fix options
4. **Copy Colors** — Use copy button or export as CSS

### Export Fixes

1. **Select Format** — CSS, JSON, SCSS, Tailwind, Figma, or HTML
2. **Download File** — Get ready-to-use code
3. **Integrate** — Apply to your project immediately

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` (optional):

```env
# API endpoint (for future backend features)
EXPO_PUBLIC_API_URL=http://localhost:3000

# Enable debug logging
EXPO_PUBLIC_DEBUG=false
```

### Theme Customization

Edit `theme.config.js`:

```javascript
const themeColors = {
  primary: '#0a7ea4',      // Main brand color
  secondary: '#687076',    // Secondary color
  accent: '#10B981',       // Accent color
  // ... more colors
};
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch** — `git checkout -b feature/amazing-feature`
3. **Make your changes** — Add tests for new functionality
4. **Run tests** — `pnpm test` (all must pass)
5. **Commit** — `git commit -m 'Add amazing feature'`
6. **Push** — `git push origin feature/amazing-feature`
7. **Open Pull Request** — Describe your changes

### Development Workflow

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Make changes to code
# Tests run automatically

# Before committing
pnpm test      # Run all tests
pnpm lint      # Check code style
pnpm format    # Auto-format code
```

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:

- **Description** — What happened?
- **Steps to Reproduce** — How to trigger the bug
- **Expected Behavior** — What should happen
- **Screenshots** — If applicable
- **Environment** — Browser, OS, device

---

## 📋 Roadmap

### v1.1 (Next Release)
- [ ] Batch website audits
- [ ] Audit scheduling
- [ ] Email reports
- [ ] Team collaboration

### v1.2
- [ ] Browser extension
- [ ] API for programmatic access
- [ ] Custom audit rules
- [ ] Performance monitoring

### v2.0
- [ ] Cloud storage for audits
- [ ] Team accounts
- [ ] Advanced analytics
- [ ] Automated fixes

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) file for details.

**You're free to:**
- ✅ Use commercially
- ✅ Modify and distribute
- ✅ Use privately
- ✅ Use in patents

**You must:**
- ✅ Include license and copyright notice

---

## 🙋 Support

### Documentation
- [Deployment Guide](DEPLOYMENT.md) — How to deploy
- [Contributing Guide](CONTRIBUTING.md) — How to contribute
- [API Docs](docs/API.md) — Technical reference

### Community
- **GitHub Issues** — Bug reports and features
- **GitHub Discussions** — Questions and ideas
- **Email** — support@site-auditor-pro.dev

---

## 🎯 Key Metrics

| Metric | Value |
|--------|-------|
| **Bundle Size** | ~2MB (web) / ~40MB (mobile) |
| **Load Time** | <2 seconds on 4G |
| **Test Coverage** | 191 passing tests |
| **Browser Support** | All modern browsers |
| **Mobile Support** | iOS 12+, Android 6+ |
| **Accessibility** | WCAG 2.1 AA compliant |

---

## 🙏 Acknowledgments

Built with:
- [React Native](https://reactnative.dev/) — Cross-platform framework
- [Expo](https://expo.dev/) — React Native platform
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [NativeWind](https://www.nativewind.dev/) — Tailwind for React Native
- [Vitest](https://vitest.dev/) — Testing framework

---

## 📞 Contact

**Site Auditor Pro**
- Website: [site-auditor-pro.vercel.app](https://site-auditor-pro.vercel.app)
- GitHub: [github.com/yourusername/site-auditor-pro](https://github.com/yourusername/site-auditor-pro)
- Email: hello@site-auditor-pro.dev

---

**Made with ❤️ by the Site Auditor Pro team**

*Last updated: January 2026*
