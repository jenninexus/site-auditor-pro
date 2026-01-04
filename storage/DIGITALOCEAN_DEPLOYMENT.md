# Deploy Site Auditor Pro to DigitalOcean

Complete guide to deploy Site Auditor Pro to your DigitalOcean droplet at `jenninexus.com/site-auditor`

---

## 🎯 How This Works

### The Architecture

```
GitHub Repository (Code Storage)
    ↓
Your DigitalOcean Droplet (Running App)
    ↓
jenninexus.com/site-auditor (User Access)
```

**Key Points:**
- **GitHub** = Your code repository (stays there, never changes)
- **DigitalOcean** = Where the app actually runs
- **jenninexus.com/site-auditor** = How users access it

**You can:**
- ✅ Update code on GitHub anytime
- ✅ Pull latest changes to your droplet
- ✅ Keep GitHub as backup
- ✅ Share code with others on GitHub

---

## Phase 1: Prepare Your DigitalOcean Droplet

### Step 1.1: SSH into Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
# Or if you have a domain configured:
ssh root@jenninexus.com
```

### Step 1.2: Check Node.js Installation

```bash
node --version
npm --version
```

**If not installed:**

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Verify
node --version
pnpm --version
```

### Step 1.3: Install Nginx (Reverse Proxy)

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

## Phase 2: Clone Repository to Droplet

### Step 2.1: Create App Directory

```bash
# Create directory for your app
mkdir -p /var/www/site-auditor-pro
cd /var/www/site-auditor-pro
```

### Step 2.2: Clone from GitHub

```bash
# Clone your repository
git clone https://github.com/jenninexus/site-auditor-pro.git .

# Verify files are there
ls -la
```

### Step 2.3: Install Dependencies

```bash
# Install all dependencies
pnpm install

# This takes 2-3 minutes
```

### Step 2.4: Build the App

```bash
# Build for production
pnpm build

# This creates the 'dist' folder with optimized code
```

---

## Phase 3: Setup Nginx Reverse Proxy

### Step 3.1: Create Nginx Configuration

Create a new file:

```bash
nano /etc/nginx/sites-available/site-auditor
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name jenninexus.com;

    # Route /site-auditor to the app
    location /site-auditor {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save the file:**
- Press `Ctrl + X`
- Press `Y` (yes)
- Press `Enter`

### Step 3.2: Enable the Configuration

```bash
# Create symlink to enable the site
ln -s /etc/nginx/sites-available/site-auditor /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Should output: "successful"
```

### Step 3.3: Reload Nginx

```bash
systemctl reload nginx
```

---

## Phase 4: Run the App

### Step 4.1: Start the App

```bash
cd /var/www/site-auditor-pro

# Start the app on port 3000
pnpm dev
```

**You should see:**
```
✓ Server running on http://localhost:3000
```

### Step 4.2: Keep App Running (Background)

The app will stop if you close the terminal. Use `pm2` to keep it running:

```bash
# Install pm2 globally
npm install -g pm2

# Start app with pm2
pm2 start "pnpm dev" --name "site-auditor"

# Make it start on reboot
pm2 startup
pm2 save
```

### Step 4.3: Verify App is Running

```bash
# Check if app is running
pm2 list

# Should show "site-auditor" with status "online"
```

---

## Phase 5: Test Your Deployment

### Step 5.1: Test Locally on Droplet

```bash
# From your droplet, test the app
curl http://localhost:3000

# Should return HTML of the app
```

### Step 5.2: Test from Your Computer

Open your browser and visit:
```
http://jenninexus.com/site-auditor
```

**You should see Site Auditor Pro running!**

---

## Phase 6: Update Code from GitHub

### Step 6.1: Pull Latest Changes

When you update code on GitHub, pull the changes to your droplet:

```bash
cd /var/www/site-auditor-pro

# Pull latest code from GitHub
git pull origin main

# Reinstall dependencies (if package.json changed)
pnpm install

# Rebuild the app
pnpm build

# Restart the app
pm2 restart site-auditor
```

### Step 6.2: Automate Updates (Optional)

Create a script to auto-pull changes:

```bash
# Create update script
cat > /var/www/site-auditor-pro/update.sh << 'EOF'
#!/bin/bash
cd /var/www/site-auditor-pro
git pull origin main
pnpm install
pnpm build
pm2 restart site-auditor
echo "Site Auditor Pro updated at $(date)"
EOF

# Make it executable
chmod +x /var/www/site-auditor-pro/update.sh

# Run manually anytime
/var/www/site-auditor-pro/update.sh
```

---

## Phase 7: Setup SSL/HTTPS (Recommended)

### Step 7.1: Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### Step 7.2: Get Free SSL Certificate

```bash
certbot --nginx -d jenninexus.com
```

**Follow the prompts:**
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS

### Step 7.3: Verify HTTPS Works

Visit:
```
https://jenninexus.com/site-auditor
```

**You should see a green lock icon!**

---

## 📊 Monitoring & Maintenance

### Check App Status

```bash
# View app logs
pm2 logs site-auditor

# View all running apps
pm2 list

# Restart app
pm2 restart site-auditor

# Stop app
pm2 stop site-auditor

# Start app
pm2 start "pnpm dev" --name "site-auditor"
```

### Monitor Droplet Resources

```bash
# Check CPU and memory usage
top

# Check disk space
df -h

# Check running processes
ps aux | grep node
```

### View Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### App Not Accessible at jenninexus.com/site-auditor

**Check 1: Is the app running?**
```bash
pm2 list
# Should show "site-auditor" with status "online"
```

**Check 2: Is Nginx configured correctly?**
```bash
nginx -t
# Should output "successful"
```

**Check 3: Check Nginx logs**
```bash
tail -f /var/log/nginx/error.log
```

**Check 4: Test locally**
```bash
curl http://localhost:3000
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 PID

# Or use a different port in Nginx config
```

### App Crashes After Reboot

Make sure pm2 is configured to start on boot:

```bash
pm2 startup
pm2 save
```

### Out of Memory

If your droplet runs out of memory:

```bash
# Check memory usage
free -h

# Upgrade droplet RAM in DigitalOcean dashboard
# Or optimize app (remove unnecessary features)
```

---

## Workflow: Code Changes

### When You Want to Update the App

**On your local computer:**

```bash
# Make changes to code
# Test locally: pnpm dev

# Commit and push to GitHub
git add .
git commit -m "Add new feature"
git push origin main
```

**On your DigitalOcean droplet:**

```bash
cd /var/www/site-auditor-pro

# Pull latest changes
git pull origin main

# Install any new dependencies
pnpm install

# Rebuild
pnpm build

# Restart app
pm2 restart site-auditor
```

**Or use the auto-update script:**

```bash
/var/www/site-auditor-pro/update.sh
```

---

## Quick Reference Commands

```bash
# SSH into droplet
ssh root@jenninexus.com

# Navigate to app
cd /var/www/site-auditor-pro

# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Build app
pnpm build

# Start app with pm2
pm2 start "pnpm dev" --name "site-auditor"

# View logs
pm2 logs site-auditor

# Restart app
pm2 restart site-auditor

# Stop app
pm2 stop site-auditor

# Check status
pm2 list

# View Nginx errors
tail -f /var/log/nginx/error.log
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Your Computer                         │
│  - Edit code locally                                     │
│  - Test with: pnpm dev                                   │
│  - Push to GitHub: git push origin main                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
         ┌───────────────────────────┐
         │   GitHub Repository       │
         │ (Code backup & sharing)   │
         └────────────┬──────────────┘
                      │
                      ↓
         ┌───────────────────────────┐
         │  DigitalOcean Droplet     │
         │  - Clone from GitHub      │
         │  - Run with pm2           │
         │  - Serve via Nginx        │
         └────────────┬──────────────┘
                      │
                      ↓
         ┌───────────────────────────┐
         │   jenninexus.com/         │
         │   site-auditor            │
         │ (User accesses here)      │
         └───────────────────────────┘
```

---

## Summary

**What you have:**
- ✅ Code on GitHub (backup & sharing)
- ✅ App running on your droplet
- ✅ Accessible at jenninexus.com/site-auditor
- ✅ Auto-starting with pm2
- ✅ HTTPS/SSL enabled
- ✅ Easy to update

**Cost:** $0 extra (uses your existing droplet)

**Next steps:**
1. SSH into droplet
2. Follow Phase 1-5 above
3. Test at jenninexus.com/site-auditor
4. Update code anytime by pushing to GitHub and pulling on droplet

---

**Questions? Let me know!** 🚀
