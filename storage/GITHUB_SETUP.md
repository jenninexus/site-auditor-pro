# GitHub Publishing Guide

Complete step-by-step instructions to publish Site Auditor Pro to GitHub and deploy to Vercel.

---

## Step 1: Create GitHub Repository

### 1.1 Create New Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `site-auditor-pro`
3. **Description**: "Comprehensive website auditing tool for CSS, JavaScript, and accessibility"
4. **Visibility**: Public (so others can use it)
5. **Initialize**: Don't add README (we have one)
6. Click **Create repository**

### 1.2 Push Code to GitHub

```bash
cd /path/to/site-auditor-app

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Site Auditor Pro v1.0"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/site-auditor-pro.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

---

## Step 2: Deploy to Vercel (Recommended)

### 2.1 Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign up** → Choose **GitHub**
3. Authorize Vercel to access your GitHub account
4. Click **Import Project**
5. Select your `site-auditor-pro` repository

### 2.2 Configure Vercel Deployment

1. **Project Name**: `site-auditor-pro`
2. **Framework**: Select **Expo**
3. **Root Directory**: `./` (default)
4. **Build Command**: `pnpm build`
5. **Output Directory**: `dist`
6. Click **Deploy**

**Vercel will automatically:**
- Build your app
- Run tests
- Deploy to CDN
- Give you a live URL

### 2.3 Access Your Deployed App

After deployment completes:
- **Production URL**: `https://site-auditor-pro.vercel.app`
- **Share this link** — Anyone can use it!

---

## Step 3: Setup Continuous Deployment

### 3.1 Enable Auto-Deployment

Vercel automatically deploys when you push to `main`:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically builds and deploys
# Check deployment at vercel.com/deployments
```

### 3.2 Preview Deployments

Every pull request gets a preview URL:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git push origin feature/new-feature

# Create pull request on GitHub
# Vercel posts preview URL as comment
```

---

## Step 4: Setup GitHub Actions (Optional)

### 4.1 Add Test Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
```

### 4.2 Add Lint Workflow

Create `.github/workflows/lint.yml`:

```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
```

---

## Step 5: Setup Repository Settings

### 5.1 Protect Main Branch

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. **Branch name pattern**: `main`
4. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Dismiss stale pull request approvals
5. Click **Create**

### 5.2 Add Topics

1. Go to **Settings** → **General**
2. Under **Topics**, add:
   - `website-audit`
   - `css-analyzer`
   - `accessibility`
   - `wcag`
   - `react-native`
   - `expo`

### 5.3 Add Description & Links

1. Go to **Settings** → **General**
2. **Description**: "Website auditing tool for CSS, JavaScript, and accessibility"
3. **Website**: `https://site-auditor-pro.vercel.app`

---

## Step 6: Create Release

### 6.1 Tag Version

```bash
# Create version tag
git tag -a v1.0.0 -m "Release v1.0.0: Initial public release"

# Push tag to GitHub
git push origin v1.0.0
```

### 6.2 Create Release on GitHub

1. Go to **Releases** → **Create a new release**
2. **Tag**: `v1.0.0`
3. **Title**: `Site Auditor Pro v1.0.0`
4. **Description**:
   ```
   ## Features
   - Color contrast analysis (WCAG 2.1)
   - CSS consistency audit
   - JavaScript quality checks
   - Batch export (CSS, JSON, Figma tokens)
   
   ## Links
   - [Live App](https://site-auditor-pro.vercel.app)
   - [Documentation](README.md)
   - [Report Bug](https://github.com/YOUR_USERNAME/site-auditor-pro/issues)
   ```
5. Click **Publish release**

---

## Step 7: Share & Promote

### 7.1 Share Links

**Direct to users:**
- 🔗 **Live App**: `https://site-auditor-pro.vercel.app`
- 📖 **GitHub**: `https://github.com/YOUR_USERNAME/site-auditor-pro`
- 🐛 **Issues**: `https://github.com/YOUR_USERNAME/site-auditor-pro/issues`

### 7.2 Add Badges to README

```markdown
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-blue?logo=vercel)](https://site-auditor-pro.vercel.app)
[![GitHub](https://img.shields.io/badge/Code-GitHub-black?logo=github)](https://github.com/YOUR_USERNAME/site-auditor-pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
```

### 7.3 Promote

- Share on Twitter/X
- Post on Reddit (r/reactnative, r/webdev)
- Add to Product Hunt
- Share in dev communities

---

## Step 8: Maintenance

### 8.1 Regular Updates

```bash
# Pull latest changes
git pull origin main

# Make improvements
# Add features
# Fix bugs

# Commit and push
git add .
git commit -m "Improve feature X"
git push origin main

# Vercel auto-deploys
```

### 8.2 Handle Issues

```bash
# Create issue branch
git checkout -b fix/issue-123

# Make fix
# Test locally: pnpm test

# Push and create PR
git push origin fix/issue-123

# On GitHub: Create pull request
# After review: Merge to main
# Vercel auto-deploys
```

### 8.3 Release New Versions

```bash
# Update version in package.json
# Update CHANGELOG.md

git add .
git commit -m "Bump version to v1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main
git push origin v1.1.0

# Create release on GitHub
```

---

## Troubleshooting

### Vercel Build Fails

**Check logs:**
1. Go to vercel.com → Your project
2. Click **Deployments**
3. Click failed deployment
4. Scroll to **Build logs**

**Common issues:**
- Missing dependencies: `pnpm install`
- TypeScript errors: `pnpm check`
- Test failures: `pnpm test`

### GitHub Push Fails

```bash
# Update local repo
git pull origin main

# Resolve conflicts if any
# Then push again
git push origin main
```

### Deployment Takes Too Long

- First build: 2-3 minutes (normal)
- Subsequent builds: 30-60 seconds
- Check Vercel logs for bottlenecks

---

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Deploy to Vercel
3. ✅ Setup GitHub Actions
4. ✅ Create first release
5. → Share with community
6. → Collect feedback
7. → Plan v1.1 features

---

## Resources

- [Vercel Docs](https://vercel.com/docs)
- [GitHub Docs](https://docs.github.com)
- [Expo Deployment](https://docs.expo.dev/build-reference/deploying/)
- [React Native Best Practices](https://reactnative.dev/docs/performance)

---

**Your app is now live and ready for the world!** 🚀
