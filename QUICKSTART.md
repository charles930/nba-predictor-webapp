# 🏀 NBA Predictor - Quick Start Guide

Get the app running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Servers
```bash
# Option A: Run both frontend and backend together
npm run dev:all

# Option B: Run separately
npm run dev:frontend  # Terminal 1
npm run dev:backend   # Terminal 2
```

### 3. Open in Browser
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/health

## What You'll See

✅ **Without API Keys** (Default):
- ✓ Games list with mock data
- ✓ Predictions with mock stats
- ✓ All features working
- ✓ Perfect for testing and development

📊 **With API Keys** (Optional):
- Real NBA games
- Real betting odds
- Real team statistics

## Try These

### Browse Games
1. Click the date navigation arrows to browse different dates
2. You'll see 2-3 mock games scheduled

### View Predictions
1. Click on any game card
2. See spread and moneyline predictions
3. View confidence meter (1-10)
4. Read reasoning for each prediction
5. Check factors breakdown (click "Prediction Factors")

### Add API Keys (Optional)
1. Click the ⚙️ settings button (top right)
2. Paste your BallDontLie and/or Odds API keys
3. Click "Test Connections" to verify
4. Click "Save Settings"
5. Refresh to load real data

## Project Structure

```
nba-predictor-webapp/
├── src/
│   ├── components/         React UI components
│   ├── lib/               Core logic (predictor, api)
│   ├── App.jsx            Main app
│   └── main.jsx           Entry point
├── server/
│   └── index.js           Express backend
├── README.md              Full documentation
├── DEPLOYMENT.md          Deployment guide
└── package.json
```

## Common Tasks

### Build for Production
```bash
npm run build
# Creates 'dist' folder with optimized files
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## API Keys (Free)

Want real data? Get free API keys:

**BallDontLie** (NBA Stats)
- URL: https://www.balldontlie.io/
- Free tier: Game stats, schedule, team data
- No credit card needed
- Perfect for development

**The Odds API** (Betting Odds)
- URL: https://the-odds-api.com/
- Free tier: 500 requests/month
- Covers all US sportsbooks
- Gives real moneyline/spread odds

## Troubleshooting

### Backend not connecting
Check if it's running:
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Port already in use
```bash
# Find process on port 5173
lsof -i :5173

# Find process on port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### npm install fails
```bash
# Clear cache and retry
npm cache clean --force
rm package-lock.json
npm install
```

## Next Steps

1. ✅ Run `npm run dev:all` → See it working
2. 📖 Read `README.md` → Learn more features
3. 🔑 Add API keys → Get real data
4. 🚀 Deploy → Use `DEPLOYMENT.md`
5. 🎨 Customize → Edit components and styles

## Need Help?

- 📖 Check `README.md` for detailed docs
- 📋 See `DEPLOYMENT.md` for hosting
- 💬 Check browser console for errors
- 🐛 Common issues in README.md

---

**Happy predicting!** 🏀🎯
