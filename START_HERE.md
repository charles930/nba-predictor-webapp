# 🚀 START HERE - NBA Predictor Real Data Setup (5 Minutes)

## Your app is now configured to use REAL NBA data!

All that's left is adding your (free) API key. Here's how:

---

## Step 1: Get API Key (2 minutes)

1. Go to: **https://app.balldontlie.io/auth/signup**
2. Create free account (email + password)
3. Go to **Account Settings → API**
4. Copy your API key
5. Keep it somewhere safe

---

## Step 2: Configure App (1 minute)

1. Open `.env` file in this project
2. Find: `BALLDONTLIE_API_KEY=`
3. Replace with your actual key:
   ```
   BALLDONTLIE_API_KEY=your_api_key_here
   ```
4. Save file

---

## Step 3: Start Backend (1 minute)

```bash
npm run dev:backend
```

Watch for message:
```
NBA Predictor backend running on http://localhost:3001
```

---

## Step 4: Verify Real Data (1 minute)

In a new terminal:

```bash
curl "http://localhost:3001/api/games?date=2025-02-16"
```

Look for: `"_dataSource": "REAL"` ✅

Check logs:
```bash
tail -20 /tmp/backend.log
```

Look for: `[REAL DATA] Fetching games from BallDontLie API` ✅

---

## Done! 🎉

Your NBA Predictor is now using **100% real NBA data**.

---

## Need More Info?

| What | File | Time |
|------|------|------|
| Setup instructions | `REAL_DATA_SETUP.md` | 10 min read |
| Testing guide | `TESTING_REAL_DATA.md` | 10 min read |
| Cost analysis | `API_COSTS.md` | 5 min read |
| Configuration checklist | `REAL_DATA_CHECKLIST.md` | Reference |
| Full overview | `REAL_DATA_README.md` | Reference |

---

## Quick Troubleshooting

### Still seeing [MOCK DATA]?
1. Stop server: `pkill -f "node server/index.js"`
2. Check .env: `grep BALLDONTLIE_API_KEY .env`
3. Restart: `npm run dev:backend`

### API key shows "Unauthorized"?
1. Verify key is correct (copy from BallDontLie account)
2. Make sure you signed up at https://app.balldontlie.io
3. Try generating a new key

### Empty games list?
This is fine! It means no games on that date.
Try a date during NBA season (October-April).

---

## Cost

- **Free Tier:** $0/month (1000+ requests/month)
- **Includes:** Games, stats, odds, everything you need
- **No Credit Card:** Required for free tier

---

## That's It!

You're now using real NBA data. Enjoy! 🏀

**Questions?** Check the documentation files listed above.
