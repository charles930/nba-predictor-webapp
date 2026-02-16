# 🏀 NBA Predictor - Setting Up Live Data

## Quick Start (2 minutes)

### Step 1: Get a BallDontLie API Key

1. Go to https://app.balldontlie.io/auth/signup
2. Create a free account (no credit card required)
3. After login, go to Account Settings → API section
4. Copy your API key

### Step 2: Configure Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select the `nba-predictor-kindling` site
3. Go to **Settings** → **Environment** (or **Build & Deploy** → **Environment**)
4. Click **Edit variables**
5. Add this variable:
   - **Key:** `BALLDONTLIE_API_KEY`
   - **Value:** (paste your API key from Step 1)
6. Save

### Step 3: Redeploy

1. Go to the **Deploys** tab in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the deploy to complete (usually 1-2 minutes)

**Done!** Your app now uses real NBA data. 🎉

---

## Verification

After deploying, check that real data is being used:

1. Open https://nba-predictor-kindling.netlify.app
2. Open browser DevTools (F12 or right-click → Inspect)
3. Go to **Console** tab
4. Look for messages like:
   - `[REAL DATA] Fetching games from BallDontLie API...`
   - `[REAL DATA] Successfully fetched X games from BallDontLie`

If you see these messages, **real data is working!** ✅

---

## Troubleshooting

### Issue: Still seeing [MOCK DATA]

**Solution:**
1. Check that the API key was pasted correctly in Netlify
2. Trigger a new deploy in Netlify
3. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
4. Check console again

### Issue: "Unauthorized" error

**Solution:**
1. Verify the API key is correct (copy-paste from https://app.balldontlie.io)
2. Make sure the account is active and not suspended
3. Check that you're using the right API key (not from a different service)

### Issue: Getting timeout errors

**Solution:**
1. This is normal on first load (API takes ~1-2 seconds)
2. Data is cached for 5 minutes after first load
3. If persistent, check your internet connection

---

## Advanced: Using The Odds API (Optional)

To get real betting odds instead of mock odds:

1. Go to https://the-odds-api.com
2. Sign up for a free account
3. Get your API key from your dashboard
4. Add it to Netlify environment variables:
   - **Key:** `ODDS_API_KEY`
   - **Value:** (your API key)
5. Trigger a new deploy

---

## How It Works

### Architecture
```
Frontend (React)
    ↓
Netlify Serverless Functions
    ↓
BallDontLie API (Real NBA Data)
```

### Data Flow
1. App requests games for a specific date
2. Netlify function checks cache first
3. If not cached, fetches from BallDontLie API using your API key
4. Results are cached for 5 minutes
5. Subsequent requests get instant cached data

### Fallback Strategy
- If API key is not configured → uses mock data
- If API call fails → uses mock data as fallback
- Cache is always checked first to reduce API calls

---

## API Keys Security

### Local Development (.env)
```bash
# For local development only
BALLDONTLIE_API_KEY=your_local_key_here
```
- This file is in `.gitignore` (never committed to GitHub)
- Only you see this on your machine

### Production (Netlify)
```
Environment Variable: BALLDONTLIE_API_KEY
```
- Stored securely in Netlify
- Only visible to authorized users
- Injected at build time
- Not exposed in client-side code

### Best Practices
1. ✅ Always use environment variables (never hardcode)
2. ✅ Keep API keys out of git (use .gitignore)
3. ✅ Use different keys for dev/prod if possible
4. ✅ Regenerate keys if accidentally exposed

---

## Performance

### With Real Data (BallDontLie API)
- First request: ~1-2 seconds (API call)
- Subsequent requests: <100ms (cached)
- Cache duration: 5 minutes
- Accuracy: 100% real NBA data

### Cost
- **Free tier:** 1000+ requests/month ✅
- Your app uses ~10-20 requests per session
- Perfect for personal projects

---

## API Limits

### BallDontLie (FREE tier)
- Rate limit: 1000+ requests/month
- This app uses: ~5-10 requests per session
- **Plenty of room!** ✅

### The Odds API (FREE tier)
- Rate limit: 500 requests/month
- Only needed if you want real odds
- Optional - app works fine with mock odds

---

## Support

- **BallDontLie Docs:** https://balldontlie.io/api
- **The Odds API Docs:** https://the-odds-api.com/
- **This Project Issues:** https://github.com/charles930/nba-predictor-webapp

---

**Status:** ✅ App ready for real data  
**Last Updated:** February 2026  
**Charles:** Just add the API key and your app goes live with real NBA data! 🚀
