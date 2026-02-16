# 🧪 Testing Real Data Configuration

## Quick Test - Without Real API Keys (Mock Data)

### Test 1: Check Health Endpoint
```bash
curl http://localhost:3001/health
```

Expected output:
```json
{
  "status": "ok",
  "apiStatus": {
    "balldontlie": "NOT SET - using mock data",
    "oddsApi": "NOT SET - using mock data"
  }
}
```

### Test 2: Check Games Endpoint (Returns Mock Data)
```bash
curl "http://localhost:3001/api/games?date=2025-02-16"
```

Expected:
- Returns mock games for Lakers vs Warriors, Celtics vs Heat, etc.
- Response includes `"_dataSource": "MOCK"`
- Server logs show: `[MOCK DATA] No BALLDONTLIE_API_KEY found`

### Test 3: Check Server Logs
```bash
# In a separate terminal, watch the logs
tail -f /tmp/backend.log

# Or check recent logs
tail -50 /tmp/backend.log
```

You should see logs like:
```
[MOCK DATA] No BALLDONTLIE_API_KEY found. Using mock games for 2025-02-16
[ACTION REQUIRED] Set BALLDONTLIE_API_KEY in .env to use real data
```

---

## Full Test - With Real API Key

### Step 1: Get a BallDontLie API Key

1. Go to https://app.balldontlie.io/auth/signup
2. Create a free account (2 minutes)
3. Go to Account Settings → API section
4. Copy your API key

### Step 2: Update .env File

Edit `.env` and add your real API key:
```
BALLDONTLIE_API_KEY=your_actual_key_here
```

### Step 3: Restart Backend Server

```bash
# Kill the current server
pkill -f "node server/index.js"

# Restart it
npm run dev:backend
```

### Step 4: Test with Real Data

```bash
# Test health endpoint
curl http://localhost:3001/health
```

Expected output:
```json
{
  "status": "ok",
  "apiStatus": {
    "balldontlie": "configured ✅",
    "oddsApi": "NOT SET - using mock data"
  }
}
```

### Step 5: Test Games Endpoint (Real Data)

```bash
# Get real games for today (use current date)
curl "http://localhost:3001/api/games?date=2025-02-16"
```

Expected:
- Returns actual NBA games from BallDontLie API
- Response includes `"_dataSource": "REAL"` and `"_apiProvider": "BallDontLie"`
- If no games scheduled for that date, returns empty data array
- Server logs show: `[REAL DATA] Fetching games from BallDontLie API`

### Step 6: Check Server Logs

```bash
tail -50 /tmp/backend.log
```

You should see:
```
[REAL DATA] Fetching games from BallDontLie API for 2025-02-16...
[REAL DATA] Successfully fetched N games from BallDontLie
```

---

## Testing Different Dates

### Find a Date with Games

BallDontLie API returns real game data. Try these dates with high game frequency:

```bash
# February 2025 (current NBA season)
curl "http://localhost:3001/api/games?date=2025-02-15"
curl "http://localhost:3001/api/games?date=2025-02-16"
curl "http://localhost:3001/api/games?date=2025-02-17"

# Current date
curl "http://localhost:3001/api/games?date=$(date +%Y-%m-%d)"
```

**Note:** NBA regular season games are typically played:
- Tuesday through Sunday (Monday off nights are common)
- 7:00 PM - 11:00 PM ET (varies)

---

## Testing Odds Endpoint

### Without API Key (Mock Odds)

```bash
curl "http://localhost:3001/api/odds?homeTeam=LAL&awayTeam=GSW"
```

Returns mock odds with `"_dataSource": "MOCK"`.

### With Real API Key (BallDontLie)

If you have a BallDontLie API key configured, it will attempt to fetch real odds. Note: Odds availability depends on whether games are scheduled.

---

## Performance Testing

### Test 1: Cache Performance

```bash
# First request (no cache) - slow
time curl -s "http://localhost:3001/api/games?date=2025-02-16" > /dev/null

# Second request (cached) - fast
time curl -s "http://localhost:3001/api/games?date=2025-02-16" > /dev/null
```

Expected:
- First request: ~1-2 seconds (with real API) or <100ms (mock)
- Second request: <100ms (cached)
- Subsequent requests within 5 minutes use cache

### Test 2: Concurrent Requests

```bash
# Test rate limiting
for i in {1..5}; do
  curl -s "http://localhost:3001/api/games?date=2025-02-16" > /dev/null &
done
wait
```

Expected: No errors, rate limiting applied server-side.

---

## Troubleshooting

### Problem: Still getting MOCK DATA after configuring key

**Solution:**
1. Stop the backend: `pkill -f "node server/index.js"`
2. Check `.env` has the key: `grep BALLDONTLIE_API_KEY .env`
3. Restart: `npm run dev:backend`
4. Check logs: `tail /tmp/backend.log`

### Problem: API key shows "Unauthorized"

**Solution:**
1. Verify the key is correct (it's from BallDontLie Account Settings)
2. Make sure you signed up at https://app.balldontlie.io (not just visiting)
3. Copy the EXACT key without extra spaces

### Problem: Empty data array returned

**Reasons:**
- No games scheduled for that date (valid response)
- Real data is working correctly!
- Try a date during NBA season (Oct-Apr for regular season)

### Problem: Slow API responses

**This is expected on first load.** The BallDontLie API typically takes 1-2 seconds. After that, data is cached for 5 minutes.

---

## Docker Testing (Optional)

If running in Docker:

```bash
# Inside Docker container
docker exec -it <container-id> curl http://localhost:3001/health
```

---

## Summary

| Data Source | API Key Set | Response Time | Data Freshness | Accuracy |
|------------|---------|---|---|---|
| **MOCK** | No | <100ms | Static | Simulated |
| **REAL (Cached)** | Yes | <100ms | 5 min cache | 100% Live |
| **REAL (Fresh)** | Yes | 1-2s | Live | 100% Live |

---

## Next Steps

1. ✅ Test with mock data (no API key required)
2. ✅ Sign up for BallDontLie API
3. ✅ Add API key to `.env`
4. ✅ Restart backend
5. ✅ Verify real data is flowing
6. 🎉 Predictions are now using REAL NBA data!

---

**Questions?** Check the main `REAL_DATA_SETUP.md` guide for more details.
