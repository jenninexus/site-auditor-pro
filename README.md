# Site Auditor Pro

**Comprehensive website auditing tool for CSS consistency, JavaScript quality, color contrast, and performance optimization.**

Analyze any website and get actionable recommendations to improve code quality, accessibility, and performance. Built with React Native, TypeScript, and Expo.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)]()
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)]()

---

## 🚀 Live Demo

**Try it now:** [https://site-auditor-pro-nine.vercel.app](https://site-auditor-pro-nine.vercel.app)

No installation required! Just open the link and start auditing websites instantly.

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

### 🎨 Live Preview & Color Customization (New!)
- **Website Preview** — See the analyzed website in real-time
- **CSS Variable Editor** — Extract and edit CSS custom properties
- **Color Picker** — Interactive RGB sliders for precise color control
- **Real-time Updates** — See changes instantly in the preview
- **Export Modified CSS** — Download your customized styles

### 📥 Export & Integration
- **CSS Snippets** — Copy-paste ready fixes
- **Design Tokens** — JSON for design systems
- **Tailwind Config** — Pre-built Tailwind classes
- **Figma Tokens** — Import into Figma
- **SCSS Variables** — For Sass projects
- **HTML Reports** — Shareable audit reports

---

## 🚀 Quick Start

### Web Browser (Recommended)

Visit: **[https://site-auditor-pro-nine.vercel.app](https://site-auditor-pro-nine.vercel.app)**

### Local Development

```bash
# Clone repository
git clone https://github.com/jenninexus/site-auditor-pro.git
cd site-auditor-pro

# Install dependencies
pnpm install

# Start development server
pnpm start
# Press 'w' for web, or scan QR code for mobile

# Build for web
pnpm build:web
```

---

## 📖 Usage Guide

### 1. Audit a Website

1. **Enter URL** — Type or paste any website URL (e.g., `example.com`)
2. **Click "Audit Website"** — Analysis starts immediately
3. **Wait for Results** — Typically completes in 3-5 seconds
4. **Review Findings** — See scores and categorized issues

### 2. View Results

- **Overall Score** — Combined CSS, JS, and performance score
- **CSS Score** — Consistency and optimization rating
- **JS Score** — Quality and best practices rating
- **Issues List** — Categorized by severity (Critical, Warning, Info)

### 3. Check Color Contrast

1. **Click "Color Contrast Report"**
2. **View WCAG Compliance** — See AA/AAA pass/fail status
3. **Get Suggestions** — Automatic color fix recommendations
4. **Copy Colors** — Use suggested colors in your project

### 4. Customize Colors (New!)

1. **Click "🎨 Preview & Customize Colors"**
2. **View Live Preview** — See the website in split-view
3. **Edit CSS Variables** — Click color swatches to open picker
4. **Adjust Colors** — Use RGB sliders or hex input
5. **See Changes Live** — Preview updates in real-time
6. **Download CSS** — Export your modified styles

### 5. View Recommendations

1. **Click "View Recommendations"**
2. **Read Implementation Guide** — Step-by-step fixes
3. **Check Difficulty** — Easy, Medium, or Hard ratings
4. **Assess Impact** — High, Medium, or Low impact

### 6. Export Results

- **CSS Snippets** — Ready-to-use code
- **JSON Tokens** — For design systems
- **Tailwind Config** — Pre-configured classes
- **HTML Report** — Shareable document

---

## 🛠️ Tech Stack

- **Frontend**: React Native 0.81, React 19, Expo SDK 54
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Language**: TypeScript 5.9
- **Routing**: Expo Router (file-based routing)
- **State**: React Context + AsyncStorage
- **Deployment**: Vercel (auto-deploy from GitHub)
- **Build**: Metro Bundler, Expo Web

---

## 📁 Project Structure

```
site-auditor-pro/
├── app/                          # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx            # Home screen
│   │   └── _layout.tsx          # Tab navigation
│   ├── results.tsx              # Audit results
│   ├── accessibility.tsx        # Color contrast report
│   ├── recommendations.tsx      # Implementation guide
│   ├── preview.tsx              # Live preview & color editor (NEW!)
│   └── _layout.tsx              # Root layout
├── components/                   # Reusable components
│   ├── screen-container.tsx     # SafeArea wrapper
│   ├── website-preview.tsx      # Iframe preview (NEW!)
│   ├── css-variable-editor.tsx  # Color picker UI (NEW!)
│   └── ui/
├── lib/                          # Core logic
│   ├── audit-engine.ts          # Main audit orchestrator
│   ├── contrast-analyzer.ts     # WCAG compliance
│   ├── color-suggester.ts       # Color fix suggestions
│   ├── css-variable-extractor.ts # CSS variable parser (NEW!)
│   ├── report-generator.ts      # Report formatting
│   └── batch-export.ts          # Export generators
├── hooks/                        # React hooks
├── constants/                    # App constants
├── theme.config.js              # Theme colors (dark mode default)
├── vercel.json                  # Deployment config
└── package.json
```

---

## 🎨 Dark Mode

The app now defaults to **dark mode** with a beautiful, modern theme:

- **Rich dark backgrounds** — Easy on the eyes
- **Vibrant accent colors** — Better contrast and readability
- **Smooth transitions** — Seamless theme switching
- **System preference** — Respects OS dark mode setting

To toggle themes programmatically:
```typescript
import { useThemeContext } from '@/lib/theme-provider';

const { setColorScheme } = useThemeContext();
setColorScheme('dark'); // or 'light'
```

---

## 🚀 Deployment

### Vercel (Current Setup)

This project is configured for automatic deployment to Vercel:

1. **Push to GitHub** — Any commit to `main` branch
2. **Auto-Deploy** — Vercel detects changes and builds
3. **Live in 2-3 minutes** — New version goes live automatically

**Current URL:** https://site-auditor-pro-nine.vercel.app

### Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain (e.g., `siteauditor.com`)
5. Follow DNS configuration instructions

### Build Configuration

```json
{
  "buildCommand": "pnpm install && pnpm build:web",
  "outputDirectory": "dist-web",
  "framework": "other"
}
```

---

## 🔧 Configuration

### Theme Customization

Edit `theme.config.js` to customize colors:

```javascript
const themeColors = {
  primary: { light: '#0a7ea4', dark: '#3b82f6' },
  background: { light: '#ffffff', dark: '#0f1419' },
  surface: { light: '#f5f5f5', dark: '#1a1f26' },
  // ... more colors
};
```

### Environment Variables

No environment variables required for basic usage. The app runs entirely client-side.

For future backend features, create `.env.local`:

```env
# Optional: Custom API endpoint
EXPO_PUBLIC_API_URL=https://api.example.com

# Optional: Enable debug logging
EXPO_PUBLIC_DEBUG=false
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork the repository**
2. **Create a feature branch** — `git checkout -b feature/amazing-feature`
3. **Make your changes** — Write clean, documented code
4. **Test locally** — `pnpm start` and verify changes
5. **Commit** — `git commit -m 'Add amazing feature'`
6. **Push** — `git push origin feature/amazing-feature`
7. **Open Pull Request** — Describe your changes

### Development Workflow

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm start
# Press 'w' for web, 'i' for iOS, 'a' for Android

# Build for web
pnpm build:web

# Type check
pnpm typecheck
```

---

## 📋 Roadmap

### v1.1 (Current)
- [x] CORS proxy for website fetching
- [x] Live website preview
- [x] CSS variable color picker
- [x] Dark mode theme
- [ ] Fix preview page routing

### v1.2
- [ ] Font and spacing variable editor
- [ ] Color scheme presets
- [ ] Undo/redo functionality
- [ ] Comparison mode (before/after)

### v2.0
- [ ] Backend API (replace CORS proxy)
- [ ] User accounts and saved audits
- [ ] Bulk audit multiple pages
- [ ] Browser extension version
- [ ] Team collaboration features

---

## 🐛 Known Issues

### Preview Page Loading
The preview & customize feature is currently experiencing a routing issue. The code is complete but needs proper Expo Router configuration. Fix in progress.

**Workaround:** All other features work perfectly, including the core auditing functionality.

---

## 📄 License

This project is licensed under the MIT License.

**You're free to:**
- ✅ Use commercially
- ✅ Modify and distribute
- ✅ Use privately

**You must:**
- ✅ Include license and copyright notice

See [LICENSE](LICENSE) file for full details.

---

## 🙏 Acknowledgments

Built with:
- [React Native](https://reactnative.dev/) — Cross-platform framework
- [Expo](https://expo.dev/) — React Native platform
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [NativeWind](https://www.nativewind.dev/) — Tailwind for React Native
- [Vercel](https://vercel.com/) — Deployment platform

Special thanks to:
- [AllOrigins](https://allorigins.win/) — CORS proxy service
- The open-source community

---

## 📞 Contact

**Site Auditor Pro**
- Live App: [https://site-auditor-pro-nine.vercel.app](https://site-auditor-pro-nine.vercel.app)
- GitHub: [https://github.com/jenninexus/site-auditor-pro](https://github.com/jenninexus/site-auditor-pro)
- Issues: [GitHub Issues](https://github.com/jenninexus/site-auditor-pro/issues)

---

**Made with ❤️ for the web development community**

*Last updated: January 2026*
