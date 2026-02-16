# Git & Netlify Setup Guide for NBA Predictor

## Status: Git Repository Initialized ✅

Your local repository is ready! The initial commit has been made with all your code.

```
Commit: d7cf735
Message: "Initial commit: NBA Predictor web app"
```

## Next Steps: Authenticate with GitHub

### Option 1: Using GitHub CLI (Recommended)

1. **Authenticate with GitHub:**
   ```bash
   gh auth login
   ```
   - Choose `GitHub.com` when prompted
   - Choose `HTTPS` for authentication protocol
   - Follow the browser prompt to authorize

2. **Once authenticated, create the repository:**
   ```bash
   cd /home/kindlingai/nba-predictor-webapp
   gh repo create nba-predictor-webapp --public --source=. --push
   ```

### Option 2: Manual GitHub Setup (If `gh` is unavailable)

1. **Create repository manually on GitHub:**
   - Go to https://github.com/new
   - Name: `nba-predictor-webapp`
   - Description: "NBA game prediction web app with Vite + React"
   - Make it **Public**
   - Do NOT initialize with README
   - Click "Create repository"

2. **Add remote and push:**
   ```bash
   cd /home/kindlingai/nba-predictor-webapp
   git remote add origin https://github.com/YOUR_USERNAME/nba-predictor-webapp.git
   git branch -M main
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your actual GitHub username)

## After GitHub Repository is Created

### Connect Netlify to GitHub (Auto-Deploy)

1. **Log in to Netlify:**
   - Visit: https://app.netlify.com
   - Go to your site: https://nba-predictor-kindling.netlify.app

2. **Connect to GitHub repository:**
   - Settings → Build & Deploy → Repository
   - Click "Connect to Git"
   - Authorize Netlify with GitHub
   - Select your repository: `nba-predictor-webapp`
   - Confirm build settings (should auto-detect)

3. **Enable auto-deploy:**
   - Ensure "Branch to deploy" is set to `main`
   - Save settings
   - Now every push to `main` will auto-deploy!

## Verification: Test the Workflow

Once GitHub and Netlify are connected:

1. **Make a small test change:**
   ```bash
   cd /home/kindlingai/nba-predictor-webapp
   # Edit a file or just add a version update
   echo "v1.0.0" > VERSION.txt
   git add VERSION.txt
   git commit -m "Add version file for testing"
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Check Netlify:**
   - Visit: https://app.netlify.com/sites/nba-predictor-kindling/deploys
   - You should see a new deploy starting automatically
   - Wait for it to complete (usually 1-2 minutes)
   - Verify the live site: https://nba-predictor-kindling.netlify.app

## Workflow for Future Changes

```
1. Edit your code locally
2. Commit: git commit -m "your message"
3. Push: git push origin main
4. Netlify auto-deploys (1-2 min)
5. Check live site at https://nba-predictor-kindling.netlify.app
```

## Share with Your Friend

Once the GitHub repository is created, share this link:
```
https://github.com/YOUR_USERNAME/nba-predictor-webapp
```

They can now:
- View your code
- Clone it locally
- Follow the contributions flow

---

**Questions?** Let me know if you need help with any step!
