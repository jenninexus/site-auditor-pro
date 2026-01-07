<?php
$activePage = 'blog';
$pageTitle = 'Launching Site Auditor Pro: A Developer Tool for Accessible, Beautiful Websites | JenniNexus Blog';
$pageDescription = 'Introducing Site Auditor Pro - the only free tool that audits both light and dark mode accessibility, extracts CSS variables, and helps you build WCAG-compliant websites faster.';
$pageKeywords = 'web development, accessibility, WCAG, dark mode, CSS variables, site auditor, developer tools';

// Define RES_ROOT for blog subdirectory
if (!defined('RES_ROOT')) {
  define('RES_ROOT', '/resources');
}
?>
<!doctype html>
<html lang="en" data-bs-theme="dark">
<?php include '../includes/head.php'; ?>
<body>
  
  <?php include '../includes/header.php'; ?>

  <!-- Blog Post Content -->
  <article class="py-5 section-pastel">
    <div class="container">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <!-- Post Header -->
          <header class="mb-5">
            <div class="mb-3">
              <span class="badge bg-primary">Web Development</span>
              <span class="badge bg-success">Product Launch</span>
              <span class="text-muted ms-2">January 6, 2026</span>
            </div>
            <h1 class="display-4 mb-4">Launching Site Auditor Pro: A Developer Tool for Accessible, Beautiful Websites</h1>
            <p class="lead text-muted">Introducing Site Auditor Pro - the only free tool that audits both light and dark mode accessibility, extracts CSS variables, and helps you build WCAG-compliant websites faster.</p>
            <hr>
          </header>

          <!-- Post Body -->
          <div class="post-content glass-card p-4 rounded-4">
            <h2>Why I Built This</h2>
            <p>As a developer who builds websites and applications, I've always been frustrated by the accessibility audit process. Most tools only check your site in <strong>one mode</strong> - usually light mode - completely ignoring the fact that <strong>85% of developers prefer dark mode</strong>, and modern websites need to look good in both.</p>
            
            <p>I was auditing my own site, <strong>jenninexus.com</strong>, which uses <strong>Bootstrap 5.3</strong> with <code>data-bs-theme</code> for dark mode switching. Every existing tool would miss half the issues because they couldn't detect dark mode colors. I'd have to manually toggle themes, take screenshots, and compare contrast ratios by hand. It was tedious, error-prone, and honestly... annoying.</p>

            <p>So I built <strong>Site Auditor Pro</strong> to solve this problem - for myself, and for every developer who's ever shipped a website with dark mode.</p>

            <h2>What Makes It Different</h2>
            <p>Site Auditor Pro isn't just another accessibility checker. Here's what makes it unique:</p>

            <h3>1. Dual-Mode Contrast Analysis</h3>
            <p><strong>The only free tool that audits both light AND dark mode automatically.</strong></p>
            <ul>
              <li>Detects <code>@media (prefers-color-scheme: dark)</code> CSS rules</li>
              <li>Recognizes Bootstrap's <code>[data-bs-theme="dark"]</code> pattern</li>
              <li>Identifies Tailwind's <code>.dark</code> class approach</li>
              <li>Provides separate WCAG AA/AAA compliance reports for each mode</li>
              <li>Shows exactly which colors fail in which mode</li>
            </ul>

            <h3>2. Color Fix Suggestions</h3>
            <p>Unlike tools that just tell you "this fails," Site Auditor Pro gives you <strong>3 specific color alternatives</strong> for every issue:</p>
            <ul>
              <li>Calculated contrast ratios for each suggestion</li>
              <li>WCAG level indicators (AA/AAA)</li>
              <li>Actionable descriptions you can copy-paste</li>
            </ul>

            <h3>3. Live CSS Variable Editor</h3>
            <p>The coolest feature: <strong>customize your site's colors in real-time</strong>.</p>
            <ul>
              <li>Extracts CSS variables from any website</li>
              <li>Separate editors for light and dark mode</li>
              <li>Color pickers with live preview</li>
              <li>Export modified Bootstrap themes</li>
              <li>Download customized CSS instantly</li>
            </ul>

            <h3>4. Comprehensive Auditing</h3>
            <p>Beyond accessibility, it checks:</p>
            <ul>
              <li><strong>CSS Quality</strong> - fragmentation, naming patterns, optimization opportunities</li>
              <li><strong>JavaScript Analysis</strong> - duplicates, bundle size, code quality</li>
              <li><strong>Performance Scoring</strong> - overall site health</li>
              <li><strong>Code Auto-Fix</strong> - suggests improvements for JS issues</li>
            </ul>

            <p class="mb-3">
              <a href="https://site-auditor-pro-nine.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
                <i class="fa-solid fa-rocket me-2"></i>Try Site Auditor Pro (Free)
              </a>
            </p>

            <h2>How It Works</h2>
            <p>Using Site Auditor Pro is dead simple:</p>
            <ol>
              <li><strong>Enter any website URL</strong> - yours or anyone else's</li>
              <li><strong>Click "Audit Website"</strong> - analysis takes ~10 seconds</li>
              <li><strong>Review the reports</strong> - CSS, JS, accessibility, contrast</li>
              <li><strong>Click "Preview & Customize"</strong> - edit colors with live preview</li>
              <li><strong>Export your changes</strong> - download CSS or copy Bootstrap theme</li>
            </ol>

            <h2>Built With Modern Tech</h2>
            <p>Site Auditor Pro is built with:</p>
            <ul>
              <li><strong>Expo + React Native Web</strong> - for cross-platform compatibility</li>
              <li><strong>TypeScript</strong> - type-safe, maintainable code</li>
              <li><strong>TailwindCSS</strong> - beautiful, responsive design</li>
              <li><strong>Vercel</strong> - instant deployment, global CDN</li>
              <li><strong>WCAG 2.1 Standards</strong> - industry-standard compliance</li>
            </ul>

            <h2>Who Is This For?</h2>
            <ul>
              <li><strong>Web Developers</strong> - building accessible sites faster</li>
              <li><strong>UI/UX Designers</strong> - testing color palettes for compliance</li>
              <li><strong>Agencies</strong> - auditing client sites before launch</li>
              <li><strong>Indie Hackers</strong> - shipping compliant products solo</li>
              <li><strong>Accessibility Advocates</strong> - ensuring the web is usable for everyone</li>
            </ul>

            <h2>What's Next</h2>
            <p>This is just v1.0. Here's what's coming:</p>
            <ul>
              <li><strong>User Accounts</strong> - save audit history</li>
              <li><strong>API Access</strong> - integrate into CI/CD pipelines</li>
              <li><strong>Scheduled Audits</strong> - monitor sites over time</li>
              <li><strong>Team Collaboration</strong> - share reports with clients</li>
              <li><strong>Browser Extension</strong> - audit any page with one click</li>
            </ul>

            <h2>Try It Now (It's Free!)</h2>
            <p>Site Auditor Pro is <strong>100% free</strong> and requires no signup. Just visit the site and start auditing.</p>

            <p>I built this tool because I needed it. If you've ever struggled with accessibility audits, dark mode testing, or WCAG compliance, I think you'll find it useful too.</p>

            <p class="mb-3">
              <a href="https://site-auditor-pro-nine.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">
                <i class="fa-solid fa-rocket me-2"></i>Launch Site Auditor Pro
              </a>
            </p>

            <h2>Open Source & Contributing</h2>
            <p>The project is open source on GitHub. If you're interested in contributing, have feature requests, or find bugs, feel free to open an issue or submit a PR.</p>

            <p class="mb-3">
              <a href="https://github.com/jenninexus/site-auditor-pro" target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary">
                <i class="fa-brands fa-github me-2"></i>View on GitHub
              </a>
            </p>

            <h2>Final Thought</h2>
            <p>Accessibility isn't optional anymore. With legal requirements like <strong>WCAG 2.1 AA</strong> becoming standard, and users expecting both light and dark modes, developers need tools that make compliance easy, not painful.</p>

            <p>Site Auditor Pro is my contribution to making the web more accessible, one audit at a time.</p>

            <p>Here's to building beautiful, accessible websites that work for everyone.</p>

            <p class="mt-4">
              <em>— Jenni Nexus<br>
              January 6, 2026</em>
            </p>
          </div>

          <!-- Recommended Posts -->
          <div class="mt-5 pt-4 border-top">
            <h3 class="h5 mb-4">You Might Also Like</h3>
            <div class="row g-3">
              <!-- AI Tools Post -->
              <div class="col-md-4">
                <a href="ai-tools-using-ai.php" class="text-decoration-none">
                  <div class="glass-card h-100 hover-lift">
                    <img src="<?= RES_ROOT ?>/images/ai/robo-jenni_2.jpg" class="card-img-top" alt="AI Tools" style="height: 150px; object-fit: cover;">
                    <div class="card-body">
                      <h5 class="card-title h6">Using AI Tools</h5>
                      <p class="card-text small text-muted">How I use Claude Sonnet 4.5, VS Code, Unity Muse, and AI to code, design, and publish faster.</p>
                      <span class="badge bg-secondary">AI</span>
                      <span class="badge bg-secondary">Productivity</span>
                    </div>
                  </div>
                </a>
              </div>

              <!-- Game Dev Post -->
              <div class="col-md-4">
                <a href="game-dev-in-2025.php" class="text-decoration-none">
                  <div class="glass-card h-100 hover-lift">
                    <img src="<?= RES_ROOT ?>/images/blog/game-dev-2025.jpg" class="card-img-top" alt="Game Dev 2025" style="height: 150px; object-fit: cover;">
                    <div class="card-body">
                      <h5 class="card-title h6">Game Development in 2025</h5>
                      <p class="card-text small text-muted">Trends, tools, and predictions for indie and AAA developers in the evolving game dev landscape.</p>
                      <span class="badge bg-secondary">Game Dev</span>
                      <span class="badge bg-secondary">Trends</span>
                    </div>
                  </div>
                </a>
              </div>

              <!-- Web Dev Post -->
              <div class="col-md-4">
                <a href="bootstrap-dark-mode-guide.php" class="text-decoration-none">
                  <div class="glass-card h-100 hover-lift">
                    <img src="<?= RES_ROOT ?>/images/blog/bootstrap-dark-mode.jpg" class="card-img-top" alt="Bootstrap Dark Mode" style="height: 150px; object-fit: cover;">
                    <div class="card-body">
                      <h5 class="card-title h6">Bootstrap 5.3 Dark Mode Guide</h5>
                      <p class="card-text small text-muted">Master Bootstrap's data-bs-theme attribute and build beautiful dark mode websites.</p>
                      <span class="badge bg-secondary">Web Dev</span>
                      <span class="badge bg-secondary">Bootstrap</span>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="mt-5">
            <a href="../tags.php?filters=webdev" class="badge bg-secondary me-1 text-decoration-none tag-badge">Web Dev</a>
            <a href="../tags.php?filters=accessibility" class="badge bg-secondary me-1 text-decoration-none tag-badge">Accessibility</a>
            <a href="../tags.php?filters=wcag" class="badge bg-secondary me-1 text-decoration-none tag-badge">WCAG</a>
            <a href="../tags.php?filters=darkmode" class="badge bg-secondary me-1 text-decoration-none tag-badge">Dark Mode</a>
            <a href="../tags.php?filters=tools" class="badge bg-secondary me-1 text-decoration-none tag-badge">Developer Tools</a>
            <a href="../tags.php?filters=bootstrap" class="badge bg-secondary me-1 text-decoration-none tag-badge">Bootstrap</a>
          </div>

          <!-- Share & Navigation -->
          <div class="mt-5 pt-4 border-top">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <a href="../blog.php" class="btn btn-outline-primary">
                <i class="fa-solid fa-arrow-left me-2"></i>Back to Blog
              </a>
              <div class="d-flex gap-2">
                <a href="https://twitter.com/intent/tweet?url=<?= urlencode('https://jenninexus.com/blog/site-auditor-pro-launch') ?>&text=<?= urlencode('Check out Site Auditor Pro - the only free tool that audits both light and dark mode accessibility!') ?>" target="_blank" class="btn btn-outline-secondary">
                  <i class="fa-brands fa-twitter"></i>
                </a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=<?= urlencode('https://jenninexus.com/blog/site-auditor-pro-launch') ?>" target="_blank" class="btn btn-outline-secondary">
                  <i class="fa-brands fa-facebook"></i>
                </a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=<?= urlencode('https://jenninexus.com/blog/site-auditor-pro-launch') ?>" target="_blank" class="btn btn-outline-secondary">
                  <i class="fa-brands fa-linkedin"></i>
                </a>
                <a href="https://www.producthunt.com/" target="_blank" class="btn btn-outline-warning">
                  <i class="fa-solid fa-rocket me-1"></i>Product Hunt
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </article>

  <?php include '../includes/footer.php'; ?>

  <!-- UI Effects -->
  <script src="<?= RES_ROOT ?>/js/ui-effects.js"></script>

</body>
</html>
