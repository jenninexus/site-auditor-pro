# Site Auditor Pro - Deployment & Requirements Guide

## What the App Needs to Run

### Development Environment
- **Node.js** (v18+) - JavaScript runtime
- **pnpm** (v9+) - Package manager (faster than npm)
- **Git** - Version control
- **Expo CLI** - React Native development tool

### Runtime Dependencies (Installed via pnpm)
All dependencies are listed in `package.json` and include:
- React Native 0.81
- Expo SDK 54
- React 19
- TypeScript 5.9
- NativeWind (Tailwind CSS for React Native)
- TanStack Query (data fetching)
- Drizzle ORM (database)
- And 30+ other packages

### System Requirements
- **Minimum RAM**: 4GB (8GB recommended)
- **Disk Space**: 2GB for node_modules
- **Internet**: Required for npm package downloads and live development

---

## Deployment Options

### Option 1: Expo Go (Fastest - Development Only)
**Best for**: Testing on your phone during development

**Steps**:
1. Run `pnpm dev` locally
2. Scan QR code with Expo Go app (iOS/Android)
3. App runs on your phone in real-time
4. Changes hot-reload instantly

**Pros**: Instant testing, no build required
**Cons**: Only for development, not production-ready

---

### Option 2: GitHub + Expo EAS (Recommended - Production)
**Best for**: Publishing a production app that others can use

**Steps**:
1. Push code to GitHub
2. Use Expo EAS (Expo Application Services) to build
3. Generate iOS/Android apps automatically
4. Distribute via App Store, Google Play, or direct link

**Pros**: Production-quality apps, automatic builds, easy distribution
**Cons**: Requires Expo account (free tier available), build time ~10-15 min

**Cost**: Free tier includes 30 builds/month

---

### Option 3: Web Browser (Recommended - Easiest for Others)
**Best for**: Sharing with non-technical users

**Steps**:
1. Run `pnpm dev` (includes web bundling)
2. Access at `http://localhost:8081`
3. Deploy to Vercel, Netlify, or GitHub Pages
4. Share public URL

**Pros**: No app installation needed, works on any device with browser
**Cons**: Limited to web features (no native APIs like camera)

---

### Option 4: Standalone GitHub Repository
**Best for**: Open-source contribution

**Steps**:
1. Create public GitHub repo
2. Add comprehensive README with setup instructions
3. Users clone and run locally with `pnpm install && pnpm dev`
4. Include CI/CD workflows for automated testing

**Pros**: Community can contribute, transparent development
**Cons**: Users need Node.js/pnpm installed locally

---

## Recommended Approach for Site Auditor Pro

**Tier 1 - Immediate (Week 1)**:
- ✓ GitHub repository (public)
- ✓ Comprehensive README with setup instructions
- ✓ Web version deployed to Vercel (free)
- ✓ Share web URL with users

**Tier 2 - Medium-term (Week 2-3)**:
- Mobile apps via Expo EAS (iOS/Android)
- GitHub Releases with app download links
- Docker container for self-hosting

**Tier 3 - Long-term (Month 2+)**:
- Official website with landing page
- API for programmatic access
- SaaS version with user accounts

---

## Quick Start for Users

### Running Locally
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

### Using Web Version
```bash
# Just visit the deployed URL (no installation needed)
https://site-auditor-pro.vercel.app
```

### Using Mobile App
```bash
# Option A: Expo Go (development)
1. Download Expo Go from App Store/Play Store
2. Scan QR code from `pnpm dev` output

# Option B: Standalone App (production)
1. Download from GitHub Releases
2. Install on iOS/Android
```

---

## GitHub Publishing Checklist

- [ ] Create public GitHub repository
- [ ] Add comprehensive README.md
- [ ] Add LICENSE (MIT recommended)
- [ ] Add CONTRIBUTING.md for contributors
- [ ] Add .gitignore (ignore node_modules, .env)
- [ ] Create GitHub Actions CI/CD workflow
- [ ] Add GitHub Releases with version tags
- [ ] Deploy web version to Vercel/Netlify
- [ ] Create GitHub Pages documentation site
- [ ] Set up issue templates
- [ ] Add code of conduct

---

## Environment Variables

Users will need to set up `.env.local`:

```env
# Optional: For backend features
DATABASE_URL=postgresql://...
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For most users, the app works without any environment variables.

---

## Performance Considerations

- **Web**: ~2MB bundle size (optimized)
- **Mobile**: ~40MB app size (includes React Native runtime)
- **Load time**: <2 seconds on 4G
- **Offline support**: Partial (audit history cached locally)

---

## Security Notes

- All audits run client-side (no data sent to servers)
- Website HTML is fetched via CORS (may require CORS proxy for some sites)
- No user data collected or stored
- No authentication required

---

## Support & Documentation

- **README**: Setup and basic usage
- **CONTRIBUTING.md**: How to contribute
- **API Docs**: Inline TypeScript comments
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Community Q&A

---

## Next Steps

1. **Today**: Set up GitHub repository
2. **Tomorrow**: Deploy web version to Vercel
3. **This week**: Build mobile apps with Expo EAS
4. **Next week**: Create comprehensive documentation
5. **Ongoing**: Gather user feedback and iterate
