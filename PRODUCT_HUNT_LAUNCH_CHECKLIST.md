# Product Hunt Launch Checklist

## Pre-Launch (1-2 Weeks Before)

### Product Preparation
- [x] App is live and working (https://site-auditor-pro-nine.vercel.app/)
- [x] All major features implemented
- [x] Dark mode as default
- [x] CSS variable previewer fixed
- [x] Dual-mode contrast analysis working
- [x] Bootstrap detection implemented
- [ ] Custom domain (optional but recommended)
- [ ] Analytics setup (Google Analytics, Plausible, or similar)
- [ ] Error tracking (Sentry or similar)

### Content Creation
- [x] Blog post written (site-auditor-pro-launch.php)
- [x] Product Hunt guide created (PRODUCT_HUNT_GUIDE.md)
- [x] 5-slide presentation created
- [x] README updated with marketing content
- [ ] Demo video (2-3 minutes, showing key features)
- [ ] Screenshots (5-7 high-quality images)
- [ ] Product Hunt tagline (max 60 characters)
- [ ] Product Hunt description (max 260 characters)

### Assets Needed for Product Hunt
1. **Product Icon** (240x240px PNG)
2. **Gallery Images** (1270x760px, 5-7 images)
3. **Thumbnail** (240x240px PNG, optional)
4. **Demo Video** (YouTube/Vimeo link or upload)

### Social Media Prep
- [ ] Twitter thread prepared
- [ ] LinkedIn post drafted
- [ ] Facebook post drafted
- [ ] Reddit posts planned (r/webdev, r/accessibility, r/SideProject)
- [ ] Dev.to article published
- [ ] Hacker News post planned

## Launch Day

### Morning (Before 12:01 AM PST)
- [ ] Final testing of all features
- [ ] Prepare Product Hunt submission
- [ ] Schedule social media posts
- [ ] Alert friends/supporters

### 12:01 AM PST - Submit to Product Hunt
- [ ] Submit product
- [ ] Add tagline: "Audit light & dark mode accessibility in seconds"
- [ ] Add description (see below)
- [ ] Upload gallery images
- [ ] Add demo video
- [ ] Set topics: Developer Tools, Productivity, Design Tools, Accessibility
- [ ] Add maker comment (first comment)

### Throughout the Day (12 AM - 11:59 PM PST)
- [ ] Respond to every comment within 30 minutes
- [ ] Post updates on social media every 2-3 hours
- [ ] Share on Twitter, LinkedIn, Facebook
- [ ] Post on Reddit (r/webdev, r/SideProject)
- [ ] Email supporters asking for upvotes
- [ ] Engage with other launches (upvote, comment)
- [ ] Monitor analytics

### Evening (6-10 PM PST)
- [ ] Final push on social media
- [ ] Thank everyone who supported
- [ ] Celebrate! 🎉

## Post-Launch (Next Day)

- [ ] Thank you post on social media
- [ ] Analyze results (upvotes, traffic, signups)
- [ ] Follow up with commenters
- [ ] Implement quick feedback
- [ ] Write post-mortem blog post

---

## Product Hunt Copy

### Tagline (60 char max)
"Audit light & dark mode accessibility in seconds"

### Description (260 char max)
"The only free tool that audits both light AND dark mode for WCAG compliance. Extract CSS variables, get color fix suggestions, and customize themes with live preview. Built for developers who ship accessible websites."

### Maker Comment (First Comment)
```
Hey Product Hunt! 👋

I'm Jenni, and I built Site Auditor Pro because I was frustrated with existing accessibility tools.

**The Problem:**
Most audit tools only check light mode, completely ignoring dark mode. With 85% of developers preferring dark mode and modern websites supporting both themes, this is a huge blind spot.

**The Solution:**
Site Auditor Pro is the only free tool that:
✅ Audits BOTH light and dark mode automatically
✅ Detects Bootstrap, Tailwind, and @media dark mode patterns
✅ Provides 3 specific color alternatives for every issue
✅ Lets you customize CSS variables with live preview
✅ Exports modified themes instantly

**Who It's For:**
- Web developers building accessible sites
- UI/UX designers testing color palettes
- Agencies auditing client sites
- Anyone who needs WCAG compliance

**Try it now (no signup required):**
https://site-auditor-pro-nine.vercel.app/

I'd love your feedback! What features would you like to see next?

P.S. It's 100% free and open source: https://github.com/jenninexus/site-auditor-pro
```

---

## Social Media Posts

### Twitter Thread
```
🚀 Launching Site Auditor Pro on @ProductHunt today!

The only free tool that audits BOTH light & dark mode for WCAG compliance.

Here's why I built it 🧵👇

1/ Most accessibility tools only check light mode.

But 85% of developers prefer dark mode, and modern websites support both themes.

This creates a huge blind spot in accessibility testing.

2/ I was auditing my own site (jenninexus.com) which uses Bootstrap 5.3 dark mode.

Every tool missed half the issues because they couldn't detect dark mode colors.

I had to manually toggle themes and compare contrast ratios. Tedious!

3/ So I built Site Auditor Pro to solve this:

✅ Dual-mode contrast analysis
✅ Bootstrap/Tailwind/CSS detection
✅ Color fix suggestions (3 per issue)
✅ Live CSS variable editor
✅ Export modified themes

4/ It's 100% free, no signup required, and open source.

Try it: https://site-auditor-pro-nine.vercel.app/

Support on Product Hunt: [PH LINK]

What do you think? 🤔
```

### LinkedIn Post
```
🚀 Excited to launch Site Auditor Pro!

After months of development, I'm proud to share a tool that solves a real problem I faced as a web developer.

**The Challenge:**
Existing accessibility audit tools only check light mode, ignoring the fact that 85% of developers prefer dark mode and most modern websites support both themes.

**The Solution:**
Site Auditor Pro is the first free tool that audits BOTH light and dark mode for WCAG compliance, providing:

• Dual-mode contrast analysis
• Specific color fix suggestions
• Live CSS variable editor
• Bootstrap/Tailwind detection
• Instant theme export

**Why It Matters:**
With WCAG 2.1 AA becoming a legal requirement and users expecting both light and dark modes, developers need tools that make compliance easy, not painful.

Try it free (no signup): https://site-auditor-pro-nine.vercel.app/

We're launching on Product Hunt today - would love your support: [PH LINK]

#WebDevelopment #Accessibility #WCAG #DeveloperTools #ProductLaunch
```

### Reddit r/webdev Post
```
Title: [Showoff Saturday] I built Site Auditor Pro - the only free tool that audits both light AND dark mode for WCAG compliance

Hey r/webdev!

I just launched Site Auditor Pro and wanted to share it with you all.

**What it does:**
- Audits both light and dark mode automatically
- Detects Bootstrap, Tailwind, and @media dark mode patterns
- Provides specific color alternatives for every WCAG issue
- Lets you customize CSS variables with live preview
- Exports modified themes instantly

**Why I built it:**
I was auditing my own Bootstrap 5.3 site and realized every tool only checked light mode. I had to manually toggle themes and compare contrast ratios. It was tedious and error-prone.

**Tech stack:**
- Expo + React Native Web
- TypeScript
- TailwindCSS
- Vercel

**Try it:** https://site-auditor-pro-nine.vercel.app/ (no signup required)

**GitHub:** https://github.com/jenninexus/site-auditor-pro

Would love your feedback! What features would you like to see next?
```

---

## Metrics to Track

### Product Hunt
- Upvotes (goal: 100+)
- Comments (goal: 20+)
- Ranking (goal: Top 5 of the day)

### Website
- Unique visitors (goal: 1,000+)
- Audits performed (goal: 500+)
- Time on site (goal: 2+ minutes)
- Bounce rate (goal: <60%)

### Social
- Twitter impressions (goal: 10,000+)
- LinkedIn views (goal: 5,000+)
- Reddit upvotes (goal: 50+ per post)

### GitHub
- Stars (goal: 50+)
- Forks (goal: 10+)
- Issues/PRs (goal: 5+)

---

## Follow-Up Actions

### Week 1
- Respond to all feedback
- Fix critical bugs
- Implement quick wins
- Thank supporters

### Week 2
- Write post-mortem blog post
- Share results on social media
- Plan next features based on feedback
- Reach out to press/blogs

### Month 1
- Implement top-requested features
- Build email list
- Plan monetization (Pro tier)
- Prepare for next launch (v2.0)

---

## Hunter Tips

### Best Practices
- Launch on Tuesday, Wednesday, or Thursday
- Submit at 12:01 AM PST
- Respond to EVERY comment
- Engage with other launches
- Share on social media throughout the day
- Ask friends/supporters for upvotes (but don't spam)

### What NOT to Do
- Don't buy upvotes (you'll get banned)
- Don't spam people asking for votes
- Don't ignore comments
- Don't launch on Monday or Friday
- Don't submit multiple products same day

---

## Resources

- **Product Hunt Guide:** PRODUCT_HUNT_GUIDE.md
- **Blog Post:** site-auditor-pro-launch.php
- **Presentation:** /home/ubuntu/site_auditor_presentation/
- **README:** README.md
- **Live App:** https://site-auditor-pro-nine.vercel.app/
- **GitHub:** https://github.com/jenninexus/site-auditor-pro

---

Good luck! 🚀
