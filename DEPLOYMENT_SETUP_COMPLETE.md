# 🚀 NBA Predictor - Git & Continuous Deployment Setup

## ✅ Completed Tasks

### 1. Git Repository Initialized
- **Location:** `/home/kindlingai/nba-predictor-webapp/`
- **Status:** Ready with 2 commits
- **Remote:** Not yet connected (see instructions below)

```
Current commits:
  06bd2f0 Add Git setup and deployment guide
  d7cf735 Initial commit: NBA Predictor web app
```

### 2. `.gitignore` Updated
- Added environment files (`.env`, `.env.local`, etc.)
- Excludes `node_modules`, `dist`, and other build artifacts
- Ready for safe version control

### 3. Initial Code Committed
- All 44 source files committed
- `.env` file properly excluded from repo (only `.env.example` tracked)

---

## 📋 What Charles Needs to Do

### Step 1: Authenticate with GitHub (Required)
**Run this command:**
```bash
gh auth login
```

This will open a browser to authenticate. When complete, you'll have access to create repositories.

### Step 2: Create GitHub Repository
**Run this command:**
```bash
cd /home/kindlingai/nba-predictor-webapp
gh repo create nba-predictor-webapp --public --source=. --push
```

This will:
- Create a new public repository on your GitHub account
- Add it as a remote to your local repo
- Push all commits

**Your GitHub repo URL will be:**
```
https://github.com/YOUR_USERNAME/nba-predictor-webapp
```

### Step 3: Connect Netlify to GitHub
1. Go to https://app.netlify.com
2. Navigate to your site dashboard (https://nba-predictor-kindling.netlify.app)
3. Go to **Settings** → **Build & Deploy** → **Repository**
4. Click **Connect to Git**
5. Authorize Netlify with GitHub (if not already done)
6. Select the `nba-predictor-webapp` repository
7. Confirm build settings and save

### Step 4: Verify Auto-Deploy Works
Once Netlify is connected to GitHub:

```bash
cd /home/kindlingai/nba-predictor-webapp

# Make a test change
echo "v1.0.0 - Auto-deploy test" >> VERSION.txt

# Commit and push
git add VERSION.txt
git commit -m "Test auto-deploy"
git push origin main
```

Then check:
- Netlify deploy log: https://app.netlify.com/sites/nba-predictor-kindling/deploys
- Live site: https://nba-predictor-kindling.netlify.app
- Should see the new deploy automatically start!

---

## 🔄 Future Workflow

Once everything is connected:

```
1. Make changes to code
2. $ git add .
3. $ git commit -m "description"
4. $ git push origin main
   ↓
   Automatically triggers Netlify deploy
   ↓
5. Changes live at: https://nba-predictor-kindling.netlify.app
   (typically within 1-2 minutes)
```

---

## 📤 Share with Your Friend

Once the GitHub repo is created, share this URL:
```
https://github.com/YOUR_USERNAME/nba-predictor-webapp
```

They can:
- View your code
- Clone it to their machine
- See your commit history
- Follow improvements over time

---

## 📚 Reference Documents

- **Full Setup Guide:** `GIT_SETUP_GUIDE.md` (in this directory)
- **Live Site:** https://nba-predictor-kindling.netlify.app
- **Netlify Dashboard:** https://app.netlify.com/sites/nba-predictor-kindling

---

## 🎯 Key URLs

| Resource | URL |
|----------|-----|
| Live App | https://nba-predictor-kindling.netlify.app |
| Netlify Dashboard | https://app.netlify.com/sites/nba-predictor-kindling |
| GitHub (once created) | https://github.com/YOUR_USERNAME/nba-predictor-webapp |
| GitHub Deploys | https://app.netlify.com/sites/nba-predictor-kindling/deploys |

---

**Status: ✅ Local setup complete. Awaiting GitHub authentication and Netlify connection.**
