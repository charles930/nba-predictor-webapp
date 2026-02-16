# ✅ Real Data Configuration Checklist

This checklist ensures your NBA Predictor is using **REAL data from APIs**, not mock data.

---

## ✅ Step 1: Sign Up for APIs (5-10 minutes)

### BallDontLie API (REQUIRED)
- [ ] Visit https://app.balldontlie.io/auth/signup
- [ ] Create free account (email + password)
- [ ] Check email for verification (if required)
- [ ] Log in to account
- [ ] Navigate to Account Settings → API section
- [ ] Copy API key (long string of characters)
- [ ] Save key somewhere secure (password manager, etc.)

**Cost:** Free (no credit card required)  
**Rate Limit:** 1000+ requests/month (plenty for your app)

### The Odds API (OPTIONAL - Skip if not needed)
- [ ] Visit https://the-odds-api.com/
- [ ] Create free account
- [ ] Get API key from account settings
- [ ] Save key (optional enhancement)

**Cost:** Free (no credit card required)  
**Rate Limit:** 500 requests/month

---

## ✅ Step 2: Configure .env File (2 minutes)

### File Location
```
/home/kindlingai/nba-predictor-webapp/.env
```

### Add BallDontLie API Key
```bash
# Open the .env file in your editor
# Find this line:
BALLDONTLIE_API_KEY=

# Replace with your actual API key:
BALLDONTLIE_API_KEY=your_actual_api_key_from_balldontlie
```

### (Optional) Add The Odds API Key
```bash
# Find this line:
ODDS_API_KEY=

# If you got this key, add it:
ODDS_API_KEY=your_actual_api_key_from_odds_api
```

### Verify Configuration
```bash
# Check that the key was added correctly
grep BALLDONTLIE_API_KEY .env
# Should show: BALLDONTLIE_API_KEY=<your_key>
```

**⚠️ Important:** Never commit `.env` to git! It's already in `.gitignore`.

---

## ✅ Step 3: Restart Backend Server (1 minute)

### Stop Current Server
```bash
# If running, stop it
pkill -f "node server/index.js"
# or use Ctrl+C if running in terminal
```

### Start Backend Server
```bash
cd /home/kindlingai/nba-predictor-webapp
npm run dev:backend
```

### Verify Server Started
```bash
# Should see output like:
# NBA Predictor backend running on http://localhost:3001
# Health check: http://localhost:3001/health
```

---

## ✅ Step 4: Test Real Data (3 minutes)

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```

**Expected output:**
```json
{
  "status": "ok",
  "apiStatus": {
    "balldontlie": "configured ✅",
    "oddsApi": "NOT SET - using mock data"
  }
}
```

✅ If you see "configured ✅" - API key is working!  
❌ If you see "NOT SET" - check your .env file

### Test 2: Get Games (Real Data)
```bash
# Test with today's date
curl "http://localhost:3001/api/games?date=2025-02-16"
```

**Expected output:**
- Returns games from BallDontLie API
- If no games on that date, returns empty `data: []` (valid!)
- Response includes `"_dataSource": "REAL"`

### Test 3: Check Server Logs
```bash
# Watch real-time logs
tail -f /tmp/backend.log

# Or check recent logs
tail -20 /tmp/backend.log
```

**Look for messages like:**
```
[REAL DATA] Fetching games from BallDontLie API...
[REAL DATA] Successfully fetched 5 games from BallDontLie
```

✅ If you see `[REAL DATA]` - **Real data is working!**  
❌ If you still see `[MOCK DATA]` - restart the server

---

## ✅ Step 5: Start Frontend (1 minute)

### Terminal 1: Backend (keep running)
```bash
npm run dev:backend
```

### Terminal 2: Frontend
```bash
npm run dev:frontend
```

### Terminal 3: (Optional) Watch logs
```bash
tail -f /tmp/backend.log
```

### Open in Browser
```
http://localhost:5173
```

---

## ✅ Step 6: Verify Predictions Use Real Data

### In Browser Console (F12)
Look for messages like:
```
✅ [REAL DATA] Games are from BallDontLie API
✅ [REAL DATA] Odds are from The Odds API
[CACHE HIT] Games from cache
```

### On Console (Backend Server)
Should show real data being fetched:
```
[REAL DATA] Fetching games from BallDontLie API for 2025-02-16...
[REAL DATA] Successfully fetched 5 games from BallDontLie
```

---

## 🎉 Success Indicators

### ✅ All Systems Go!

You'll know real data is working when you see:

- [x] Health endpoint shows "configured ✅"
- [x] Games endpoint returns `"_dataSource": "REAL"`
- [x] Server logs show `[REAL DATA]` messages
- [x] Browser console shows real data confirmations
- [x] Games show actual NBA matchups (not mock)
- [x] Scores update in real-time during games

---

## ⚠️ Troubleshooting

### Issue: "Still seeing [MOCK DATA] messages"

**Fix:**
1. Stop server: `pkill -f "node server/index.js"`
2. Check .env: `grep BALLDONTLIE_API_KEY .env` (should not be empty)
3. Restart: `npm run dev:backend`
4. Check logs: `tail /tmp/backend.log`

### Issue: API key shows "Unauthorized"

**Fix:**
1. Verify API key is correct (copy from BallDontLie account settings)
2. Make sure you're logged into https://app.balldontlie.io
3. Check API key hasn't been revoked
4. Try regenerating a new key in account settings

### Issue: Empty games list

**This is not an error!** It means:
- No NBA games scheduled for that date
- Try a date with scheduled games (basketball season: Oct-Apr)
- Or use a recent date: https://balldontlie.io/

### Issue: Server won't start on port 3001

**Fix:**
```bash
# Kill process using port 3001
pkill -f "node server/index.js"

# Or use lsof to find it
lsof -i :3001
# Then kill the PID shown
kill -9 <PID>
```

---

## 📊 API Usage Monitoring

### Check Your Usage

**BallDontLie Dashboard:**
1. Log in to https://app.balldontlie.io
2. Go to Account Settings → API section
3. See your "Requests This Month" counter
4. Free tier allows 1000+ requests/month

**Expected Usage:**
- Normal app usage: 300-500 requests/month
- Free tier limit: 1000+ requests/month
- You'll likely use < 50% of your free allowance

---

## 🚀 Next Steps

1. ✅ Sign up for BallDontLie API
2. ✅ Add API key to .env
3. ✅ Restart backend server
4. ✅ Run the tests above
5. ✅ Verify [REAL DATA] messages in logs
6. 🎉 **Enjoy real NBA predictions!**

---

## 📝 Keeping Track

Once you complete this checklist:

### Save This Info
```
API Key Status: ✅ Configured
Data Source: REAL NBA Data
Backend Port: 3001
Frontend Port: 5173
Cache Duration: 5 minutes
Monthly API Quota: 1000+ requests
```

### Monthly Check-In
- [ ] Check API usage: https://app.balldontlie.io
- [ ] Verify logs show [REAL DATA] messages
- [ ] Ensure predictions are accurate
- [ ] Monitor performance

---

## ✅ Final Checklist

- [ ] BallDontLie API signed up
- [ ] API key obtained
- [ ] .env file updated with API key
- [ ] Backend server restarted
- [ ] Health check passes
- [ ] Games endpoint returns real data
- [ ] Server logs show [REAL DATA]
- [ ] Frontend starts correctly
- [ ] Browser console confirms real data
- [ ] Predictions show real NBA games

**If all boxes are checked: ✅ You're done!**

---

**Status:** Ready for Real NBA Data  
**Last Updated:** February 2025  
**Maintain:** Check monthly that API quota looks good
